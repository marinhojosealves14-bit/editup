"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "A Mallow substitui meu WhatsApp?",
    answer: "Não. Ela organiza o que o WhatsApp não consegue: status, aprovação, arquivos, orçamento e histórico. Você ainda pode conversar com o cliente, mas sem depender do chat como sistema.",
  },
  {
    question: "Consigo começar sem pagar?",
    answer: "Sim. Você pode ativar 15 dias grátis para testar. Depois disso, o Starter custa R$19,90/mês e fica limitado; o Essential é o plano recomendado para operar com clientes reais.",
  },
  {
    question: "O que muda no Essential?",
    answer: "O Essential libera CRM, financeiro, downloads no marketplace, Drive e aprovação sem marca Mallow. É o plano recomendado para operar com clientes reais.",
  },
  {
    question: "O cliente precisa criar conta para aprovar?",
    answer: "Não. Ele acessa um link limpo de aprovação, assiste ao vídeo, comenta por tempo e aprova ou pede ajustes.",
  },
  {
    question: "E se eu atrasar o pagamento?",
    answer: "O acesso pago é controlado pela assinatura. Se o pagamento deixar de ficar ativo, o sistema rebaixa para Starter até a regularização.",
  },
]

export function FaqSupport() {
  return (
    <section id="faq" className="bg-[#f6fafb] px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42 }}
          >
            <p className="text-[15px] font-semibold tracking-[-0.04em] text-[#62bd36]">Objeções quebradas</p>
            <h2 className="mt-5 text-[44px] font-semibold leading-[1.04] tracking-[-0.075em] text-[#254342] sm:text-[64px]">
              Dúvidas antes de começar?
            </h2>
            <p className="mt-6 text-[19px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
              Respostas diretas para você decidir sem fricção.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.42, delay: 0.08 }}
            className="rounded-[18px] border border-[#e3e9ef] bg-white p-2"
          >
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`} className="border-[#e3e9ef] px-4">
                  <AccordionTrigger className="text-left text-[17px] font-semibold tracking-[-0.045em] text-[#254342] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] font-medium leading-7 tracking-[-0.035em] text-[#667085]">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42 }}
          className="mt-16 rounded-[22px] border border-[#d9e5ef] bg-white p-8 text-center text-[#254342] shadow-[0_24px_70px_rgba(37,67,66,0.08)] sm:p-12"
        >
          <h2 className="mx-auto max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.075em] sm:text-[56px]">
            Pronto para parar de gerenciar cliente no improviso?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[18px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
            Crie sua conta e ative 15 dias grátis e monte sua primeira operação em poucos minutos.
          </p>
          <Link href="/cadastro" className="mt-8 inline-flex">
            <Button className="h-12 rounded-full bg-[#9de96c] px-6 text-base font-semibold text-[#21351f] hover:bg-[#8bdd5c]">
              Começar teste grátis
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
