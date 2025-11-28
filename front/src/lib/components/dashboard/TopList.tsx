import { Card, CardContent, CardHeader, CardTitle } from '@ui/card'
import { Badge } from '@ui/badge'
import { ScrollArea } from '@ui/scroll-area'

interface TopListItem {
  label: string
  value: number | string
  subValue?: string
  badge?: string
}

interface TopListProps {
  title: string
  items: TopListItem[]
  icon?: React.ReactNode
}

export function TopList({ title, items, icon }: TopListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p
                    className="text-sm font-medium leading-none truncate max-w-[180px]"
                    title={item.label}
                  >
                    {item.label}
                  </p>
                  {item.subValue && (
                    <p className="text-xs text-muted-foreground">
                      {item.subValue}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                  <div className="font-medium text-sm">
                    {typeof item.value === 'number'
                      ? item.value.toLocaleString()
                      : item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
