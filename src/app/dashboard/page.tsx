'use client'
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

import data from "./data.json"

export default function Page() {
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
          ) : (
            <SectionCards />
          )}
          <div className="px-4 lg:px-6">
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ChartAreaInteractive />
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DataTable data={data} />
          )}
        </div>
      </div>
    </div>
  )
}
