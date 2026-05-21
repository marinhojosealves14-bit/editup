"use client"

import Link from "next/link"
import { Check, Sparkles, X } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const plans = [
  {
    id: "starter",
    name: "Starter",
    monthly: "R$19,90",
    annual: "R$200,00",
    description: "Limitado para começar sem operar tudo ainda.",
    features: ["Agenda e clientes", "Página profissional", "Marketplace para visualização"],
    unavailable: ["Financeiro completo", "Download no Marketplace", "Aprovação sem marca", "Google Drive"],
  },
  {
    id: "essential",
    name: "Essential",
    monthly: "R$39,90",
    annual: "R$400,00",
    description: "Melhor custo-benefício para operar com clientes.",
    features: ["Tudo do Starter", "CRM + Financeiro", "Download no Marketplace", "Aprovação sem marca", "Google Drive"],
    unavailable: ["Creative Cloud", "Marketplace com destaque"],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    monthly: "R$59,90",
    annual: "R$600,00",
    description: "Para quem quer benefício premium e escala.",
    features: ["Tudo do Essential", "Creative Cloud", "Logo personalizada", "Marketplace com destaque"],
    unavailable: [],
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-y border-[#e3e9ef] bg-white px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1360px]">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42 }}
          className="mx-auto max-w-[760px] text-center"
        >
          <p className="text-[15px] font-semibold tracking-[-0.04em] text-[#62bd36]">Decisão simples</p>
          <h2 className="mt-5 text-[44px] font-semibold leading-[1.04] tracking-[-0.075em] text-[#254342] sm:text-[64px]">
            Escolha o nível da sua operação.
          </h2>
          <p className="mx-auto mt-6 max-w-[620px] text-[19px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
            Ative 15 dias grátis do Essential. Depois, assine para manter CRM, propostas, financeiro e aprovações liberados.
          </p>
        </motion.div>

        <Tabs defaultValue="monthly" className="mt-10 items-center">
          <TabsList className="border border-[#e3e9ef] bg-[#f6fafb]">
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="annual">Anual</TabsTrigger>
          </TabsList>
          {(["monthly", "annual"] as const).map((billing) => (
            <TabsContent key={billing} value={billing} className="mt-8 w-full">
              <div className="grid gap-5 md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-[18px] border p-7 ${
                      plan.highlighted
                        ? "border-[#9de96c] bg-[#f5ffef] shadow-[0_24px_70px_rgba(157,233,108,0.22)]"
                        : "border-[#e3e9ef] bg-white"
                    }`}
                  >
                    {plan.highlighted && (
                      <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-[#9de96c] px-3 py-1 text-xs font-semibold text-[#21351f]">
                        <Sparkles className="h-3 w-3" />
                        Melhor custo-benefício
                      </span>
                    )}
                    <h3 className="text-[24px] font-semibold tracking-[-0.055em] text-[#254342]">{plan.name}</h3>
                    <p className="mt-3 min-h-12 text-[15px] font-medium leading-7 tracking-[-0.035em] text-[#667085]">{plan.description}</p>
                    <div className="mt-6">
                      <span className="text-[44px] font-semibold tracking-[-0.075em] text-[#254342]">
                        {billing === "monthly" ? plan.monthly : plan.annual}
                      </span>
                      <span className="text-sm font-medium text-[#667085]">{billing === "monthly" ? "/mês" : "/ano"}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-[15px] font-medium tracking-[-0.035em] text-[#254342]">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5f9f38]" />
                          {feature}
                        </li>
                      ))}
                      {plan.unavailable.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-[15px] font-medium tracking-[-0.035em] text-[#8b98aa]">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-[#d04f4f]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/cadastro?plan=${plan.id}`} className="mt-7 block">
                      <Button className={`h-12 w-full rounded-full ${plan.highlighted ? "bg-[#9de96c] text-[#21351f] hover:bg-[#8bdd5c]" : "bg-[#254342] text-white hover:bg-[#9de96c] hover:text-[#21351f]"}`}>
                        {plan.highlighted ? "Escolher Essential" : "Escolher plano"}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
