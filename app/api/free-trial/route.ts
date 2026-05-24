import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getFreeTrialStatus, readEditUpState, writeEditUpState } from "@/lib/editup-state"
import { enforceRateLimit, ensureTrustedOrigin } from "@/lib/security"
import { requireAdminAuthenticatedUser } from "@/lib/api-admin"
import { TRIAL_DAYS } from "@/lib/app-data"

export const runtime = "nodejs"

export async function GET() {
  const state = await readEditUpState()
  return NextResponse.json(getFreeTrialStatus(state.freeTrialClaimedEmails.length))
}

const schema = z.object({
  email: z.string().trim().email().optional(),
})

const getObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}

export async function POST(request: NextRequest) {
  try {
    const originError = ensureTrustedOrigin(request)
    if (originError) return originError
    const rateLimitError = enforceRateLimit(request, { scope: "free-trial:post", max: 30 })
    if (rateLimitError) return rateLimitError

    schema.parse(await request.json().catch(() => ({})))
    const authenticated = await requireAdminAuthenticatedUser(request)
    const normalizedEmail = (authenticated.user.email ?? "").trim().toLowerCase()

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Não foi possível identificar seu e-mail." }, { status: 400 })
    }

    const state = await readEditUpState()

    const alreadyClaimedTrial = state.freeTrialClaimedEmails.includes(normalizedEmail)

    const startedAt = new Date()
    const endsAt = new Date(startedAt)
    endsAt.setDate(endsAt.getDate() + TRIAL_DAYS)

    const { data: profile, error: profileError } = await authenticated.supabase
      .from("profiles")
      .select("appearance_theme,subscription_status")
      .eq("id", authenticated.user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Free trial profile lookup failed:", profileError)
      return NextResponse.json({ error: "Não foi possível iniciar o teste grátis." }, { status: 500 })
    }

    if (!profile) {
      const fallbackName =
        typeof authenticated.user.user_metadata?.name === "string" && authenticated.user.user_metadata.name.trim()
          ? authenticated.user.user_metadata.name.trim()
          : normalizedEmail.split("@")[0] || "Editor"

      const { error: insertError } = await authenticated.supabase
        .from("profiles")
        .insert({
          id: authenticated.user.id,
          email: normalizedEmail,
          full_name: fallbackName,
          contact_value: normalizedEmail,
          plan: "free",
          subscription_tier: "starter",
          subscription_status: "none",
        })

      if (insertError) {
        console.error("Free trial profile insert failed:", insertError)
        return NextResponse.json({ error: "Não foi possível iniciar o teste grátis." }, { status: 500 })
      }
    }

    const currentSubscriptionStatus = profile?.subscription_status ?? "none"
    const appearanceTheme = getObject(profile?.appearance_theme)
    const existingAccount = getObject(appearanceTheme.__account)
    const existingTrial = getObject(existingAccount.trial)

    if (currentSubscriptionStatus === "active") {
      return NextResponse.json({ error: "Sua conta já possui um plano ativo." }, { status: 400 })
    }

    if (currentSubscriptionStatus === "trialing" && typeof existingTrial.endsAt === "string") {
      return NextResponse.json({
        ...getFreeTrialStatus(state.freeTrialClaimedEmails.length),
        trial: { endsAt: existingTrial.endsAt },
      })
    }

    if (alreadyClaimedTrial && typeof existingTrial.endsAt === "string") {
      return NextResponse.json({ error: "Este e-mail já usou o teste grátis de 15 dias." }, { status: 403 })
    }

    const nextAppearanceTheme = {
      ...appearanceTheme,
      __account: {
        ...existingAccount,
        trial: {
          startedAt: startedAt.toISOString(),
          endsAt: endsAt.toISOString(),
        },
      },
    }

    const { error: updateError } = await authenticated.supabase
      .from("profiles")
      .update({
        plan: "essential",
        subscription_tier: "essential",
        subscription_status: "trialing",
        appearance_theme: nextAppearanceTheme,
      })
      .eq("id", authenticated.user.id)

    if (updateError) {
      console.error("Free trial profile update failed:", updateError)
      return NextResponse.json({ error: "Não foi possível iniciar o teste grátis." }, { status: 500 })
    }

    if (!alreadyClaimedTrial) {
      state.freeTrialClaimedEmails.push(normalizedEmail)
      try {
        await writeEditUpState(state)
      } catch (stateError) {
        console.error("Could not persist local free trial state", stateError)
      }
    }

    return NextResponse.json({
      ...getFreeTrialStatus(state.freeTrialClaimedEmails.length),
      trial: { endsAt: endsAt.toISOString() },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Não foi possível identificar seu e-mail." }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : ""
    return NextResponse.json(
      { error: message === "Não autenticado." ? "Faça login para iniciar o teste grátis." : "Não foi possível iniciar o teste grátis." },
      { status: message === "Não autenticado." ? 401 : 500 }
    )
  }
}
