'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardLayout } from '@/lib/use-dashboard-layout'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'
import { useIsMobile } from '@/lib/use-is-mobile'

export default function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const { layout, widgets, handleLayoutChange, deleteWidget, addWidget, resetLayout } = useDashboardLayout()
  const isMobile = useIsMobile()

  // On mobile, always disable edit mode (drag/resize not supported on touch)
  const effectiveEditMode = isMobile ? false : isEditMode

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back.</p>
        </div>
        {/* Edit layout controls — hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
            >
              Reset layout
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode((v) => !v)}
          >
            {isEditMode ? 'Done' : 'Edit layout'}
          </Button>
        </div>
      </div>

      <DashboardGrid
        widgets={widgets}
        layout={layout}
        isEditMode={effectiveEditMode}
        onLayoutChange={handleLayoutChange}
        onDeleteWidget={deleteWidget}
        onAddWidget={addWidget}
        isMobile={isMobile}
      />
    </div>
  )
}
