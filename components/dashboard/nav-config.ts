import {
  Bell,
  Boxes,
  BriefcaseBusiness,
  Calculator,
  ChartSpline,
  Clapperboard,
  HardDrive,
  Instagram,
  FileText,
  MessageSquarePlus,
  Store,
  UserRound,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { PlanId } from "@/lib/app-data"

export type DashboardNavNameKey =
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

export type DashboardNavItem = {
  nameKey: DashboardNavNameKey
  href: string
  icon: LucideIcon
  minimumPlan: PlanId
  isNotification?: boolean
}

export const dashboardNavItems: DashboardNavItem[] = [
  { nameKey: "dashboard", href: "/dashboard", icon: ChartSpline, minimumPlan: "essential" },
  { nameKey: "schedule", href: "/dashboard/kanban", icon: Clapperboard, minimumPlan: "essential" },
  { nameKey: "clients", href: "/dashboard/clientes", icon: UserRound, minimumPlan: "essential" },
  { nameKey: "notifications", href: "/dashboard/notificacoes", icon: Bell, minimumPlan: "essential", isNotification: true },
  { nameKey: "suggestions", href: "/dashboard/sugestoes", icon: MessageSquarePlus, minimumPlan: "free" },
  { nameKey: "quotes", href: "/dashboard/orcamentos", icon: FileText, minimumPlan: "essential" },
  { nameKey: "finance", href: "/dashboard/financeiro", icon: Wallet, minimumPlan: "essential" },
  { nameKey: "calculator", href: "/dashboard/calculadora", icon: Calculator, minimumPlan: "free" },
  { nameKey: "jobs", href: "/dashboard/vagas", icon: BriefcaseBusiness, minimumPlan: "essential" },
  { nameKey: "pack", href: "/dashboard/pack", icon: Boxes, minimumPlan: "starter" },
  { nameKey: "exchange", href: "/dashboard/exchange", icon: Store, minimumPlan: "starter" },
  { nameKey: "drive", href: "/dashboard/drive", icon: HardDrive, minimumPlan: "starter" },
  { nameKey: "reelsCourse", href: "/dashboard/curso-reels", icon: Video, minimumPlan: "essential" },
  { nameKey: "outreach", href: "/dashboard/prospeccao", icon: Instagram, minimumPlan: "essential" },
]
