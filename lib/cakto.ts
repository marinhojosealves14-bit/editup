import type { PlanId } from "@/lib/app-data"

export type CaktoBillingCycle = "monthly" | "annual"
export type PaidPlanId = Exclude<PlanId, "free">

export type CaktoOffer = {
  plan: PaidPlanId
  billing: CaktoBillingCycle
  checkoutUrl: string
  code: string
  label: string
}

export const CAKTO_OFFERS: CaktoOffer[] = [
  {
    plan: "starter",
    billing: "monthly",
    checkoutUrl: "https://pay.cakto.com.br/3d4tbj2_898056",
    code: "3d4tbj2_898056",
    label: "Mallow INC - Ass. Starter Mensal",
  },
  {
    plan: "starter",
    billing: "annual",
    checkoutUrl: "https://pay.cakto.com.br/3frtcnj",
    code: "3frtcnj",
    label: "Mallow INC - Ass. Starter Anual",
  },
  {
    plan: "essential",
    billing: "monthly",
    checkoutUrl: "https://pay.cakto.com.br/t4mcge5",
    code: "t4mcge5",
    label: "Mallow INC - Ass. Essential Mensal",
  },
  {
    plan: "essential",
    billing: "annual",
    checkoutUrl: "https://pay.cakto.com.br/fadmqdc",
    code: "fadmqdc",
    label: "Mallow INC - Ass. Essential Anual",
  },
  {
    plan: "pro",
    billing: "monthly",
    checkoutUrl: "https://pay.cakto.com.br/38qgeeo",
    code: "38qgeeo",
    label: "Mallow INC - Ass. Pro Mensal",
  },
  {
    plan: "pro",
    billing: "annual",
    checkoutUrl: "https://pay.cakto.com.br/3ebc897",
    code: "3ebc897",
    label: "Mallow INC - Ass. Pro Anual",
  },
]

export const getCaktoOffer = (plan: PaidPlanId, billing: CaktoBillingCycle) =>
  CAKTO_OFFERS.find((offer) => offer.plan === plan && offer.billing === billing) ?? null

export const resolveCaktoOfferFromText = (text: string) => {
  const normalized = text.toLowerCase()
  const byCode = CAKTO_OFFERS.find((offer) => normalized.includes(offer.code.toLowerCase()))
  if (byCode) return byCode

  const plan = normalized.includes("pro")
    ? "pro"
    : normalized.includes("essential")
      ? "essential"
      : normalized.includes("starter")
        ? "starter"
        : null

  if (!plan) return null

  const billing = normalized.includes("anual") || normalized.includes("annual") || normalized.includes("year")
    ? "annual"
    : "monthly"

  return getCaktoOffer(plan, billing)
}
