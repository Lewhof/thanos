import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitFork, FileText, MessageSquare, Activity } from 'lucide-react'

const widgets = [
  {
    title: 'Diagrams',
    icon: GitFork,
    value: '0',
    description: 'Flows & charts',
    href: '/diagrams',
  },
  {
    title: 'Documents',
    icon: FileText,
    value: '0',
    description: 'Uploaded files',
    href: '/documents',
  },
  {
    title: 'Chat',
    icon: MessageSquare,
    value: 'Online',
    description: 'AI assistant',
    href: '/chat',
  },
  {
    title: 'Activity',
    icon: Activity,
    value: 'Today',
    description: 'Recent actions',
    href: '#',
  },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Lew.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {widgets.map(({ title, icon: Icon, value, description }) => (
          <Card key={title} className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No documents yet. Upload your first file.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Diagrams</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No diagrams yet. Create your first flow.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
