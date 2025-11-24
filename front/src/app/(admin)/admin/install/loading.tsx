import { Skeleton } from '@ui/skeleton'
import { Card, CardContent, CardHeader } from '@ui/card'

export default function InstallLoading() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-12 w-full max-w-2xl" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Code Snippet Card Skeleton */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="h-5 w-64" />
            </div>
            <Skeleton className="h-7 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-xl" />
        </CardContent>
      </Card>

      {/* Steps Section Skeleton */}
      <div className="space-y-6">
        <div className="text-center space-y-3">
          <Skeleton className="h-9 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-2">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-2xl mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
              <Skeleton className="h-5 w-48 mx-auto" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-11 w-44" />
        <Skeleton className="h-11 w-36" />
      </div>
    </div>
  )
}
