"use client"

import { ArrowRight, BadgeCheck, Boxes, CreditCard, FileText, FolderKanban, Link2, MessageCircle, ShieldCheck, UserRoundCheck, Wallet } from "lucide-react"
import { motion } from "framer-motion"

const featureColumns = [
  {
    title: "Clientes 360",
    description: "Perfil, histórico, pasta do Drive e links ativos no mesmo lugar.",
    icon: UserRoundCheck,
  },
  {
    title: "Produção em etapas",
    description: "Agenda e kanban para saber o que está parado, editando ou aguardando.",
    icon: FolderKanban,
  },
  {
    title: "Propostas",
    description: "Orçamentos com presets, ajustes manuais e link profissional.",
    icon: FileText,
  },
  {
    title: "Aprovação limpa",
    description: "Cliente comenta, aprova e acompanha versões sem depender do WhatsApp.",
    icon: Link2,
  },
]

const workflowCards = [
  { title: "Receita prevista", subtitle: "Projetos aceitos entram no financeiro.", icon: Wallet },
  { title: "Recursos", subtitle: "Packs, marketplace e materiais para editores.", icon: Boxes },
  { title: "Pagamentos", subtitle: "Planos, teste grátis e upgrade sem fricção.", icon: CreditCard },
]

const testimonials = [
  {
    name: "Murilo Santos",
    role: "Editor de Reels",
    text: "O melhor é abrir o board e saber exatamente quem está em aprovação, quem precisa revisar e onde está o material.",
    avatar: "MS",
  },
  {
    name: "mori",
    role: "Motion editor",
    text: "Era difícil conciliar tantas coisas e se organizar sem um site assim.",
    avatar: "MO",
  },
  {
    name: "Beto Shorts",
    role: "Creator",
    text: "A entrega ficou mais profissional. Eu recebo link, comento no ponto certo e aprovo sem confusão.",
    avatar: "BS",
  },
]

const contrastCards = [
  { title: "WhatsApp", description: "Feedback perdido e aprovação sem histórico.", icon: MessageCircle },
  { title: "Drive", description: "Arquivos soltos sem contexto de cliente.", icon: Link2 },
  { title: "Planilha", description: "Receita prevista sempre atrasada.", icon: Wallet },
  { title: "Mallow", description: "Tudo vira fluxo, status e próximo passo.", icon: BadgeCheck },
]

export function Features() {
  return (
    <>
      <section id="pain" className="border-b border-[#e3e9ef] bg-white">
        <div className="mx-auto grid max-w-[1360px] grid-cols-1 border-x border-[#e3e9ef] md:grid-cols-4">
          {featureColumns.map((feature, index) => (
            <FadeUp key={feature.title} delay={index * 0.04}>
              <article className="min-h-[330px] border-b border-[#e3e9ef] px-8 py-12 transition-transform duration-300 hover:-translate-y-1 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="mb-9 h-16 border-l-4 border-[#9de96c] pl-6">
                  <feature.icon className="h-7 w-7 text-[#254342]" />
                </div>
                <h3 className="text-[24px] font-semibold tracking-[-0.055em] text-[#254342]">{feature.title}</h3>
                <p className="mt-5 max-w-[260px] text-[16px] font-medium leading-7 tracking-[-0.035em] text-[#667085]">{feature.description}</p>
              </article>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="features" className="relative overflow-hidden border-b border-[#e3e9ef] bg-[#f6fafb]">
        <div className="absolute inset-0 bg-[radial-gradient(#dfe8ef_1px,transparent_1px)] [background-size:14px_14px] opacity-75" />
        <div className="relative mx-auto max-w-[1360px] border-x border-[#e3e9ef] px-5 py-24 sm:px-8 lg:py-32">
          <FadeUp>
            <div className="mx-auto max-w-[760px] text-center">
              <span className="inline-flex rounded-full border border-[#dfe7ee] bg-white px-4 py-2 text-[14px] font-semibold tracking-[-0.035em] text-[#254342]">
                Operação
              </span>
              <h2 className="mt-8 text-balance text-[44px] font-semibold leading-[1.03] tracking-[-0.075em] text-[#254342] sm:text-[64px]">
                Tudo flui do primeiro cliente até a aprovação final.
              </h2>
              <p className="mx-auto mt-6 max-w-[620px] text-[20px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
                A Mallow conecta CRM, propostas, produção, financeiro e Drive sem deixar o editor montar a operação na mão.
              </p>
            </div>
          </FadeUp>

          <div className="mt-16 grid gap-5 lg:grid-cols-3">
            {workflowCards.map((card, index) => (
              <FadeUp key={card.title} delay={index * 0.06}>
                <article className="rounded-[18px] border border-[#e3e9ef] bg-white p-7 shadow-[0_20px_60px_rgba(37,67,66,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(37,67,66,0.09)]">
                  <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#edfbe6] text-[#254342]">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-[25px] font-semibold tracking-[-0.055em] text-[#254342]">{card.title}</h3>
                  <p className="mt-3 text-[16px] font-medium leading-7 tracking-[-0.035em] text-[#667085]">{card.subtitle}</p>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="border-b border-[#e3e9ef] bg-white">
        <div className="mx-auto grid max-w-[1360px] gap-0 border-x border-[#e3e9ef] lg:grid-cols-[0.9fr_1.1fr]">
          <FadeUp>
            <div className="h-full border-b border-[#e3e9ef] p-8 lg:border-b-0 lg:border-r lg:p-16">
              <p className="text-[15px] font-semibold tracking-[-0.04em] text-[#62bd36]">Antes vs Depois</p>
              <h2 className="mt-6 text-[44px] font-semibold leading-[1.04] tracking-[-0.075em] text-[#254342] sm:text-[62px]">
                Do caos no WhatsApp para um fluxo rastreável.
              </h2>
              <p className="mt-6 max-w-[520px] text-[19px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
                O cliente vê um processo profissional. Você vê cada entrega, prazo, revisão, pagamento e arquivo.
              </p>
              <a href="/cadastro" className="group mt-9 inline-flex items-center gap-2 rounded-full bg-[#9de96c] px-6 py-4 text-[16px] font-semibold tracking-[-0.04em] text-[#21351f] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8bdd5c] hover:shadow-[0_16px_40px_rgba(157,233,108,0.3)]">
                Montar minha operação <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
          </FadeUp>

          <div className="grid sm:grid-cols-2">
            {contrastCards.map(({ title, description, icon: Icon }, index) => (
              <FadeUp key={title} delay={index * 0.04}>
                <div className="min-h-[220px] border-b border-[#e3e9ef] p-8 transition-colors duration-300 odd:border-r hover:bg-[#f8fcf5]">
                  <Icon className="h-7 w-7 text-[#254342]" />
                  <h3 className="mt-8 text-[22px] font-semibold tracking-[-0.055em] text-[#254342]">{title}</h3>
                  <p className="mt-3 text-[15px] font-medium leading-7 tracking-[-0.035em] text-[#667085]">{description}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6fafb] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <FadeUp key={item.name} delay={index * 0.06}>
                <article className="rounded-[18px] border border-[#e3e9ef] bg-white p-7 shadow-[0_20px_60px_rgba(37,67,66,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(37,67,66,0.08)]">
                  <ShieldCheck className="h-6 w-6 text-[#62bd36]" />
                  <p className="mt-8 text-[17px] font-medium leading-8 tracking-[-0.04em] text-[#254342]">“{item.text}”</p>
                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#254342] text-xs font-semibold text-white">{item.avatar}</div>
                    <div>
                      <p className="text-[15px] font-semibold tracking-[-0.035em] text-[#254342]">{item.name}</p>
                      <p className="text-[13px] font-medium text-[#667085]">{item.role}</p>
                    </div>
                  </div>
                </article>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
