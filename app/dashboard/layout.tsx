import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardAccessGuard } from "@/components/dashboard/access-guard"
import { DashboardTopbar } from "@/components/dashboard/topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-shell min-h-screen overflow-x-hidden bg-background">
      <DashboardSidebar />
      <main className="min-h-screen min-w-0 overflow-x-hidden bg-background transition-[padding] duration-300 lg:pl-[340px]">
        <div className="min-h-screen min-w-0 overflow-x-hidden px-3 pb-8 pt-5 sm:px-4 lg:px-7 lg:pb-10 lg:pt-8">
          <div className="mx-auto w-full min-w-0 max-w-[1380px]">
            <DashboardTopbar />
          </div>
          <div className="page-transition-shell dashboard-content-panel mx-auto w-full min-w-0 max-w-[1380px] overflow-x-hidden px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-8">
            <DashboardAccessGuard>{children}</DashboardAccessGuard>
          </div>
        </div>
      </main>
    </div>
  )
}
