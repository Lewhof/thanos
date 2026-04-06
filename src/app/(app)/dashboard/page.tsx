'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useDashboardLayout } from '@/lib/use-dashboard-layout'
import { DashboardGrid } from '@/components/dashboard/DashboardGrid'

export default function DashboardPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const { layout, widgets, handleLayoutChange, deleteWidget, addWidget, resetLayout } = useDashboardLayout()

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back.</p>
        </div>
        <div className="flex items-center gap-2">
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
        isEditMode={isEditMode}
        onLayoutChange={handleLayoutChange}
        onDeleteWidget={deleteWidget}
        onAddWidget={addWidget}
      />
    </div>
  )
}
