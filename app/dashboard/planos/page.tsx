"use client"

import { useState } from "react"
import { Check, Crown, ShieldCheck, Sparkles, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PLAN_LABELS, PlanId, planMeets } from "@/lib/app-data"
import { useAppSession } from "@/components/app/app-provider"
import { authFetch } from "@/lib/supabase"
import { cn } from "@/lib/utils"

const plans: Array<{
  id: PlanId
  name: string
  monthlyPrice: string
  annualPrice: string
  description: string
  features: string[]
  unavailable?: string[]
  popular?: boolean
  pro?: boolean
}> = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: "R$ 19,90",
    annualPrice: "R$ 200,00",
    description: "Para começar limitado, sem liberar a operação completa.",
    features: [
      "Agenda e clientes",
      "Página profissional",
      "Aprovação com marca Mallow",
      "Marketplace apenas visualização",
    ],
    unavailable: [
      "Financeiro e CRM completos",
      "Download no Marketplace",
      "Aprovação sem marca",
      "Google Drive",
    ],
  },
  {
    id: "essential",
    name: "Essential",
    monthlyPrice: "R$ 39,90",
    annualPrice: "R$ 400,00",
    description: "Para operar como profissional com CRM, financeiro e downloads liberados.",
    features: [
      "Tudo do Starter",
      "Aprovação sem marca d'água",
      "Download no Marketplace",
      "Financeiro e CRM liberados",
      "Drive e links de aprovação",
    ],
    unavailable: [
      "Creative Cloud",
      "Marketplace com destaque",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: "R$ 59,90",
    annualPrice: "R$ 600,00",
    description: "Para quem quer benefício externo e controle premium de licença.",
    features: [
      "Tudo do Essential",
      "Customização de logo na aprovação",
      "Marketplace com destaque",
      "Relatórios avançados",
      "Resgate da Creative Cloud",
    ],
    unavailable: [],
    pro: true,
  },
]

export default function PlanosPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly")
  const [isStartingTrial, setIsStartingTrial] = useState(false)
  const [message, setMessage] = useState("")
  const { currentUser, refreshCurrentUser } = useAppSession()

  if (!currentUser) return null

  const handlePlanChange = async (planId: PlanId) => {
    if (planId === "free") return
    if (currentUser.subscriptionStatus === "active" && planId === currentUser.plan) return
    if (currentUser.subscriptionStatus === "active" && planMeets(currentUser.plan, planId)) {
      setMessage("Esse plano já está liberado para sua conta.")
      return
    }

    const selectedKey = `${planId}:${billing}`
    setSelectedPlan(selectedKey)
    setMessage("")

    const response = await authFetch("/api/cakto/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan: planId,
        billing,
      }),
    })

    const data = (await response.json()) as { url?: string; error?: string }

    if (!response.ok || !data.url) {
      setMessage(data.error ?? "Não foi possível iniciar o checkout.")
      setSelectedPlan(null)
      return
    }

    window.location.href = data.url
  }

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true)
      setMessage("")
      const response = await authFetch("/api/free-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const payload = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível iniciar o teste grátis.")
      }
      await refreshCurrentUser()
      setMessage("Teste grátis de 15 dias ativado.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível iniciar o teste grátis.")
    } finally {
      setIsStartingTrial(false)
    }
  }

  const hasActivePaidSubscription = currentUser.subscriptionStatus === "active"

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Planos e cobrança</h1>
        <p className="mt-1 text-muted-foreground">Controle de acesso por tiers para a sua operação de edição.</p>
        {message && <p className="mt-2 text-sm text-destructive">{message}</p>}
      </div>

      <div className="inline-flex rounded-[10px] border border-border bg-card p-1">
        {[
          { id: "monthly" as const, label: "Mensal" },
          { id: "annual" as const, label: "Anual" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setBilling(item.id)}
            className={cn(
              "rounded-[8px] px-4 py-2 text-sm font-semibold transition-colors",
              billing === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card className="border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Crown className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Plano atual: {PLAN_LABELS[currentUser.plan]}</h3>
            <p className="text-sm text-muted-foreground">
              Status da assinatura: {currentUser.subscriptionStatus === "active" ? "ativa" : currentUser.subscriptionStatus ?? "sem assinatura ativa"}.
            </p>
          </div>
          </div>
          {(currentUser.plan === "free" || currentUser.plan === "starter") && currentUser.subscriptionStatus !== "active" ? (
            <Button onClick={() => void handleStartTrial()} disabled={isStartingTrial}>
              {isStartingTrial ? "Liberando..." : "Ativar 15 dias grátis"}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative border-border bg-card transition-all ${
              plan.popular ? "ring-2 ring-primary" : ""
            } ${plan.pro ? "bg-[radial-gradient(circle_at_top_right,rgba(157,233,108,0.14),transparent_35%),var(--card)]" : ""} ${selectedPlan === plan.id ? "border-primary" : ""}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  Recomendado
                </span>
              </div>
            )}
            {plan.pro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="flex items-center gap-1 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Licença Pro
                </span>
              </div>
            )}
            {hasActivePaidSubscription && currentUser.plan === plan.id && (
              <div className="absolute -top-3 right-4">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">Plano atual</span>
              </div>
            )}
            <CardHeader className="pt-8">
              <CardTitle className="text-xl text-foreground">{plan.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-foreground">
                  {billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
                </span>
                <span className="text-muted-foreground">{billing === "monthly" ? "/mês" : "/ano"}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
                {(plan.unavailable ?? []).map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
                      <X className="h-3 w-3 text-destructive" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {hasActivePaidSubscription && currentUser.plan === plan.id ? (
                <Button className="w-full" variant="outline" disabled>Plano atual</Button>
              ) : (
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={selectedPlan === `${plan.id}:${billing}`}
                >
                  {selectedPlan === `${plan.id}:${billing}` ? "Abrindo checkout..." : `Assinar ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Regras automáticas</CardTitle>
          <CardDescription className="text-muted-foreground">O acesso é liberado pelo webhook da Cakto e rebaixado para Starter se a assinatura deixar de ficar ativa.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
