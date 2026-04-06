'use client'

import { Users } from 'lucide-react'

interface Collaborator {
  userId: string
  displayName: string
  initials: string
  color: string
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[]
}

export default function CollaboratorAvatars({ collaborators }: CollaboratorAvatarsProps) {
  if (collaborators.length === 0) return null

  const visible = collaborators.slice(0, 3)
  const overflow = collaborators.length - 3

  return (
    <div className="flex items-center gap-1.5" title={`${collaborators.length} collaborator${collaborators.length !== 1 ? 's' : ''} online`}>
      <Users size={12} className="text-muted-foreground" />
      <div className="flex -space-x-1.5">
        {visible.map((c) => (
          <div
            key={c.userId}
            className="flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-bold ring-2 ring-card"
            style={{ background: c.color }}
            title={c.displayName}
          >
            {c.initials}
          </div>
        ))}
        {overflow > 0 && (
          <div
            className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-[9px] font-bold ring-2 ring-card"
            title={`+${overflow} more`}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
