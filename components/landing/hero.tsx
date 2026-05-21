"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bolt, LockKeyhole } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#e3e9ef] bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "linear-gradient(#dfe7ee 1px, transparent 1px), linear-gradient(90deg, #dfe7ee 1px, transparent 1px)",
          backgroundSize: "104px 104px",
          backgroundPosition: "center top",
        }}
      />
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="absolute right-[4vw] top-0 w-[92vw] animate-[editup-float_8s_ease-in-out_infinite]"
        >
          <Image
            src="/landing-hero-mallow-dashboard.png"
            alt="Dashboard Mallow"
            width={2191}
            height={1350}
            priority
            sizes="92vw"
            className="h-auto w-full"
          />
        </motion.div>
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-[1360px] grid-cols-1 items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[610px_1fr] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.48, ease: "easeOut" }}
          className="relative z-10 max-w-[650px]"
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dfe7ee] bg-white px-3 py-2 text-[13px] font-semibold tracking-[-0.03em] text-[#254342] shadow-sm">
            <span className="flex -space-x-2">
              <Image src="/landing-avatar-1.jpg" alt="" width={24} height={24} className="h-6 w-6 rounded-full border-2 border-white object-cover" />
              <Image src="/landing-avatar-2.jpg" alt="" width={24} height={24} className="h-6 w-6 rounded-full border-2 border-white object-cover" />
              <Image src="/landing-avatar-3.jpg" alt="" width={24} height={24} className="h-6 w-6 rounded-full border-2 border-white object-cover" />
            </span>
            +28 editores ganhando mais
          </div>

          <h1 className="text-[52px] font-semibold leading-[0.98] tracking-[-0.075em] text-[#254342] sm:text-[70px] lg:text-[76px]">
            <span className="block whitespace-nowrap">Organize fácil.</span>
            <span className="block whitespace-nowrap">Entregue <span className="text-[#70c748]">rápido.</span></span>
          </h1>
          <p className="mt-7 max-w-[520px] text-[19px] font-medium leading-8 tracking-[-0.04em] text-[#667085]">
            Centralize clientes, propostas, produção, aprovações e financeiro em um só lugar.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link href="/cadastro" className="group">
              <Button className="h-14 rounded-full bg-[#9de96c] px-7 text-[17px] font-semibold tracking-[-0.045em] text-[#21351f] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8bdd5c] hover:shadow-[0_18px_45px_rgba(157,233,108,0.36)]">
                Começar agora
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#features" className="inline-flex h-14 items-center gap-2 px-2 text-[17px] font-semibold tracking-[-0.045em] text-[#254342] transition-colors duration-300 hover:text-[#62bd36]">
              Por que usar?
            </Link>
          </div>

          <div className="mt-20 grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edfbe6] text-[#254342]">
                <Bolt className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.04em] text-[#254342]">Rápido</p>
                <p className="text-[13px] font-medium text-[#667085]">Crie fluxo em minutos.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#edfbe6] text-[#254342]">
                <LockKeyhole className="h-6 w-6" />
              </span>
              <div>
                <p className="text-[16px] font-semibold tracking-[-0.04em] text-[#254342]">Seguro</p>
                <p className="text-[13px] font-medium text-[#667085]">Tudo com acesso controlado.</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.56, ease: "easeOut", delay: 0.05 }}
          className="relative min-h-[380px] lg:hidden"
        >
          <Image
            src="/landing-hero-mallow-dashboard.png"
            alt="Dashboard Mallow"
            width={2191}
            height={1350}
            priority
            sizes="100vw"
            className="absolute left-1/2 top-0 h-auto w-[800px] max-w-none -translate-x-[78%]"
          />
        </motion.div>
      </div>
    </section>
  )
}
