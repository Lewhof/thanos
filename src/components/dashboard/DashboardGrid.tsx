'use client'
import { useMemo } from 'react'
import React from 'react'
import { ResponsiveGridLayout, useContainerWidth, Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import { WidgetDef } from '@/lib/dashboard-widgets'
import { WidgetWrapper } from './WidgetWrapper'
import { NavStatWidget } from './widgets/NavStatWidget'
import { AgentCardWidget } from './widgets/AgentCardWidget'
import { RecentListWidget } from './widgets/RecentListWidget'
import { AddWidgetPicker } from './AddWidgetPicker'

interface Props {
  widgets: WidgetDef[]
  layout: LayoutItem[]
  isEditMode: boolean
  onLayoutChange: (layout: Layout) => void
  onDeleteWidget: (id: string) => void
  onAddWidget?: (def: WidgetDef) => void
  isMobile?: boolean
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

export function DashboardGrid({ widgets, layout, isEditMode, onLayoutChange, onDeleteWidget, onAddWidget, isMobile }: Props) {
  const { width, containerRef } = useContainerWidth({ initialWidth: 1200 })

  const layouts: ResponsiveLayouts = useMemo(() => ({
    lg: layout,
    md: layout,
    sm: layout,
  }), [layout])

  // On mobile: render a simple stacked list — no drag/resize
  if (isMobile) {
    return (
      <div className="flex flex-col gap-3">
        {widgets.map(def => (
          <div key={def.id} className="w-full min-h-[120px]">
            <WidgetWrapper
              id={def.id}
              title={def.title}
              isEditMode={false}
              onDelete={onDeleteWidget}
            >
              {renderWidget(def)}
            </WidgetWrapper>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef as React.RefObject<HTMLDivElement>}>
      <ResponsiveGridLayout
        width={width ?? 1200}
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
        rowHeight={60}
        dragConfig={{ enabled: isEditMode, handle: '.widget-drag-handle' }}
        resizeConfig={{ enabled: isEditMode }}
        onLayoutChange={(_layout, allLayouts) => {
          const lgLayout = allLayouts.lg
          if (lgLayout) onLayoutChange(lgLayout)
        }}
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
      {isEditMode && onAddWidget && (
        <div className="mt-4 flex justify-center">
          <AddWidgetPicker widgets={widgets} onAdd={onAddWidget} />
        </div>
      )}
    </div>
  )
}
