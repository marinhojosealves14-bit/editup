"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type ComponentProps } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Crown, DollarSign, Sparkles, Video } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSession } from "@/components/app/app-provider"
import { useAppPreferences } from "@/components/app/preferences-provider"
import { authFetch } from "@/lib/supabase"
import { FeedbackBanner } from "@/components/dashboard/feedback-banner"
import { PageEmptyState } from "@/components/dashboard/page-empty-state"
import { PageLoadingState } from "@/components/dashboard/page-loading-state"
import {
  fetchFinanceTransactions,
  fetchFixedExpenses,
  fetchWorkspaceClients,
  fetchWorkspaceTasks,
  getCachedFinanceTransactions,
  getCachedFixedExpenses,
  getCachedWorkspaceClients,
  getCachedWorkspaceTasks,
  subscribeWorkspaceSync,
  type FinanceTransaction,
  type FixedExpense,
} from "@/lib/workspace-db"
import type { WorkspaceClient, WorkspaceTask } from "@/lib/workspace-store"
import { cn } from "@/lib/utils"
import { getChecklistProgress } from "@/lib/workflow-insights"

const now = new Date()

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "ED"

const isSameMonth = (date: Date, compareTo: Date) =>
  date.getFullYear() === compareTo.getFullYear() && date.getMonth() === compareTo.getMonth()

const getTaskDate = (task: WorkspaceTask) => new Date(task.updatedAt || task.prazo || now.toISOString())

const getDeliveredTasks = (tasks: WorkspaceTask[]) =>
  tasks.filter((task) => task.statusCliente === "concluido" || task.colunaId === "concluido")

const parseProjectValue = (task: WorkspaceTask) => {
  const normalized = task.escopo?.valorCombinado?.replace(/[^\d.,-]/g, "").replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date))

const statusMeta = (task: WorkspaceTask) => {
  if (task.statusCliente === "concluido" || task.colunaId === "concluido") {
    return { label: "Concluído", className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500" }
  }

  if (task.statusCliente === "desaprovado" || task.colunaId === "desaprovado") {
    return { label: "Refação", className: "border-amber-500/20 bg-amber-500/10 text-amber-500" }
  }

  if (task.colunaId === "waiting-response") {
    return { label: "Aguardando Aprovação", className: "border-indigo-500/20 bg-indigo-500/10 text-indigo-500" }
  }

  if (task.colunaId === "em-producao") {
    return { label: "Produção", className: "border-border bg-secondary text-foreground" }
  }

  return { label: "Agendado", className: "border-border bg-secondary text-muted-foreground" }
}

const deadlineTone = (deadline: string) => {
  if (!deadline) return "text-muted-foreground"
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / 36e5
  if (hoursLeft < 24) return "text-rose-500"
  if (hoursLeft <= 72) return "text-amber-500"
  return "text-emerald-500"
}

const DashboardCard = ({ className, ...props }: ComponentProps<typeof Card>) => (
  <Card
    className={cn(
      "rounded-[12px] border border-border bg-[var(--exec-card)] text-[var(--exec-text)] shadow-[var(--exec-shadow)]",
      className
    )}
    {...props}
  />
)

export default function DashboardPage() {
  const router = useRouter()
  const { currentUser, refreshCurrentUser } = useAppSession()
  const { formatCurrency, monthlyRevenueGoal } = useAppPreferences()
  const [tasks, setTasks] = useState<WorkspaceTask[]>([])
  const [clients, setClients] = useState<WorkspaceClient[]>([])
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState("")
  const [isStartingTrial, setIsStartingTrial] = useState(false)

  useEffect(() => {
    if (!currentUser) return

    const cachedTasks = getCachedWorkspaceTasks(currentUser.id)
    const cachedClients = getCachedWorkspaceClients(currentUser.id)
    const cachedTransactions = getCachedFinanceTransactions(currentUser.id)
    const cachedExpenses = getCachedFixedExpenses(currentUser.id)

    if (cachedTasks) setTasks(cachedTasks)
    if (cachedClients) setClients(cachedClients)
    if (cachedTransactions) setTransactions(cachedTransactions)
    if (cachedExpenses) setFixedExpenses(cachedExpenses)
    if (cachedTasks || cachedClients || cachedTransactions || cachedExpenses) setIsLoading(false)

    const syncDashboard = async (showLoader = false) => {
      try {
        if (showLoader) setIsLoading(true)
        setFeedbackError("")
        const [nextTasks, nextClients, nextTransactions, nextExpenses] = await Promise.all([
          fetchWorkspaceTasks(currentUser.id, { force: true }),
          fetchWorkspaceClients(currentUser.id, { force: true }),
          fetchFinanceTransactions(currentUser.id),
          fetchFixedExpenses(currentUser.id),
        ])
        setTasks(nextTasks)
        setClients(nextClients)
        setTransactions(nextTransactions)
        setFixedExpenses(nextExpenses)
      } catch (error) {
        console.error(error)
        setFeedbackError(error instanceof Error ? error.message : "Não foi possível carregar a dashboard.")
      } finally {
        setIsLoading(false)
      }
    }

    if (!cachedTasks && !cachedClients && !cachedTransactions && !cachedExpenses) {
      void syncDashboard(true)
    } else {
      void syncDashboard()
    }

    return subscribeWorkspaceSync(() => {
      const nextTasks = getCachedWorkspaceTasks(currentUser.id)
      const nextClients = getCachedWorkspaceClients(currentUser.id)
      const nextTransactions = getCachedFinanceTransactions(currentUser.id)
      const nextExpenses = getCachedFixedExpenses(currentUser.id)
      if (nextTasks) setTasks(nextTasks)
      if (nextClients) setClients(nextClients)
      if (nextTransactions) setTransactions(nextTransactions)
      if (nextExpenses) setFixedExpenses(nextExpenses)
      setIsLoading(false)
    })
  }, [currentUser])

  const clientById = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients])
  const clientByName = useMemo(() => new Map(clients.map((client) => [client.nome, client])), [clients])

  const summary = useMemo(() => {
    const currentMonthTransactions = transactions.filter((item) => isSameMonth(new Date(item.data), now))
    const monthlyFixedCosts = fixedExpenses.reduce((sum, item) => sum + item.valor, 0)
    const monthlyRevenue =
      currentMonthTransactions.reduce((sum, item) => sum + (item.tipo === "entrada" ? item.valor : -item.valor), 0) - monthlyFixedCosts
    const goalProgress = monthlyRevenueGoal > 0 ? Math.min(100, Math.round((Math.max(monthlyRevenue, 0) / monthlyRevenueGoal) * 100)) : 0
    const activeTasks = tasks.filter((task) => task.colunaId !== "concluido" && task.statusCliente !== "concluido")
    const waitingApproval = activeTasks.filter((task) => task.colunaId === "waiting-response").length
    const deliveredThisMonth = getDeliveredTasks(tasks).filter((task) => isSameMonth(getTaskDate(task), now)).length
    const dueSoon = activeTasks.filter((task) => {
      if (!task.prazo) return false
      const hoursLeft = (new Date(task.prazo).getTime() - Date.now()) / 36e5
      return hoursLeft >= 0 && hoursLeft <= 72
    }).length
    const projectedRevenue = activeTasks.reduce((sum, task) => sum + parseProjectValue(task), 0)

    return {
      monthlyRevenue,
      goalProgress,
      activeTasks: activeTasks.length,
      waitingApproval,
      deliveredThisMonth,
      dueSoon,
      projectedRevenue,
    }
  }, [fixedExpenses, monthlyRevenueGoal, tasks, transactions])

  const productionData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date()
      date.setDate(now.getDate() - (6 - index))
      return date
    })

    return days.map((date) => {
      const delivered = getDeliveredTasks(tasks).filter((task) => {
        const taskDate = getTaskDate(task)
        return taskDate.toDateString() === date.toDateString()
      }).length

      return {
        day: new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(date).replace(".", ""),
        delivered,
      }
    })
  }, [tasks])

  const deadlineDays = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.colunaId !== "concluido" && task.prazo)
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const firstDay = new Date(currentYear, currentMonth, 1)
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate()
    const leadingBlanks = firstDay.getDay()
    const days = [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => {
        const day = index + 1
        const items = activeTasks.filter((task) => {
          const deadline = new Date(task.prazo)
          return deadline.getFullYear() === currentYear && deadline.getMonth() === currentMonth && deadline.getDate() === day
        })
        return { day, items }
      }),
    ]

    return days
  }, [tasks])

  const recentEdits = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.updatedAt ?? b.prazo ?? 0).getTime() - new Date(a.updatedAt ?? a.prazo ?? 0).getTime())
        .slice(0, 7),
    [tasks]
  )

  const nextDeadlines = useMemo(
    () =>
      tasks
        .filter((task) => task.colunaId !== "concluido" && task.prazo)
        .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime())
        .slice(0, 3),
    [tasks]
  )

  const operationalMetrics = [
    {
      label: "Projetos ativos",
      value: String(summary.activeTasks),
      detail: summary.waitingApproval > 0 ? `${summary.waitingApproval} aguardando aprovação` : "Sem aprovações pendentes",
      icon: Video,
    },
    {
      label: "Prazos próximos",
      value: String(summary.dueSoon),
      detail: summary.dueSoon > 0 ? "Entrega nas próximas 72h" : "Nenhum prazo crítico",
      icon: Clock3,
    },
    {
      label: "Receita prevista",
      value: formatCurrency(summary.projectedRevenue),
      detail: "Valor dos projetos abertos",
      icon: DollarSign,
    },
    {
      label: "Entregues no mês",
      value: String(summary.deliveredThisMonth),
      detail: "Vídeos concluídos em maio",
      icon: CheckCircle2,
    },
  ]

  const featuredTask = nextDeadlines[0] ?? recentEdits[0] ?? null
  const featuredProgress = featuredTask ? Math.max(getChecklistProgress(featuredTask.checklist), featuredTask.colunaId === "em-producao" ? 55 : 18) : 0

  if (!currentUser) return null
  const firstName = (currentUser.name || currentUser.profile.fullName || "Editor").split(" ")[0]
  const creativeCloudRedeemExpiresAt = currentUser.creativeCloudRedeemAvailableUntil ? new Date(currentUser.creativeCloudRedeemAvailableUntil) : null
  const showCreativeCloudRedeem =
    currentUser.plan === "pro" &&
    currentUser.subscriptionStatus === "active" &&
    creativeCloudRedeemExpiresAt &&
    creativeCloudRedeemExpiresAt.getTime() > Date.now()

  const openTask = (taskId: string) => {
    router.push(`/dashboard/kanban?taskId=${encodeURIComponent(taskId)}`)
  }

  const trialEndsAt = currentUser.trialEndsAt ? new Date(currentUser.trialEndsAt) : null
  const hasActiveTrial = currentUser.subscriptionStatus === "trialing" && trialEndsAt && trialEndsAt.getTime() > Date.now()
  const hasExpiredTrial = currentUser.subscriptionStatus === "trialing" && trialEndsAt && trialEndsAt.getTime() <= Date.now()
  const showTrialCta = (currentUser.plan === "free" || currentUser.plan === "starter") && currentUser.subscriptionStatus !== "active" && !hasExpiredTrial

  const handleStartTrial = async () => {
    try {
      setIsStartingTrial(true)
      setFeedbackError("")
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
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Não foi possível iniciar o teste grátis.")
    } finally {
      setIsStartingTrial(false)
    }
  }

  return (
    <div className="executive-dashboard min-w-0 space-y-4 overflow-x-hidden sm:space-y-5">
      <FeedbackBanner message={feedbackError} type="error" />
      {(showTrialCta || hasActiveTrial || hasExpiredTrial) && (
        <DashboardCard className="border-primary/35 bg-[radial-gradient(circle_at_top_right,rgba(157,233,108,0.16),transparent_35%),var(--exec-card)]">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--exec-text)]">
                  {hasActiveTrial ? "Teste grátis Essential ativo" : hasExpiredTrial ? "Seu teste grátis terminou" : "Pegue 15 dias grátis do Essential"}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-[var(--exec-muted)]">
                  {hasActiveTrial
                    ? `Você tem acesso ao CRM, propostas, financeiro, Drive e aprovações até ${trialEndsAt?.toLocaleDateString("pt-BR")}. Trocas e Vagas ficam bloqueadas no teste.`
                    : hasExpiredTrial
                      ? "Para manter CRM, propostas, financeiro, Drive e aprovações liberados, escolha um plano pago."
                    : "Libere CRM, propostas, financeiro, Drive e aprovações por 15 dias. Depois do período, tudo volta para o Starter se você não assinar."}
                </p>
              </div>
            </div>
            {hasActiveTrial || hasExpiredTrial ? (
              <Button onClick={() => router.push("/dashboard/planos")}>
                {hasExpiredTrial ? "Ver planos" : "Assinar antes de expirar"}
              </Button>
            ) : (
              <Button onClick={() => void handleStartTrial()} disabled={isStartingTrial}>
                {isStartingTrial ? "Liberando..." : "Começar teste de 15 dias"}
              </Button>
            )}
          </CardContent>
        </DashboardCard>
      )}
      {showCreativeCloudRedeem && (
        <DashboardCard className="border-primary/40 bg-[radial-gradient(circle_at_top_right,rgba(157,233,108,0.18),transparent_32%),var(--exec-card)]">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[var(--exec-text)]">Resgate sua Creative Cloud Pro</p>
                <p className="mt-1 text-sm text-[var(--exec-muted)]">
                  Benefício disponível por 3 dias após a compra. Prazo: {creativeCloudRedeemExpiresAt.toLocaleDateString("pt-BR")}.
                </p>
              </div>
            </div>
            <Button onClick={() => router.push("/dashboard/configuracoes?section=plans")}>
              Resgatar assinatura
            </Button>
          </CardContent>
        </DashboardCard>
      )}

      {isLoading ? (
        <DashboardCard>
          <CardContent className="p-6">
            <PageLoadingState title="Carregando dashboard" description="Organizando prazos, faturamento e status dos vídeos." />
          </CardContent>
        </DashboardCard>
      ) : (
        <>
          <div className="grid min-w-0 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="min-w-0 space-y-4">
              <DashboardCard className="overflow-hidden border-0 bg-[#f4f4f5] shadow-none dark:bg-[#191a1d]">
                <CardContent className="relative min-h-[160px] p-5 sm:p-6">
                  <div className="relative z-10 max-w-[70%]">
                    <p className="text-[13px] font-semibold text-muted-foreground">Workspace Mallow</p>
                    <h2 className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.06em] text-foreground sm:text-4xl">
                      Olá, {firstName}.
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">Sua operação de edição em um painel limpo.</p>
                  </div>
                  <div className="absolute bottom-0 right-2 flex h-36 w-36 items-center justify-center sm:right-8 sm:h-44 sm:w-44">
                    <div className="absolute h-24 w-24 rounded-full bg-primary/40 blur-2xl" />
                    <img src="/logo.png" alt="Mallow" className="relative h-24 w-24 object-contain drop-shadow-sm sm:h-32 sm:w-32" />
                  </div>
                </CardContent>
              </DashboardCard>

              <DashboardCard className="overflow-hidden border-0 bg-card shadow-none">
                <CardContent className="p-0">
                  <div className="border-b border-border px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold tracking-[-0.04em] text-foreground">Projetos em andamento</p>
                        <p className="mt-1 text-xs text-muted-foreground">Acompanhe os trabalhos que precisam andar.</p>
                      </div>
                      <Button className="hidden bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90 sm:inline-flex" onClick={() => router.push("/dashboard/kanban")}>
                        Ver board
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 sm:p-4">
                    {recentEdits.length === 0 ? (
                      <div className="rounded-[14px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                        Nenhum projeto recente ainda.
                      </div>
                    ) : (
                      recentEdits.slice(0, 5).map((task) => {
                        const status = statusMeta(task)
                        const value = parseProjectValue(task)
                        return (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => openTask(task.id)}
                            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[14px] bg-[#f4f4f5] px-3 py-3 text-left transition-colors hover:bg-[#ededee] dark:bg-[#1f2024] dark:hover:bg-[#25262a] sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{task.titulo}</p>
                              <p className="mt-0.5 truncate text-xs text-muted-foreground">{task.clienteNome || "Cliente sem nome"}</p>
                            </div>
                            <div className="hidden items-center gap-2 sm:flex">
                              <Badge variant="outline" className={cn("rounded-[8px] border px-2 py-1 text-[11px]", status.className)}>
                                {status.label}
                              </Badge>
                              <span className="text-xs font-semibold text-muted-foreground">{value > 0 ? formatCurrency(value) : "Sem valor"}</span>
                            </div>
                            <div className="flex h-9 min-w-20 items-center justify-center rounded-[10px] bg-black px-3 text-xs font-semibold text-white dark:bg-white dark:text-black">
                              Abrir
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                </CardContent>
              </DashboardCard>
            </div>

            <div className="min-w-0 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <DashboardCard className="border-0 bg-[#f4f4f5] shadow-none dark:bg-[#191a1d]">
                  <CardContent className="p-4">
                    <p className="text-[42px] font-semibold leading-none tracking-[-0.07em] text-foreground">{summary.deliveredThisMonth}</p>
                    <p className="mt-2 text-xs font-medium leading-4 text-muted-foreground">vídeos entregues</p>
                  </CardContent>
                </DashboardCard>
                <DashboardCard className="border-0 bg-[#f4f4f5] shadow-none dark:bg-[#191a1d]">
                  <CardContent className="p-4">
                    <p className="text-[42px] font-semibold leading-none tracking-[-0.07em] text-foreground">{summary.activeTasks}</p>
                    <p className="mt-2 text-xs font-medium leading-4 text-muted-foreground">projetos ativos</p>
                  </CardContent>
                </DashboardCard>
              </div>

              {featuredTask ? (
                <DashboardCard className="border-0 bg-[#f4f4f5] shadow-none dark:bg-[#191a1d]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{featuredTask.titulo}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{featuredTask.clienteNome || "Próxima entrega"}</p>
                      </div>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-primary text-xs font-semibold text-foreground">
                        {featuredProgress}%
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white dark:bg-black/30">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(featuredProgress, 100)}%` }} />
                    </div>
                    <Button className="mt-4 h-10 w-full bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90" onClick={() => openTask(featuredTask.id)}>
                      Continuar
                    </Button>
                  </CardContent>
                </DashboardCard>
              ) : null}

              <DashboardCard className="border-0 bg-card shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg tracking-[-0.04em] text-foreground">Suas estatísticas</CardTitle>
                  <CardDescription>Vídeos entregues nos últimos 7 dias.</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] px-2 pb-4 sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionData} margin={{ left: -16, right: 12, top: 14, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--exec-grid)" opacity={0.75} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ stroke: "var(--primary)", strokeWidth: 1 }}
                        contentStyle={{
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          background: "var(--exec-card)",
                          color: "var(--exec-text)",
                        }}
                      />
                      <Line type="monotone" dataKey="delivered" stroke="#111111" strokeWidth={3} dot={{ r: 4, fill: "#111111" }} activeDot={{ r: 6, fill: "var(--primary)", stroke: "#111111" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </DashboardCard>

              <DashboardCard className="border-0 bg-[#f4f4f5] shadow-none dark:bg-[#191a1d]">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.04em] text-foreground">Receita prevista</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatCurrency(summary.projectedRevenue)} em projetos abertos.</p>
                  </div>
                  <Button className="bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/90" onClick={() => router.push("/dashboard/financeiro")}>
                    Ver
                  </Button>
                </CardContent>
              </DashboardCard>
            </div>
          </div>

          <DashboardCard>
            <CardHeader>
              <CardTitle className="text-[var(--exec-text)]">Recent Edits</CardTitle>
              <CardDescription>Projetos recentes, status, prazo e valor combinado.</CardDescription>
            </CardHeader>
            <CardContent className="min-w-0 px-4 pb-5 sm:px-5">
              {recentEdits.length === 0 ? (
                <PageEmptyState
                  icon={<CalendarDays className="h-7 w-7" />}
                  title="Nenhum projeto recente"
                  description="Quando você criar vídeos na agenda, eles aparecem aqui."
                  actionLabel="Abrir agenda"
                  actionHref="/dashboard/kanban"
                />
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {recentEdits.map((task) => {
                      const status = statusMeta(task)
                      const client = clientById.get(task.clienteId) ?? clientByName.get(task.clienteNome)
                      const transaction = transactions.find((item) => item.cliente === task.clienteNome && item.tipo === "entrada")
                      const value = parseProjectValue(task) || transaction?.valor || 0

                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => openTask(task.id)}
                          className="w-full rounded-[12px] border border-border bg-background p-4 text-left"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0 border border-border">
                              {client?.fotoUrl ? <AvatarImage src={client.fotoUrl} alt={task.clienteNome} className="object-cover" /> : null}
                              <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                                {getInitials(task.clienteNome || task.titulo)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-[var(--exec-text)]">{task.clienteNome || "Cliente"}</p>
                              <p className="truncate text-xs text-muted-foreground">{task.titulo}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={cn("rounded-[8px] border px-2.5 py-1", status.className)}>
                              {status.label}
                            </Badge>
                            <span className={cn("text-xs font-semibold", deadlineTone(task.prazo))}>
                              {task.prazo ? formatDate(task.prazo) : "Sem prazo"}
                            </span>
                            <span className="ml-auto text-sm font-semibold text-[var(--exec-text)]">
                              {value > 0 ? formatCurrency(value) : "—"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="text-muted-foreground">Cliente</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground">Prazo</TableHead>
                          <TableHead className="text-muted-foreground">Valor</TableHead>
                          <TableHead className="text-right text-muted-foreground">Abrir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentEdits.map((task) => {
                          const status = statusMeta(task)
                          const client = clientById.get(task.clienteId) ?? clientByName.get(task.clienteNome)
                          const transaction = transactions.find((item) => item.cliente === task.clienteNome && item.tipo === "entrada")
                          const value = parseProjectValue(task) || transaction?.valor || 0

                          return (
                            <TableRow
                              key={task.id}
                              className="cursor-pointer border-border hover:bg-secondary/60"
                              role="link"
                              tabIndex={0}
                              onClick={() => openTask(task.id)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault()
                                  openTask(task.id)
                                }
                              }}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-border">
                                    {client?.fotoUrl ? <AvatarImage src={client.fotoUrl} alt={task.clienteNome} className="object-cover" /> : null}
                                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                                      {getInitials(task.clienteNome || task.titulo)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-[var(--exec-text)]">{task.clienteNome || "Cliente"}</p>
                                    <p className="text-xs text-muted-foreground">{task.titulo}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={cn("rounded-[8px] border px-2.5 py-1", status.className)}>
                                  {status.label}
                                </Badge>
                              </TableCell>
                              <TableCell className={cn("font-medium", deadlineTone(task.prazo))}>
                                {task.prazo ? formatDate(task.prazo) : "Sem prazo"}
                              </TableCell>
                              <TableCell className="font-semibold text-[var(--exec-text)]">
                                {value > 0 ? formatCurrency(value) : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/dashboard/kanban?taskId=${encodeURIComponent(task.id)}`}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <ArrowUpRight className="h-4 w-4" />
                                </Link>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </DashboardCard>
        </>
      )}
    </div>
  )
}
