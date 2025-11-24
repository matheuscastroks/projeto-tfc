import { Skeleton } from '@ui/skeleton'
import { Card, CardContent, CardHeader } from '@ui/card'

export default function PropertiesAnalyticsLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics and Chart Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Metrics */}
        <div className="space-y-6 col-span-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Column: Chart */}
        <Card className="border-2 col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Properties Table Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
