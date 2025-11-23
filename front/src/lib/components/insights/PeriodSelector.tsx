'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
import { Calendar } from '@ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select'
import { cn } from 'src/utils/utils'

interface PeriodSelectorProps {
  onPeriodChange?: (start: Date, end: Date) => void
  defaultPeriod?: number
}

const presetPeriods = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
  { label: 'Personalizado', days: 0 },
]

export function PeriodSelector({
  onPeriodChange,
  defaultPeriod = 30,
}: PeriodSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState(String(defaultPeriod))
  const [customStart, setCustomStart] = useState<Date>()
  const [customEnd, setCustomEnd] = useState<Date>()
  const [showCustom, setShowCustom] = useState(false)
  const [dateError, setDateError] = useState<string | null>(null)

  const createDateRange = (days: number) => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    const start = new Date()
    start.setDate(start.getDate() - days)
    start.setHours(0, 0, 0, 0)
    return { start, end }
  }

  useEffect(() => {
    if (!showCustom && selectedPreset !== '0') {
      const { start, end } = createDateRange(parseInt(selectedPreset))
      onPeriodChange?.(start, end)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)
    setDateError(null)

    if (value === '0') {
      setShowCustom(true)
      return
    }

    setShowCustom(false)
    const days = parseInt(value)
    const { start, end } = createDateRange(days)
    onPeriodChange?.(start, end)
  }

  const handleCustomDateChange = () => {
    if (!customStart || !customEnd) {
      setDateError('Selecione ambas as datas')
      return
    }

    if (customStart > customEnd) {
      setDateError('A data inicial deve ser anterior à data final')
      return
    }

    setDateError(null)

    const start = new Date(customStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(customEnd)
    end.setHours(23, 59, 59, 999)

    onPeriodChange?.(start, end)
  }

  useEffect(() => {
    if (showCustom && customStart && customEnd) {
      if (customStart > customEnd) {
        setDateError('A data inicial deve ser anterior à data final')
      } else {
        setDateError(null)
      }
    } else if (showCustom && (customStart || customEnd)) {
      setDateError(null)
    }
  }, [customStart, customEnd, showCustom])

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          {presetPeriods.map((period) => (
            <SelectItem key={period.days} value={String(period.days)}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showCustom && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !customStart && 'text-muted-foreground',
                    dateError &&
                      customStart &&
                      customStart > (customEnd || new Date()) &&
                      'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customStart
                    ? format(customStart, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
                    : 'Data inicial'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStart}
                  onSelect={setCustomStart}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !customEnd && 'text-muted-foreground',
                    dateError &&
                      customEnd &&
                      customStart &&
                      customStart > customEnd &&
                      'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customEnd
                    ? format(customEnd, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
                    : 'Data final'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customEnd}
                  onSelect={setCustomEnd}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button
              onClick={handleCustomDateChange}
              disabled={!customStart || !customEnd || !!dateError}
            >
              Aplicar
            </Button>
          </div>
          {dateError && <p className="text-sm text-destructive">{dateError}</p>}
        </div>
      )}
    </div>
  )
}
