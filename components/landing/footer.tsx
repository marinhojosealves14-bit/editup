import Link from "next/link"
import { Instagram, Mail, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[#e3e9ef] bg-white px-5 py-10 text-[#254342] sm:px-8">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 overflow-hidden rounded-[10px] bg-white">
              <img src="/logo.png" alt="Mallow" className="h-full w-full object-contain" />
            </span>
            <span className="text-sm font-semibold tracking-[-0.04em]">Mallow</span>
          </Link>
          <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[#667085]">
            O workspace para editores que querem vender, produzir e aprovar com mais controle.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-semibold tracking-[-0.035em] text-[#667085]">
          <Link href="#features" className="hover:text-[#62bd36]">Funcionalidades</Link>
          <Link href="#pricing" className="hover:text-[#62bd36]">Preços</Link>
          <Link href="/termos-de-uso" className="hover:text-[#62bd36]">Termos</Link>
          <Link href="/politica-de-privacidade" className="hover:text-[#62bd36]">Privacidade</Link>
          <a href="mailto:mallowdigital@yahoo.com" className="hover:text-[#62bd36]">Contato</a>
          <a href="#" aria-label="Instagram" className="hover:text-[#62bd36]"><Instagram className="h-4 w-4" /></a>
          <a href="#" aria-label="YouTube" className="hover:text-[#62bd36]"><Youtube className="h-4 w-4" /></a>
          <a href="mailto:mallowdigital@yahoo.com" aria-label="Email" className="hover:text-[#62bd36]"><Mail className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  )
}
