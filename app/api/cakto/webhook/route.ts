import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/api-admin"
import { type PlanId, planMeets } from "@/lib/app-data"
import { resolveCaktoOfferFromText } from "@/lib/cakto"
import { findProfileUserIdByEmail, pushProfileNotification } from "@/lib/profile-notifications"

export const runtime = "nodejs"

const PURCHASE_NOTIFICATION_EMAIL = "marinhojose1103@gmail.com"

const getObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}

const collectStrings = (value: unknown, output: string[] = []) => {
  if (typeof value === "string") {
    output.push(value)
    return output
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, output))
    return output
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectStrings(item, output))
  }

  return output
}

const findStringByKeys = (value: unknown, keys: string[]): string => {
  if (!value || typeof value !== "object") return ""

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findStringByKeys(item, keys)
      if (found) return found
    }
    return ""
  }

  const record = value as Record<string, unknown>
  for (const [key, item] of Object.entries(record)) {
    const normalizedKey = key.toLowerCase()
    if (keys.some((candidate) => normalizedKey.includes(candidate)) && typeof item === "string") {
      return item
    }
  }

  for (const item of Object.values(record)) {
    const found = findStringByKeys(item, keys)
    if (found) return found
  }

  return ""
}

const getHeaderSecret = (request: NextRequest) => {
  const authorization = request.headers.get("authorization") ?? ""
  const bearerToken = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7).trim() : ""

  return (
    request.headers.get("x-cakto-webhook-secret") ??
    request.headers.get("x-cakto-secret") ??
    request.headers.get("x-webhook-secret") ??
    request.headers.get("x-signature") ??
    bearerToken ??
    ""
  )
}

const getBodySecret = (payload: unknown) => {
  const body = getObject(payload)
  return String(
    body.secret ??
      body.webhook_secret ??
      body.webhookSecret ??
      body.secret_key ??
      body.secretKey ??
      body.token ??
      ""
  )
}

const isAuthorizedWebhook = (request: NextRequest, payload: unknown) => {
  const expectedSecret = process.env.CAKTO_WEBHOOK_SECRET

  if (!expectedSecret) {
    console.error("CAKTO_WEBHOOK_SECRET is not configured.")
    return false
  }

  const providedSecret =
    request.nextUrl.searchParams.get("secret") ??
    request.nextUrl.searchParams.get("token") ??
    getHeaderSecret(request) ??
    getBodySecret(payload)

  return providedSecret === expectedSecret
}

const getEventStatus = (payload: unknown) => {
  const explicitStatus = findStringByKeys(payload, ["event", "status", "type"])
  return explicitStatus || collectStrings(payload).join(" ")
}

const isApprovedEvent = (statusText: string) => {
  const normalized = statusText.toLowerCase()
  return [
    "purchase_approved",
    "payment_approved",
    "payment.approved",
    "paid",
    "approved",
    "aprovado",
    "pagamento aprovado",
  ].some((item) => normalized.includes(item))
}

const isDowngradeEvent = (statusText: string) => {
  const normalized = statusText.toLowerCase()
  return [
    "subscription_canceled",
    "subscription.cancelled",
    "subscription_cancelled",
    "renewal_refused",
    "payment_refused",
    "payment_failed",
    "chargeback",
    "refund",
    "refunded",
    "canceled",
    "cancelled",
    "cancelado",
    "recusado",
    "reembolsado",
  ].some((item) => normalized.includes(item))
}

const getCustomerEmail = (payload: unknown) =>
  findStringByKeys(payload, ["email", "customer_email", "buyer_email", "client_email"]).trim().toLowerCase()

const formatPurchaseDate = (payload: unknown) => {
  const rawDate = findStringByKeys(payload, ["paid_at", "approved_at", "created_at", "createdat", "date"])
  const date = rawDate ? new Date(rawDate) : new Date()
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date()

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Recife",
    dateStyle: "short",
    timeStyle: "short",
  }).format(safeDate)
}

const getRedeemWindow = () => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 3)
  return expiresAt.toISOString()
}

const notifyPurchase = async ({
  supabase,
  eventId,
  email,
  plan,
  billing,
  purchasedAt,
}: {
  supabase: ReturnType<typeof getSupabaseAdmin>
  eventId: string
  email: string
  plan: string
  billing: string
  purchasedAt: string
}) => {
  const inboxUserId = await findProfileUserIdByEmail(supabase, PURCHASE_NOTIFICATION_EMAIL)
  if (!inboxUserId) return

  await pushProfileNotification(supabase, inboxUserId, {
    id: eventId,
    userId: inboxUserId,
    title: `Nova compra: ${plan}`,
    message: `Data de compra: ${purchasedAt}. E-mail: ${email || "não informado"}. Plano: ${plan}. Cobrança: ${billing}.`,
    kind: "system",
    createdAt: new Date().toISOString(),
    read: false,
  })
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null)

  if (!payload || !isAuthorizedWebhook(request, payload)) {
    return NextResponse.json({ error: "Webhook Cakto não autorizado." }, { status: 401 })
  }

  const statusText = getEventStatus(payload)
  const searchableText = collectStrings(payload).join(" ")
  const offer = resolveCaktoOfferFromText(searchableText)
  const email = getCustomerEmail(payload)

  if (!email) {
    return NextResponse.json({ error: "Webhook sem e-mail do comprador." }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,plan,appearance_theme")
    .eq("email", email)
    .maybeSingle()

  if (profileError) {
    console.error("Cakto webhook profile lookup failed", profileError)
    return NextResponse.json({ error: "Não foi possível localizar o perfil." }, { status: 500 })
  }

  if (!profile?.id) {
    await notifyPurchase({
      supabase,
      eventId: `cakto-unmatched-${crypto.randomUUID()}`,
      email,
      plan: offer?.plan ?? "não identificado",
      billing: offer?.billing ?? "não identificado",
      purchasedAt: formatPurchaseDate(payload),
    })
    return NextResponse.json({ received: true, warning: "Comprador sem conta correspondente na Mallow." })
  }

  const eventId = `cakto-${findStringByKeys(payload, ["id", "transaction", "sale"]) || crypto.randomUUID()}`
  const purchasedAt = formatPurchaseDate(payload)

  if (isApprovedEvent(statusText)) {
    if (!offer) {
      return NextResponse.json({ error: "Plano Cakto não identificado no webhook." }, { status: 400 })
    }

    const currentPlan = (profile.plan as PlanId | undefined) ?? "free"
    const nextPlan = planMeets(currentPlan, offer.plan) ? currentPlan : offer.plan
    const appearanceTheme = getObject(profile.appearance_theme)

    const patchPayload: Record<string, unknown> = {
      plan: nextPlan,
      subscription_tier: nextPlan === "pro" ? "pro" : nextPlan === "essential" ? "essential" : "starter",
      subscription_status: "active",
      appearance_theme: {
        ...appearanceTheme,
        __billing: {
          provider: "cakto",
          billing: offer.billing,
          checkoutCode: offer.code,
          lastPaymentAt: new Date().toISOString(),
        },
      },
    }

    if (nextPlan === "pro") {
      patchPayload.creative_cloud_redeem_available_until = getRedeemWindow()
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(patchPayload)
      .eq("id", profile.id)

    if (updateError) {
      console.error("Cakto webhook profile update failed", updateError)
      return NextResponse.json({ error: "Não foi possível liberar o plano." }, { status: 500 })
    }

    await notifyPurchase({
      supabase,
      eventId,
      email,
      plan: offer.plan,
      billing: offer.billing,
      purchasedAt,
    })

    return NextResponse.json({ received: true, plan: offer.plan, billing: offer.billing })
  }

  if (isDowngradeEvent(statusText)) {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: "free",
        subscription_tier: "starter",
        subscription_status: "canceled",
      })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Cakto webhook downgrade failed", updateError)
      return NextResponse.json({ error: "Não foi possível rebaixar o plano." }, { status: 500 })
    }

    return NextResponse.json({ received: true, plan: "free" })
  }

  return NextResponse.json({ received: true, ignored: true })
}
