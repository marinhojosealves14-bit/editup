"use client"

import Link from "next/link"
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppSession } from "@/components/app/app-provider"

const navItems = [
  ["Produtos", "#features"],
  ["Soluções", "#pain"],
  ["Recursos", "#proof"],
  ["Preços", "#pricing"],
] as const

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { currentUser } = useAppSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3e9ef] bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[86px] max-w-[1360px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 overflow-hidden rounded-[10px] bg-white">
            <img src="/logo.png" alt="Mallow" className="h-full w-full object-contain" />
          </span>
          <span className="text-[18px] font-semibold tracking-[-0.04em] text-[#254342]">Mallow</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map(([label, href], index) => (
            <Link key={href} href={href} className="inline-flex items-center gap-1.5 text-[15px] font-semibold tracking-[-0.035em] text-[#254342] transition-colors hover:text-[#62bd36]">
              {label}
              {index < 3 ? <ChevronDown className="h-3.5 w-3.5" /> : null}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <div className="h-11 w-px bg-[#e3e9ef]" />
          <Link href={currentUser ? "/dashboard" : "/cadastro"}>
            <Button className="h-12 rounded-full bg-[#9de96c] px-6 text-[15px] font-semibold tracking-[-0.04em] text-[#21351f] shadow-none hover:bg-[#8bdd5c]">
              {currentUser ? "Acessar Plataforma" : "Começar agora"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          {!currentUser ? (
            <Link href="/login" className="text-[15px] font-semibold tracking-[-0.035em] text-[#254342] hover:text-[#62bd36]">
              Entrar
            </Link>
          ) : null}
        </div>

        <button className="md:hidden" onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Abrir menu">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#e3e9ef] bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="py-2 text-sm font-semibold text-[#254342]" onClick={() => setMobileMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href={currentUser ? "/dashboard" : "/cadastro"} onClick={() => setMobileMenuOpen(false)}>
              <Button className="mt-2 h-12 w-full rounded-full bg-[#9de96c] text-[#21351f] hover:bg-[#8bdd5c]">
                {currentUser ? "Acessar Plataforma" : "Começar agora"}
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
