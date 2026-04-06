import { AppSidebar } from '@/components/app-sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      {/* pb-16 reserves space for the mobile bottom nav (56px) */}
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
