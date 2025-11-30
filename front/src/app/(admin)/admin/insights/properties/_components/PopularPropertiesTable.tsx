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
  ExternalLink,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'

interface Property {
  codigo: string
  url: string
  views: number
  favorites: number
  leads: number
  engagementScore: number
}

interface PopularPropertiesTableProps {
  data: Property[]
}

const columns: ColumnDef<Property>[] = [
  {
    accessorKey: 'codigo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Imóvel
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const codigo = row.getValue('codigo') as string
      const url = row.original.url

      return (
        <div className="space-y-1">
          <div className="font-semibold text-sm">#{codigo}</div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 transition-colors"
            >
              <span className="truncate max-w-xs">{url}</span>
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground/50 cursor-not-allowed">
                    <span className="italic">Link indisponível</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>A URL deste imóvel não foi capturada</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'views',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Visualizações
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row, table }) => {
      const val = row.getValue<number>('views')
      const max = Math.max(...table.getFilteredRowModel().rows.map(r => r.getValue<number>('views')), 1)
      const percent = (val / max)

      return (
        <div className="flex justify-end">
          <div
            className="px-2.5 py-1 rounded-md font-medium text-xs transition-colors"
            style={{
              backgroundColor: `hsl(var(--primary) / ${Math.max(percent * 0.25, 0.05)})`,
              color: 'hsl(var(--primary))'
            }}
          >
            {val.toLocaleString()}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'favorites',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Favoritos
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row, table }) => {
      const val = row.getValue<number>('favorites')
      const max = Math.max(...table.getFilteredRowModel().rows.map(r => r.getValue<number>('favorites')), 1)
      const percent = (val / max)

      return (
        <div className="flex justify-end">
          <div
            className="px-2.5 py-1 rounded-md font-medium text-xs transition-colors"
            style={{
              backgroundColor: `hsl(0 84% 60% / ${Math.max(percent * 0.25, 0.05)})`, // Red-400 equivalent
              color: 'hsl(0 84% 60%)'
            }}
          >
            {val.toLocaleString()}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'leads',
    header: ({ column }) => {
      return (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Leads
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    cell: ({ row, table }) => {
      const val = row.getValue<number>('leads')
      const max = Math.max(...table.getFilteredRowModel().rows.map(r => r.getValue<number>('leads')), 1)
      const percent = (val / max)

      return (
        <div className="flex justify-end">
          <div
            className="px-2.5 py-1 rounded-md font-medium text-xs transition-colors"
            style={{
              backgroundColor: `hsl(142 76% 36% / ${Math.max(percent * 0.25, 0.05)})`, // Green-600 equivalent
              color: 'hsl(142 76% 36%)'
            }}
          >
            {val.toLocaleString()}
          </div>
        </div>
      )
    },
  },
]

export function PopularPropertiesTable({ data }: PopularPropertiesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const table = useReactTable({
    data,
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

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum dado disponível</p>
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
    <div className="space-y-3">
      {/* Filtro Global */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar em todas as colunas..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        {globalFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGlobalFilter('')}
            className="h-9"
          >
            Limpar
          </Button>
        )}
      </div>

      {/* Tabela */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="h-10 px-4 font-semibold text-sm"
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
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <p className="text-muted-foreground font-medium text-sm">
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
                      <TableCell key={cell.id} className="px-4 py-2.5">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1">
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
