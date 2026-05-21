"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Bell,
  Boxes,
  BriefcaseBusiness,
  Calculator,
  ChartSpline,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Crown,
  FileText,
  GraduationCap,
  HardDrive,
  Instagram,
  Lock,
  LogOut,
  Menu,
  MessageSquarePlus,
  MoreVertical,
  Settings,
  SlidersHorizontal,
  Store,
  UserRound,
  UserRoundKey,
  Video,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { NotificationBadge } from "@/components/dashboard/notification-badge"
import { cn } from "@/lib/utils"
import { canAccessDashboardPath, PLAN_LABELS, type PlanId } from "@/lib/app-data"
import { useAppSession } from "@/components/app/app-provider"
import { useAppPreferences } from "@/components/app/preferences-provider"
import { fetchUnreadNotificationCount, subscribeWorkspaceSync } from "@/lib/workspace-db"

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
    <path d="M16.03 3.2A12.72 12.72 0 0 0 5.1 22.47L3.5 28.8l6.48-1.55A12.72 12.72 0 1 0 16.03 3.2Zm0 2.35a10.37 10.37 0 0 1 8.8 15.84 10.36 10.36 0 0 1-13.96 3.77l-.47-.27-3.86.92.94-3.69-.3-.49A10.37 10.37 0 0 1 16.03 5.55Zm-4.55 5.37c-.24 0-.62.09-.94.45-.32.35-1.23 1.2-1.23 2.93s1.26 3.4 1.44 3.64c.18.24 2.43 3.9 6.02 5.31 2.98 1.17 3.59.94 4.24.88.65-.06 2.09-.85 2.38-1.67.3-.82.3-1.52.21-1.67-.09-.15-.32-.24-.68-.42-.35-.18-2.09-1.03-2.41-1.14-.32-.12-.56-.18-.79.18-.24.35-.91 1.14-1.12 1.38-.21.24-.41.27-.77.09-.35-.18-1.5-.55-2.86-1.76-1.06-.94-1.77-2.1-1.98-2.45-.21-.35-.02-.55.16-.72.16-.16.35-.41.53-.62.18-.21.24-.35.35-.59.12-.24.06-.44-.03-.62-.09-.18-.79-1.91-1.08-2.61-.28-.68-.57-.59-.79-.6h-.66Z" />
  </svg>
)

type NavNameKey =
  | "dashboard"
  | "clients"
  | "schedule"
  | "notifications"
  | "suggestions"
  | "quotes"
  | "finance"
  | "calculator"
  | "jobs"
  | "pack"
  | "exchange"
  | "drive"
  | "reelsCourse"
  | "outreach"
  | "plans"
  | "profile"
  | "settings"

type NavItem = {
  nameKey: NavNameKey
  href: string
  icon: LucideIcon
  minimumPlan: PlanId
  isNotification?: boolean
}

const mainItems: NavItem[] = [
  { nameKey: "dashboard", href: "/dashboard", icon: ChartSpline, minimumPlan: "essential" },
  { nameKey: "schedule", href: "/dashboard/kanban", icon: Clapperboard, minimumPlan: "essential" },
  { nameKey: "clients", href: "/dashboard/clientes", icon: UserRound, minimumPlan: "essential" },
  { nameKey: "quotes", href: "/dashboard/orcamentos", icon: FileText, minimumPlan: "essential" },
  { nameKey: "finance", href: "/dashboard/financeiro", icon: Wallet, minimumPlan: "essential" },
]

const resourceItems: NavItem[] = [
  { nameKey: "calculator", href: "/dashboard/calculadora", icon: Calculator, minimumPlan: "free" },
  { nameKey: "drive", href: "/dashboard/drive", icon: HardDrive, minimumPlan: "starter" },
  { nameKey: "pack", href: "/dashboard/pack", icon: Boxes, minimumPlan: "starter" },
  { nameKey: "exchange", href: "/dashboard/exchange", icon: Store, minimumPlan: "starter" },
  { nameKey: "jobs", href: "/dashboard/vagas", icon: BriefcaseBusiness, minimumPlan: "essential" },
  { nameKey: "reelsCourse", href: "/dashboard/curso-reels", icon: Video, minimumPlan: "essential" },
  { nameKey: "outreach", href: "/dashboard/prospeccao", icon: Instagram, minimumPlan: "essential" },
]

const accountItems: NavItem[] = [
  { nameKey: "profile", href: "/dashboard/perfil", icon: UserRoundKey, minimumPlan: "free" },
  { nameKey: "notifications", href: "/dashboard/notificacoes", icon: Bell, minimumPlan: "essential", isNotification: true },
  { nameKey: "suggestions", href: "/dashboard/sugestoes", icon: MessageSquarePlus, minimumPlan: "free" },
  { nameKey: "plans", href: "/dashboard/planos", icon: Crown, minimumPlan: "free" },
  { nameKey: "settings", href: "/dashboard/configuracoes", icon: Settings, minimumPlan: "free" },
]

const sidebarLayoutKey = "editup-sidebar-layout"
type SidebarSection = "main" | "resources" | "account"
type SidebarLayout = Partial<Record<NavNameKey, SidebarSection>>
const customizableItems = [...mainItems, ...resourceItems, ...accountItems]

const getDefaultSection = (item: NavItem): SidebarSection => {
  if (mainItems.some((mainItem) => mainItem.nameKey === item.nameKey)) return "main"
  if (resourceItems.some((resourceItem) => resourceItem.nameKey === item.nameKey)) return "resources"
  return "account"
}

const getItemSection = (item: NavItem, layout: SidebarLayout): SidebarSection => layout[item.nameKey] ?? getDefaultSection(item)

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [supportDialogOpen, setSupportDialogOpen] = useState(false)
  const [sidebarDialogOpen, setSidebarDialogOpen] = useState(false)
  const [sidebarLayout, setSidebarLayout] = useState<SidebarLayout>({})
  const { currentUser, logoutUser, isReady } = useAppSession()
  const { t } = useAppPreferences()

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(sidebarLayoutKey) ?? "{}") as SidebarLayout
      setSidebarLayout(parsed && typeof parsed === "object" ? parsed : {})
    } catch {
      setSidebarLayout({})
    }
  }, [])

  const saveSidebarLayout = (nextLayout: SidebarLayout) => {
    setSidebarLayout(nextLayout)
    window.localStorage.setItem(sidebarLayoutKey, JSON.stringify(nextLayout))
  }

  const visibleMainItems = useMemo(
    () => customizableItems.filter((item) => getItemSection(item, sidebarLayout) === "main"),
    [sidebarLayout]
  )
  const visibleResourceItems = useMemo(
    () => customizableItems.filter((item) => getItemSection(item, sidebarLayout) === "resources"),
    [sidebarLayout]
  )
  const visibleAccountItems = useMemo(
    () => customizableItems.filter((item) => getItemSection(item, sidebarLayout) === "account"),
    [sidebarLayout]
  )

  useEffect(() => {
    if (!currentUser) {
      setNotificationCount(0)
      return
    }

    const syncNotifications = async () => {
      try {
        setNotificationCount(await fetchUnreadNotificationCount(currentUser.id))
      } catch (error) {
        console.error(error)
      }
    }

    void syncNotifications()
    return subscribeWorkspaceSync(() => {
      void syncNotifications()
    })
  }, [currentUser])

  useEffect(() => {
    if (pathname === "/dashboard/notificacoes") {
      setNotificationCount(0)
    }
  }, [pathname])

  useEffect(() => {
    setResourcesOpen(visibleResourceItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)))
    setAccountOpen(visibleAccountItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)))
  }, [pathname, visibleAccountItems, visibleResourceItems])

  const closeMobile = () => setMobileMenuOpen(false)

  const handleLogout = async () => {
    closeMobile()
    await logoutUser()
    router.push("/")
    router.refresh()
  }

  const renderItem = (item: NavItem, compact = false) => {
    const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname === item.href || pathname.startsWith(`${item.href}/`)
    const isLocked = isReady
      ? (currentUser ? !canAccessDashboardPath(item.href, currentUser.plan, currentUser.subscriptionStatus, currentUser.trialEndsAt) : true)
      : false

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={closeMobile}
        title={isLocked ? `Disponível no plano ${PLAN_LABELS[item.minimumPlan]}` : t(item.nameKey)}
        className={cn(
          "premium-sidebar-item group/nav relative flex items-center gap-3 rounded-[10px] border border-transparent font-medium tracking-[-0.045em] transition-colors duration-150",
          compact ? "h-10 px-3 text-[14px]" : "h-12 px-3 text-[15px]",
          isActive ? "is-active bg-[#9de96c] text-[#21351f]" : "text-muted-foreground hover:bg-[#9de96c] hover:text-[#21351f]",
          isLocked && "opacity-70"
        )}
      >
        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-current">
          <item.icon className={compact ? "h-5 w-5" : "h-[23px] w-[23px]"} />
        </div>
        <span className="min-w-0 flex-1 truncate">{t(item.nameKey)}</span>
        {item.isNotification && <NotificationBadge count={notificationCount} />}
        {isLocked && <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      </Link>
    )
  }

  const groupButton = (label: string, icon: LucideIcon, isOpen: boolean, onClick: () => void, isActive: boolean) => {
    const Icon = icon

    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "premium-sidebar-item group/nav relative flex h-12 w-full items-center gap-3 rounded-[10px] border border-transparent px-3 text-[15px] font-medium tracking-[-0.045em] transition-colors duration-150",
          isActive ? "is-active bg-[#9de96c] text-[#21351f]" : "text-muted-foreground hover:bg-[#9de96c] hover:text-[#21351f]"
        )}
      >
        <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-current">
          <Icon className="h-[23px] w-[23px]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
    )
  }

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground lg:hidden"
        onClick={() => setMobileMenuOpen((current) => !current)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />}

      <aside
        className={cn(
          "premium-floating-sidebar fixed left-0 top-0 z-40 h-screen w-80 border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-out lg:left-0 lg:top-0 lg:h-screen lg:w-[320px] lg:translate-x-0 lg:overflow-hidden lg:rounded-none lg:border-r lg:shadow-none",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border px-5 py-6">
            <Link href="/dashboard" onClick={closeMobile} className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-secondary">
              <img src="/logo.png" alt="Mallow" className="h-8 w-8 shrink-0 rounded-md object-contain" />
              <p className="truncate text-sm font-semibold text-sidebar-foreground">Mallow</p>
            </Link>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-5 py-6">
            <div className="mb-5 flex h-11 items-center justify-between rounded-[10px] border border-sidebar-border bg-card px-3.5 text-[18px] font-normal tracking-[-0.05em] text-foreground">
              <span>Meu projeto</span>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>

            {visibleMainItems.map((item) => renderItem(item))}

            <div className="space-y-1">
              {groupButton(
                "Recursos",
                Boxes,
                resourcesOpen,
                () => {
                  setResourcesOpen((current) => !current)
                  setAccountOpen(false)
                },
                resourcesOpen || visibleResourceItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
              )}
              {resourcesOpen && <div className="space-y-1 pl-4">{visibleResourceItems.map((item) => renderItem(item, true))}</div>}
            </div>

            <div className="space-y-1">
              {groupButton(
                "Conta",
                UserRoundKey,
                accountOpen,
                () => {
                  setAccountOpen((current) => !current)
                  setResourcesOpen(false)
                },
                accountOpen || visibleAccountItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
              )}
              {accountOpen && <div className="space-y-1 pl-4">{visibleAccountItems.map((item) => renderItem(item, true))}</div>}
            </div>
          </nav>

          <div className="bg-sidebar px-5 py-4 [direction:ltr]">
            {currentUser ? (
              <div>
                {!canAccessDashboardPath("/dashboard/financeiro", currentUser.plan, currentUser.subscriptionStatus, currentUser.trialEndsAt) && (
                  <Button
                    type="button"
                    onClick={() => {
                      closeMobile()
                      router.push("/dashboard/planos")
                    }}
                    className="h-10 w-full justify-start rounded-[10px] bg-primary px-3 text-primary-foreground hover:bg-primary/90"
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSupportDialogOpen(true)}
                  className="h-auto w-full justify-start gap-2.5 rounded-none bg-transparent p-0 text-[16px] font-medium tracking-[-0.05em] text-[#111] shadow-none hover:bg-transparent hover:text-[#111] dark:text-foreground dark:hover:text-foreground"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#8e8ea0]" />
                  <span>Suporte</span>
                </Button>
                <div className="my-5 h-px w-full bg-[#e3e3e8]" />
                <div className="flex w-full items-center justify-between gap-3 [direction:ltr]">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                      {currentUser.accountPhotoUrl ? (
                        <img src={currentUser.accountPhotoUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                          {currentUser.name?.[0]?.toUpperCase() ?? "E"}
                        </div>
                      )}
                    </div>
                    <p className="min-w-0 truncate text-[16px] font-medium tracking-[-0.05em] text-[#111] dark:text-foreground">{currentUser.name || "Editor"}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-auto w-auto shrink-0 bg-transparent p-0 text-[#8e8ea0] hover:bg-transparent hover:text-[#8e8ea0]"
                        aria-label="Abrir opções da conta"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top" className="w-44 rounded-xl border-border bg-card p-2 shadow-lg">
                      <DropdownMenuItem
                        onClick={() => {
                          closeMobile()
                          router.push("/dashboard/configuracoes")
                        }}
                        className="cursor-pointer rounded-lg px-3 py-2"
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setSidebarDialogOpen(true)}
                        className="cursor-pointer rounded-lg px-3 py-2"
                      >
                        <SlidersHorizontal className="h-4 w-4" />
                        Personalizar barra
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setLogoutDialogOpen(true)}
                        className="cursor-pointer rounded-lg px-3 py-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="max-w-[520px] overflow-hidden rounded-[14px] border-border bg-card p-0 shadow-xl" showCloseButton={false}>
          <div className="flex items-center justify-between border-b border-border bg-secondary/55 px-8 py-5">
            <DialogTitle className="text-[28px] font-semibold tracking-[-0.05em] text-foreground">Suporte</DialogTitle>
            <button
              type="button"
              onClick={() => setSupportDialogOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              aria-label="Fechar suporte"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-6 px-8 py-7">
            <DialogDescription className="sr-only">Abra o atendimento humanizado pelo WhatsApp.</DialogDescription>
            <div className="space-y-4">
              <p className="text-[22px] font-normal leading-snug tracking-[-0.045em] text-foreground">
                Você está prestes a acionar um <strong className="font-semibold">suporte humanizado</strong>
              </p>
              <p className="text-[18px] leading-7 tracking-[-0.035em] text-muted-foreground">
                Para agilizar o processo, mande seu problema seguido do CNPJ e email que utiliza na plataforma.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/dashboard/configuracoes")}
              className="flex w-full items-center gap-4 rounded-[12px] border border-border bg-card p-4 text-left transition-colors hover:border-primary/70 hover:bg-primary/10"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-muted-foreground">
                <GraduationCap className="h-7 w-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[18px] font-semibold tracking-[-0.04em] text-foreground">Documentação</span>
                <span className="block text-[15px] tracking-[-0.025em] text-muted-foreground">Sua dúvida pode estar aqui!</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            </button>
          </div>
          <div className="flex justify-end gap-3 border-t border-border bg-card px-8 py-5">
            <Button variant="outline" className="h-11 px-5 text-[16px]" onClick={() => setSupportDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="h-11 px-5 text-[16px]"
              onClick={() => {
                setSupportDialogOpen(false)
                window.open("https://wa.me/5581997988131", "_blank")
              }}
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chamar suporte
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="max-w-sm rounded-lg border-border bg-card shadow-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Sair da conta?</DialogTitle>
            <DialogDescription>Você será desconectado desta sessão.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => setLogoutDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => void handleLogout()}>
              Sair
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={sidebarDialogOpen} onOpenChange={setSidebarDialogOpen}>
        <DialogContent className="max-w-xl rounded-lg border-border bg-card shadow-sm">
          <DialogHeader>
            <DialogTitle>Personalizar barra lateral</DialogTitle>
            <DialogDescription>Escolha onde cada módulo aparece na sua barra.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {customizableItems.map((item) => {
              const section = getItemSection(item, sidebarLayout)

              return (
                <div key={item.nameKey} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">{t(item.nameKey)}</span>
                  </div>
                  <div className="flex rounded-md border border-border bg-card p-1">
                    {(["main", "resources", "account"] as SidebarSection[]).map((targetSection) => (
                      <button
                        key={targetSection}
                        type="button"
                        onClick={() => saveSidebarLayout({ ...sidebarLayout, [item.nameKey]: targetSection })}
                        className={cn(
                          "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                          section === targetSection ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        {targetSection === "main" ? "Principal" : targetSection === "resources" ? "Recursos" : "Conta"}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-border" onClick={() => saveSidebarLayout({})}>
              Restaurar padrão
            </Button>
            <Button onClick={() => setSidebarDialogOpen(false)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
