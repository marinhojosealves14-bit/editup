"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Bot, CreditCard, FileText, Github, KeyRound, MessageCircle, RefreshCcw, Send, Sparkles, Users } from "lucide-react"
import { useAppSession } from "@/components/app/app-provider"
import { canDirectLoginEmail } from "@/lib/app-data"

const PLAN_CONTENT = {
  free: [
    "Teste grátis por 15 dias",
    "Agenda, clientes e página profissional",
    "Upgrade disponível a qualquer momento",
  ],
  starter: [
    "Starter por R$19,90/mês",
    "Calculadora de propostas",
    "Pack completo de edição",
    "Plano limitado para primeiros projetos",
  ],
  essential: [
    "Tudo do Starter",
    "Acesso completo à plataforma",
    "CRM, Produção, Financeiro e Drive",
    "Marketplace com download liberado",
  ],
  pro: [
    "Tudo do Essential",
    "Creative Cloud",
    "Customização de logo",
    "Benefícios Pro com pagamento ativo",
  ],
} as const

const leftTags = [
  { label: "Assinaturas", icon: RefreshCcw, top: "22%", line: "w-48" },
  { label: "Clientes", icon: Users, top: "36%", line: "w-56" },
  { label: "Propostas", icon: FileText, top: "52%", line: "w-64" },
  { label: "Financeiro", icon: CreditCard, top: "70%", line: "w-44" },
]

const rightTags = [
  { label: "Google", icon: Sparkles, top: "12%", line: "w-52" },
  { label: "SaaS", icon: Bot, top: "20%", line: "w-44" },
  { label: "Aprovação", icon: FileText, top: "34%", line: "w-56" },
  { label: "WhatsApp", icon: MessageCircle, top: "54%", line: "w-64" },
  { label: "Telegram", icon: Send, top: "64%", line: "w-52" },
  { label: "GitHub", icon: Github, top: "78%", line: "w-44" },
]

export default function CadastroPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { registerUser, signInWithGoogle } = useAppSession()
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof PLAN_CONTENT>("free")
  const planItems = PLAN_CONTENT[selectedPlan] ?? PLAN_CONTENT.free

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const plan = params.get("plan")
    if (plan === "starter" || plan === "essential" || plan === "free" || plan === "pro") {
      setSelectedPlan(plan)
    }
  }, [])

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const result = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      })

      if (!result.success) {
        setErrorMessage(result.message ?? "Nao foi possivel criar sua conta.")
        return
      }

      const normalizedEmail = email.trim().toLowerCase()

      if (result.signedIn || canDirectLoginEmail(normalizedEmail)) {
        router.push("/dashboard/calculadora")
        return
      }

      setSuccessMessage(result.message ?? "Conta criada com sucesso.")
    } catch (error) {
      console.error(error)
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel criar sua conta.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setErrorMessage("")
    setSuccessMessage("")
    const result = await signInWithGoogle()
    if (!result.success) {
      setErrorMessage(result.message ?? "Nao foi possivel continuar com o Google.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#254342]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#dfe8ef_1px,transparent_1px)] [background-size:15px_15px] opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[44vh] bg-[linear-gradient(180deg,rgba(157,233,108,0),rgba(157,233,108,0.82)_45%,rgba(89,190,46,0.98))]" />
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[560px] w-[780px] -translate-x-1/2 rounded-full bg-white/72 blur-[90px]" />

      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-[#e3e9ef] bg-white/88 px-4 py-2 text-sm font-semibold tracking-[-0.035em] text-[#254342] shadow-sm transition-colors hover:border-[#9de96c]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[34vw] lg:block">
        {leftTags.map((tag) => (
          <FloatingTag key={tag.label} {...tag} side="left" />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[34vw] lg:block">
        {rightTags.map((tag) => (
          <FloatingTag key={tag.label} {...tag} side="right" />
        ))}
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        <section className="w-full max-w-[540px] rounded-[26px] border border-[#e3e9ef] bg-white/92 px-7 py-9 text-center shadow-[0_28px_90px_rgba(37,67,66,0.12)] backdrop-blur sm:px-12">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center overflow-hidden rounded-[14px] bg-white">
            <img src="/logo.png" alt="Mallow" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-[38px] font-semibold leading-[1.04] tracking-[-0.075em] text-[#254342] sm:text-[44px]">
            Comece com a <span className="text-[#70c748]">Mallow.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[430px] text-[17px] font-medium leading-7 tracking-[-0.04em] text-[#667085]">
            Crie sua conta e organize sua operação de edição em minutos.
          </p>

          <div className="mt-8 space-y-5 text-left">
            <Button
              type="button"
              variant="outline"
              className="h-14 w-full rounded-[10px] border-2 border-[#20242a] bg-white text-[17px] font-semibold tracking-[-0.045em] text-[#667085] shadow-[0_3px_0_#111] hover:bg-[#f8fafc] hover:text-[#254342]"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <span className="text-[22px] font-bold text-[#4285f4]">G</span>
              Criar conta com Google
            </Button>

            <div className="relative flex items-center justify-center">
              <span className="absolute h-px w-full border-t border-dashed border-[#e3e9ef]" />
              <span className="relative bg-white px-4 text-[13px] font-medium tracking-[-0.035em] text-[#8b98aa]">ou crie com e-mail</span>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-[15px] font-semibold tracking-[-0.04em] text-[#20242a]">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-13 rounded-[10px] border-2 border-[#9de96c] bg-white px-4 text-[17px] font-medium tracking-[-0.04em] text-[#254342] shadow-[0_0_0_3px_rgba(157,233,108,0.18)] placeholder:text-[#b7c0cc] focus-visible:ring-0"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[15px] font-semibold tracking-[-0.04em] text-[#20242a]">
                  E-mail de acesso
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="voce@exemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-13 rounded-[10px] border border-[#d9e5ef] bg-white px-4 text-[17px] font-medium tracking-[-0.04em] text-[#254342] placeholder:text-[#b7c0cc]"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-[15px] font-semibold tracking-[-0.04em] text-[#20242a]">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Crie sua senha"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-13 rounded-[10px] border border-[#d9e5ef] bg-white px-4 text-[17px] font-medium tracking-[-0.04em] text-[#254342] placeholder:text-[#b7c0cc]"
                />
              </div>
              <Button
                type="submit"
                className="h-14 w-full rounded-[10px] bg-[#70706d] text-[17px] font-semibold tracking-[-0.045em] text-white hover:bg-[#5f5f5c]"
                disabled={isLoading}
              >
                <KeyRound className="h-5 w-5" />
                {isLoading ? "Criando..." : "Criar conta"}
              </Button>
            </form>

            {successMessage && <p className="text-center text-sm font-medium text-[#62bd36]">{successMessage}</p>}
            {errorMessage && <p className="text-center text-sm font-medium text-destructive">{errorMessage}</p>}
          </div>

          <p className="mx-auto mt-7 max-w-[390px] text-center text-[15px] font-medium leading-7 tracking-[-0.04em] text-[#667085]">
            Criando uma conta, você concorda com nossos{" "}
            <Link href="/termos-de-uso" className="font-semibold text-[#254342] underline underline-offset-4">
              termos
            </Link>{" "}
            e nossa{" "}
            <Link href="/politica-de-privacidade" className="font-semibold text-[#254342] underline underline-offset-4">
              política de privacidade
            </Link>
            . Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-[#254342] underline underline-offset-4">
              Entrar
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}

function FloatingTag({
  label,
  icon: Icon,
  top,
  line,
  side,
}: {
  label: string
  icon: typeof RefreshCcw
  top: string
  line: string
  side: "left" | "right"
}) {
  return (
    <div className={`absolute flex items-center ${side === "left" ? "right-0 flex-row" : "left-0 flex-row-reverse"}`} style={{ top }}>
      <div className={`${line} h-px bg-[#d9ddf0]`} />
      <div className="mx-4 inline-flex items-center gap-2 rounded-full border border-[#e3e9ef] bg-white px-5 py-3 text-[15px] font-semibold tracking-[-0.04em] text-[#394257] shadow-[0_8px_22px_rgba(37,67,66,0.08)]">
        <Icon className="h-5 w-5" />
        {label}
      </div>
    </div>
  )
}
