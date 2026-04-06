'use client'

import { useState, useRef, useCallback } from 'react'
import { useReactFlow, type NodeProps } from '@xyflow/react'
import type { CommentNodeData } from '@/lib/diagram-types'
import type { Node } from '@xyflow/react'

export type CommentAppNode = Node<CommentNodeData>

export default function CommentNode({ id, data }: NodeProps<CommentAppNode>) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(data.text ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setNodes } = useReactFlow()

  const commitText = useCallback(() => {
    setEditing(false)
    setNodes((nds) =>
      nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, text } } : n))
    )
  }, [id, text, setNodes])

  const dateStr = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
    : ''

  return (
    <div
      className="relative min-w-[160px] min-h-[80px] max-w-[240px]"
      onDoubleClick={() => {
        setEditing(true)
        setTimeout(() => textareaRef.current?.focus(), 0)
      }}
      style={{
        background: 'rgb(254, 249, 195)',
        border: '2px solid rgb(234, 179, 8)',
        borderRadius: '4px',
        boxShadow: '2px 3px 8px rgba(0,0,0,0.25)',
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
        padding: '8px',
        cursor: 'default',
      }}
    >
      {/* Folded corner */}
      <div
        className="absolute top-0 right-0 w-3.5 h-3.5"
        style={{
          background: 'linear-gradient(225deg, rgb(161,120,0) 50%, rgb(254,249,195) 50%)',
        }}
      />

      {/* Author + date */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <div
          className="flex items-center justify-center w-5 h-5 rounded-full text-white text-[9px] font-bold flex-shrink-0"
          style={{ background: 'rgb(161, 120, 0)' }}
        >
          {(data.author ?? 'A').slice(0, 2).toUpperCase()}
        </div>
        <span className="text-[10px] text-yellow-800 font-medium truncate flex-1">{data.author ?? 'Anonymous'}</span>
        {dateStr && <span className="text-[9px] text-yellow-700 flex-shrink-0">{dateStr}</span>}
      </div>

      {/* Text content */}
      {editing ? (
        <textarea
          ref={textareaRef}
          className="nodrag w-full bg-transparent outline-none text-xs text-yellow-900 resize-none"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commitText()
            }
            if (e.key === 'Escape') {
              setText(data.text ?? '')
              setEditing(false)
            }
          }}
        />
      ) : (
        <p className="text-xs text-yellow-900 whitespace-pre-wrap break-words leading-snug">
          {text || <span className="text-yellow-600 italic">Double-click to edit…</span>}
        </p>
      )}
    </div>
  )
}
