'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Undo2, Redo2, Maximize2, Download, Map, Sun, Moon, Grid3X3,
  Copy, FileImage, Sparkles, LayoutTemplate, MessageSquare, Presentation,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import SaveStatusBadge from './SaveStatusBadge'
import CollaboratorAvatars from './CollaboratorAvatars'
import type { SaveStatus } from '@/lib/diagram-types'

interface Collaborator {
  userId: string
  displayName: string
  initials: string
  color: string
}

interface DiagramToolbarProps {
  diagramId: string
  title: string
  saveStatus: SaveStatus
  canUndo: boolean
  canRedo: boolean
  showMinimap: boolean
  snapToGrid: boolean
  colorMode: 'dark' | 'light'
  collaborators?: Collaborator[]
  presentationActive?: boolean
  onUndo: () => void
  onRedo: () => void
  onFitView: () => void
  onExportPng: () => void
  onExportSvg: () => void
  onToggleMinimap: () => void
  onToggleSnapToGrid: () => void
  onToggleColorMode: () => void
  onTitleChange: (title: string) => Promise<void>
  onAiGenerate?: () => void
  onTemplates?: () => void
  onAddComment?: () => void
  onTogglePresentation?: () => void
  onToggleComments?: () => void
}

export default function DiagramToolbar({
  title,
  saveStatus,
  canUndo,
  canRedo,
  showMinimap,
  snapToGrid,
  colorMode,
  collaborators = [],
  presentationActive = false,
  onUndo,
  onRedo,
  onFitView,
  onExportPng,
  onExportSvg,
  onToggleMinimap,
  onToggleSnapToGrid,
  onToggleColorMode,
  onTitleChange,
  onAiGenerate,
  onTemplates,
  onAddComment,
  onTogglePresentation,
  onToggleComments,
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
    <div className="flex items-center px-2 md:px-3 py-2 border-b border-border bg-card/80 backdrop-blur-sm z-10 flex-shrink-0 gap-2 overflow-x-auto">
      {/* Left: back + title */}
      <div className="flex items-center gap-2 shrink-0">
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
            className="h-7 text-sm font-medium w-32 md:w-48"
            autoFocus
          />
        ) : (
          <button
            className="text-sm font-medium px-2 py-1 rounded hover:bg-accent transition-colors max-w-[100px] md:max-w-none truncate"
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

      {/* Save status — pushed right but scrolls with toolbar on mobile */}
      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 pointer-events-none">
        <SaveStatusBadge status={saveStatus} />
      </div>
      <SaveStatusBadge status={saveStatus} className="md:hidden shrink-0" />

      {/* Spacer */}
      <div className="flex-1 shrink-0 min-w-2" />

      {/* Right: actions — scrollable on mobile */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Collaborators */}
        {collaborators.length > 0 && (
          <>
            <CollaboratorAvatars collaborators={collaborators} />
            <Separator orientation="vertical" className="h-5 mx-1" />
          </>
        )}

        {/* AI Generate */}
        {onAiGenerate && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs text-purple-400 hover:text-purple-300"
            onClick={onAiGenerate}
            title="AI Generate Diagram"
          >
            <Sparkles size={14} />
            <span className="hidden md:inline">AI</span>
          </Button>
        )}

        {/* Templates */}
        {onTemplates && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs"
            onClick={onTemplates}
            title="Diagram Templates"
          >
            <LayoutTemplate size={14} />
            <span className="hidden md:inline">Templates</span>
          </Button>
        )}

        <Separator orientation="vertical" className="h-5 mx-1" />

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
          variant={snapToGrid ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onToggleSnapToGrid}
          title={snapToGrid ? 'Snap to Grid: ON' : 'Snap to Grid: OFF'}
        >
          <Grid3X3 size={15} />
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

        {/* Comments */}
        {onAddComment && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1 text-xs text-yellow-400 hover:text-yellow-300"
            onClick={onAddComment}
            title="Add Comment"
          >
            <MessageSquare size={14} />
            <span className="hidden md:inline">Comment</span>
          </Button>
        )}

        {onToggleComments && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-xs text-muted-foreground"
            onClick={onToggleComments}
            title="Toggle Comments Panel"
          >
            Panel
          </Button>
        )}

        {/* Present */}
        {onTogglePresentation && (
          <Button
            variant={presentationActive ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2 gap-1 text-xs"
            onClick={onTogglePresentation}
            title="Presentation Mode"
          >
            <Presentation size={14} />
            <span className="hidden md:inline">Present</span>
          </Button>
        )}

        <Separator orientation="vertical" className="h-5 mx-1" />
        {/* Export dropdown */}
        <Popover>
          <PopoverTrigger
            className="inline-flex items-center gap-1 h-7 px-2 text-xs rounded-md hover:bg-accent font-medium transition-colors whitespace-nowrap"
            title="Export"
          >
            <Download size={14} />
            Export
          </PopoverTrigger>
          <PopoverContent className="w-36 p-1" align="end">
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent"
              onClick={onExportPng}
            >
              <Download size={12} />
              Export PNG
            </button>
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded hover:bg-accent"
              onClick={onExportSvg}
            >
              <FileImage size={12} />
              Export SVG
            </button>
          </PopoverContent>
        </Popover>
        {/* Copy shortcut hint */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          title="Copy selected (Ctrl+C) / Paste (Ctrl+V)"
        >
          <Copy size={14} />
        </Button>
      </div>
    </div>
  )
}
