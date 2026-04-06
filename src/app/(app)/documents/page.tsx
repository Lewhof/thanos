'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Folder, Check } from 'lucide-react'

type UploadedFile = {
  id: string
  name: string
  size: string
  suggestedFolder: string
  confirmed: boolean
}

const folders = ['Legal', 'Finance', 'Personal', 'Business', 'Contracts', 'Reports', 'Other']

export default function DocumentsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList) => {
    const newFiles: UploadedFile[] = Array.from(incoming).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      suggestedFolder: folders[Math.floor(Math.random() * folders.length)], // placeholder until AI classification is wired
      confirmed: false,
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const confirmFolder = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, confirmed: true } : f)))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground mt-1">Upload files — AI suggests where they belong.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-colors mb-8
          ${dragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'}`}
      >
        <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm font-medium">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">PDF, Word, Excel, images — any format</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Uploaded Files</h2>
          {files.map((file) => (
            <Card key={file.id}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Folder size={14} />
                    <span className="hidden sm:inline">AI suggests:</span>
                    <Badge variant="secondary">{file.suggestedFolder}</Badge>
                  </div>
                  {file.confirmed ? (
                    <Badge variant="outline" className="text-green-500 border-green-500">
                      <Check size={12} className="mr-1" /> Saved
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => confirmFolder(file.id)}>
                      Confirm
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Folder browser */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Folders</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {folders.map((folder) => (
            <Card key={folder} className="cursor-pointer hover:bg-accent/50 transition-colors">
              <CardContent className="flex items-center gap-3 py-4">
                <Folder size={16} className="text-muted-foreground" />
                <span className="text-sm font-medium">{folder}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
