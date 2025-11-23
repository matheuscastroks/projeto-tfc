'use client'
'use no memo'

import * as React from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Skeleton } from '@ui/skeleton'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'
import type { TopConvertingFiltersResponse } from '@/lib/types/insights'

interface FilterItem {
  combination: Record<string, string | string[]>
  conversions: number
}

interface TopConvertingFiltersTableProps {
  data: TopConvertingFiltersResponse | undefined
  isLoading: boolean
}

const formatFilterCombination = (
  combination: Record<string, string | string[]>
): string => {
  const parts: string[] = []

  // Função para extrair valor (primeiro item se for array)
  // Os valores já vêm formatados do backend (capitalizados e sem hífens)
  const getValue = (value: string | string[]): string | null => {
    if (!value) return null
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : null
    }
    return value
  }

  // Ordem de exibição preferencial
  const displayOrder = [
    'tipo',
    'quartos',
    'suites',
    'banheiros',
    'vagas',
    'finalidade',
    'cidade',
    'bairro',
  ]

  // Processar campos na ordem preferencial
  for (const key of displayOrder) {
    const value = getValue(combination[key])
    if (value) {
      if (key === 'quartos') {
        parts.push(`${value} quartos`)
      } else if (key === 'suites') {
        parts.push(`${value} suítes`)
      } else if (key === 'banheiros') {
        parts.push(`${value} banheiros`)
      } else if (key === 'vagas') {
        parts.push(`${value} vagas`)
      } else {
        parts.push(value)
      }
    }
  }

  // Processar outros campos que não estão na ordem preferencial
  for (const [key, value] of Object.entries(combination)) {
    if (!displayOrder.includes(key)) {
      const extractedValue = getValue(value)
      if (extractedValue) {
        parts.push(extractedValue)
      }
    }
  }

  return parts.join(', ')
}

const columns: ColumnDef<FilterItem>[] = [
  {
    id: 'combination',
    accessorFn: (row) => formatFilterCombination(row.combination),
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Combinação de Filtros
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ getValue }) => (
      <p className="font-medium text-sm break-words leading-relaxed">
        {getValue() as string}
      </p>
    ),
  },
  {
    accessorKey: 'conversions',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Conversões
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ getValue }) => (
      <div className="text-right space-y-0.5">
        <p className="font-bold text-lg">
          {(getValue() as number).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">conversões</p>
      </div>
    ),
  },
]

export function TopConvertingFiltersTable({
  data,
  isLoading,
}: TopConvertingFiltersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const tableData = React.useMemo(() => data?.filters || [], [data?.filters])

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      globalFilter,
      pagination,
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!data?.filters || data.filters.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          Sem dados de filtros que convertem disponíveis para o período
          selecionado.
        </div>
      </div>
    )
  }

  const pageStart = pagination.pageIndex * pagination.pageSize + 1
  const pageEnd = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    table.getFilteredRowModel().rows.length
  )
  const totalResults = table.getFilteredRowModel().rows.length
  const currentPage = pagination.pageIndex + 1
  const totalPages = table.getPageCount()

  return (
    <div className="space-y-6">
      {/* Filtro Global */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar combinações de filtros..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        {globalFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGlobalFilter('')}
            className="h-10"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-12 px-6 font-semibold"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="text-muted-foreground font-medium">
                        Nenhum resultado encontrado
                      </p>
                      {globalFilter && (
                        <p className="text-xs text-muted-foreground">
                          Tente ajustar os filtros de busca
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Controles de Paginação */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
        <div className="text-sm text-muted-foreground">
          Mostrando{' '}
          <span className="font-medium text-foreground">{pageStart}</span> -{' '}
          <span className="font-medium text-foreground">{pageEnd}</span> de{' '}
          <span className="font-medium text-foreground">{totalResults}</span>{' '}
          resultados
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primeira página</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-9"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          <div className="flex items-center gap-1 px-3 text-sm font-medium">
            <span>Página</span>
            <span className="text-foreground">{currentPage}</span>
            <span>de</span>
            <span className="text-foreground">{totalPages}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-9"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Próxima página</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="h-9"
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
