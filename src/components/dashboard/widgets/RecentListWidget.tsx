'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  title: string
  emptyMessage: string
}

export function RecentListWidget({ title, emptyMessage }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{emptyMessage}.</p>
      </CardContent>
    </Card>
  )
}
