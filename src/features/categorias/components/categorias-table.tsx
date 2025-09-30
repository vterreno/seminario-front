import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { Categoria } from '../data/schema'
import { categoriasColumns } from './categorias-columns'
import { usePermissions } from '@/hooks/use-permissions'


type DataTableProps = {
  data: Categoria[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onSuccess?: () => void
  canBulkAction: boolean
}

export function CategoriasTable({ data, search, navigate, onSuccess, canBulkAction }: DataTableProps) {
  const { isSuperAdmin } = usePermissions()
  
  // Configurar columnas con las opciones
  const columns = categoriasColumns({
    canBulkAction: canBulkAction, // Pasar el control de bulk actions
    isSuperAdmin: isSuperAdmin // Pasar si es superadmin para mostrar columna empresa
  })

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'nombre', desc: false } // Ordenamiento por defecto: nombre ascendente
  ])

  // Synced with URL states (keys/defaults mirror categoría route search schema)
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      // name per-column text filter
      { columnId: 'nombre', searchKey: 'nombre', type: 'string' },
      // estado filter
      { columnId: 'estado', searchKey: 'estado', type: 'array' },
      // empresa filter - solo si es superadmin
      ...(isSuperAdmin ? [{ columnId: 'empresa', searchKey: 'empresa', type: 'array' as const }] : []),

    ],
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div
      className={
        'w-full space-y-2.5 overflow-auto'
      }
    >
      <DataTableToolbar 
        table={table}
        searchPlaceholder='Buscar categorías...'
        searchKey='nombre'
        filters={[
          {
            columnId: 'estado',
            title: 'Estado',
            options: [
              { label: 'Activo', value: 'true' },
              { label: 'Inactivo', value: 'false' },
            ],
          },
          // Solo mostrar filtro de empresa si el usuario es superadmin
          ...(isSuperAdmin ? [{
            columnId: 'empresa',
            title: 'Empresa',
            options: Array.from(
              // Usar un Set para eliminar duplicados
              new Set(
                data
                  // Filtrar categorías con empresa definida
                  .filter(item => item.empresa?.id)
                  // Extraer información de empresa para el filtro
                  .map(item => ({ 
                    label: item.empresa?.name || '', 
                    value: item.empresa?.id?.toString() || '' 
                  }))
                  // Filtrar opciones inválidas
                  .filter(option => option.label && option.value)
                  // Convertir a JSON para que el Set elimine duplicados
                  .map(item => JSON.stringify(item))
              )
            )
            // Convertir de nuevo a objetos
            .map(item => JSON.parse(item))
            // Ordenar alfabéticamente por nombre
            .sort((a, b) => a.label.localeCompare(b.label)),
          }] : [])
        ]}
      />
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-muted/50',
                        header.column.columnDef.meta?.className ?? ''
                      )}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className ?? ''
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {canBulkAction && <DataTableBulkActions table={table} onSuccess={onSuccess} />}
    </div>
  )
}
