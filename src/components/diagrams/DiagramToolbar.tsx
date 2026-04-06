'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Undo2, Redo2, Maximize2, Download, Map, Sun, Moon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import SaveStatusBadge from './SaveStatusBadge'
import type { SaveStatus } from '@/lib/diagram-types'

interface DiagramToolbarProps {
  diagramId: string
  title: string
  saveStatus: SaveStatus
  canUndo: boolean
  canRedo: boolean
  showMinimap: boolean
  colorMode: 'dark' | 'light'
  onUndo: () => void
  onRedo: () => void
  onFitView: () => void
  onExportPng: () => void
  onToggleMinimap: () => void
  onToggleColorMode: () => void
  onTitleChange: (title: string) => Promise<void>
}

export default function DiagramToolbar({
  title,
  saveStatus,
  canUndo,
  canRedo,
  showMinimap,
  colorMode,
  onUndo,
  onRedo,
  onFitView,
  onExportPng,
  onToggleMinimap,
  onToggleColorMode,
  onTitleChange,
}: DiagramToolbarProps) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  const commitTitle = async () => {
    setEditingTitle(false)
    if (titleValue.trim() && titleValue !== title) {
      await onTitleChange(titleValue.trim())
    } else {
      setTitleValue(title)
    }
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-10 flex-shrink-0">
      {/* Left: back + title */}
      <div className="flex items-center gap-2">
        <Link
          href="/diagrams"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'h-7 w-7 p-0' })}
        >
          <ArrowLeft size={16} />
        </Link>
        <Separator orientation="vertical" className="h-5" />
        {editingTitle ? (
          <Input
            ref={inputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle()
              if (e.key === 'Escape') {
                setTitleValue(title)
                setEditingTitle(false)
              }
            }}
            className="h-7 text-sm font-medium w-48"
            autoFocus
          />
        ) : (
          <button
            className="text-sm font-medium px-2 py-1 rounded hover:bg-accent transition-colors"
            onClick={() => {
              setEditingTitle(true)
              setTitleValue(title)
              setTimeout(() => inputRef.current?.select(), 0)
            }}
          >
            {title}
          </button>
        )}
      </div>

      {/* Center: save status */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <SaveStatusBadge status={saveStatus} />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize2 size={15} />
        </Button>
        <Button
          variant={showMinimap ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onToggleMinimap}
          title="Toggle Minimap"
        >
          <Map size={15} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onToggleColorMode}
          title="Toggle Theme"
        >
          {colorMode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </Button>
        <Separator orientation="vertical" className="h-5 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 gap-1 text-xs"
          onClick={onExportPng}
          title="Export PNG"
        >
          <Download size={14} />
          PNG
        </Button>
      </div>
    </div>
  )
}
