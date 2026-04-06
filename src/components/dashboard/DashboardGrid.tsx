'use client'
import { useMemo } from 'react'
import { Responsive, WidthProvider, Layout } from 'react-grid-layout'
import { WidgetDef } from '@/lib/dashboard-widgets'
import { WidgetWrapper } from './WidgetWrapper'
import { NavStatWidget } from './widgets/NavStatWidget'
import { AgentCardWidget } from './widgets/AgentCardWidget'
import { RecentListWidget } from './widgets/RecentListWidget'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface Props {
  widgets: WidgetDef[]
  layout: Layout[]
  isEditMode: boolean
  onLayoutChange: (layout: Layout[]) => void
  onDeleteWidget: (id: string) => void
  onAddWidget?: (def: WidgetDef) => void
}

function renderWidget(def: WidgetDef) {
  if (def.type === 'nav-stat') {
    const p = def.props as any
    return <NavStatWidget title={p.title} icon={p.icon} value={p.value} description={p.description} href={p.href} />
  }
  if (def.type === 'agent-card') {
    const p = def.props as any
    return <AgentCardWidget modelId={p.modelId} label={p.label} />
  }
  if (def.type === 'recent-list') {
    const p = def.props as any
    return <RecentListWidget title={p.title} emptyMessage={p.emptyMessage} />
  }
  return null
}

export function DashboardGrid({ widgets, layout, isEditMode, onLayoutChange, onDeleteWidget, onAddWidget }: Props) {
  const layouts = useMemo(() => ({ lg: layout, md: layout, sm: layout }), [layout])

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
      rowHeight={60}
      isDraggable={isEditMode}
      isResizable={isEditMode}
      draggableHandle=".widget-drag-handle"
      onLayoutChange={(currentLayout) => onLayoutChange(currentLayout)}
      margin={[12, 12]}
    >
      {widgets.map(def => (
        <div key={def.id}>
          <WidgetWrapper
            id={def.id}
            title={def.title}
            isEditMode={isEditMode}
            onDelete={onDeleteWidget}
          >
            {renderWidget(def)}
          </WidgetWrapper>
        </div>
      ))}
    </ResponsiveGridLayout>
  )
}
