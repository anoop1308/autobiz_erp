'use client'

import { KanbanMain } from '@/components/kanban/kanbanMain';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function KanbanPage() {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])
  return (
    isLoading ? (
      <div className="gap-4 flex flex-col p-5">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    ) : <KanbanMain />
  )
}
