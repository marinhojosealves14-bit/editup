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

    const { email } = schema.parse(await request.json().catch(() => ({})))
    const authenticated = request.headers.get("authorization")?.startsWith("Bearer ")
      ? await requireAdminAuthenticatedUser(request)
      : null
    const normalizedEmail = (email ?? authenticated?.user.email ?? "").toLowerCase()

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const state = await readEditUpState()

    const alreadyClaimedTrial = state.freeTrialClaimedEmails.includes(normalizedEmail)

    if (!alreadyClaimedTrial) {
      state.freeTrialClaimedEmails.push(normalizedEmail)
      await writeEditUpState(state)
    }

    if (authenticated) {
      const startedAt = new Date()
      const endsAt = new Date(startedAt)
      endsAt.setDate(endsAt.getDate() + TRIAL_DAYS)

      const { data: profile, error: profileError } = await authenticated.supabase
        .from("profiles")
        .select("appearance_theme,subscription_status")
        .eq("id", authenticated.user.id)
        .maybeSingle()

      if (profileError) {
        return NextResponse.json({ error: "Não foi possível iniciar o teste grátis." }, { status: 500 })
      }

      const appearanceTheme = getObject(profile?.appearance_theme)
      const existingAccount = getObject(appearanceTheme.__account)
      const existingTrial = getObject(existingAccount.trial)

      if (profile?.subscription_status === "trialing" && typeof existingTrial.endsAt === "string") {
        return NextResponse.json({
          ...getFreeTrialStatus(state.freeTrialClaimedEmails.length),
          trial: { endsAt: existingTrial.endsAt },
        })
      }

      if (alreadyClaimedTrial) {
        return NextResponse.json({ error: "Este email já usou o teste grátis de 15 dias." }, { status: 403 })
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
        return NextResponse.json({ error: "Não foi possível iniciar o teste grátis." }, { status: 500 })
      }

      return NextResponse.json({
        ...getFreeTrialStatus(state.freeTrialClaimedEmails.length),
        trial: { endsAt: endsAt.toISOString() },
      })
    }

    return NextResponse.json(getFreeTrialStatus(state.freeTrialClaimedEmails.length))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }
    return NextResponse.json({ error: "Could not update free trial status." }, { status: 500 })
  }
}
