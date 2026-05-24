import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { planMeets, type PlanId, type SubscriptionStatus } from "@/lib/app-data"
import { requireAdminAuthenticatedUser } from "@/lib/api-admin"
import { getCaktoOffer } from "@/lib/cakto"
import { enforceRateLimit, ensureTrustedOrigin } from "@/lib/security"

export const runtime = "nodejs"

const checkoutSchema = z.object({
  plan: z.enum(["starter", "essential", "pro"]),
  billing: z.enum(["monthly", "annual"]).default("monthly"),
})

export async function POST(request: NextRequest) {
  try {
    const originError = ensureTrustedOrigin(request)
    if (originError) return originError
    const rateLimitError = enforceRateLimit(request, { scope: "cakto-checkout:post", max: 30 })
    if (rateLimitError) return rateLimitError

    const { supabase, user } = await requireAdminAuthenticatedUser(request)
    const { plan, billing } = checkoutSchema.parse(await request.json().catch(() => ({})))
    const offer = getCaktoOffer(plan, billing)

    if (!offer) {
      return NextResponse.json({ error: "Checkout Cakto não configurado para este plano." }, { status: 400 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("plan,subscription_status")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Cakto checkout plan lookup failed:", profileError)
      return NextResponse.json({ error: "Não foi possível validar seu plano." }, { status: 500 })
    }

    const currentPlan = (profile?.plan as PlanId | undefined) ?? "free"
    const currentSubscriptionStatus = (profile?.subscription_status as SubscriptionStatus | undefined) ?? "none"

    if (currentSubscriptionStatus === "active" && planMeets(currentPlan, plan)) {
      return NextResponse.json({ error: "Esse plano já está liberado para sua conta." }, { status: 400 })
    }

    return NextResponse.json({ url: offer.checkoutUrl })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Plano inválido." }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Erro ao criar checkout."
    return NextResponse.json(
      { error: message === "Não autenticado." ? message : "Erro ao criar checkout." },
      { status: message === "Não autenticado." ? 401 : 500 }
    )
  }
}
