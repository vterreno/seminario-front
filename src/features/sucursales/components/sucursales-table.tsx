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
import { Sucursal } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { sucursalesColumns as columns, sucursalesColumns } from './sucursales-columns'
import { STORAGE_KEYS } from '@/lib/constants'
import { getStorageItem } from '@/hooks/use-local-storage'


type DataTableProps = {
  data: Sucursal[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onSuccess?: () => void
  canBulkAction: boolean
}

export function SucursalesTable({ data, search, navigate, onSuccess, canBulkAction }: DataTableProps) {
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
  const isSuperAdmin = !userData?.empresa?.id

  // Configurar columnas con los permisos y opciones
  const columns = sucursalesColumns({
    showEmpresaColumn: isSuperAdmin, // Solo mostrar columna empresa para superadmin
    canBulkAction: canBulkAction // Pasar el control de bulk actions
  })

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states (keys/defaults mirror sucursal route search schema)
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
      { columnId: 'codigo', searchKey: 'codigo', type: 'string' },
      { columnId: 'direccion', searchKey: 'direccion', type: 'string' },
      { columnId: 'estado', searchKey: 'estado', type: 'array' },
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
        searchPlaceholder='Buscar sucursales...'
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
