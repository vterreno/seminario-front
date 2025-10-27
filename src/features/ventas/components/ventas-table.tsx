import { useEffect, useState, useMemo } from 'react'
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
import { Venta } from '../data/schema'
import { ventasColumns } from './ventas-columns'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableProps = {
  data: Venta[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onSuccess?: () => void
  canBulkAction: boolean
  isSuperUser?: boolean
}

export function VentasTable({ data, search, navigate, onSuccess, canBulkAction, isSuperUser = false }: DataTableProps) {
  const { hasPermission } = usePermissions()
  
  // Calcular permisos una sola vez
  const permissions = useMemo(() => ({
    canView: hasPermission('ventas_ver'),
    canEdit: hasPermission('ventas_modificar'),
    canDelete: hasPermission('ventas_eliminar'),
  }), [hasPermission])
  
  // Configurar columnas con las opciones
  const columns = useMemo(() => ventasColumns({
    canBulkAction: canBulkAction, // Pasar el control de bulk actions
    isSuperUser: isSuperUser, // Pasar el control de columna empresa
    canView: permissions.canView,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  }), [canBulkAction, isSuperUser, permissions])

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'fecha_venta', desc: true } // Ordenamiento por defecto: fecha descendente
  ])

  // Synced with URL states (keys/defaults mirror venta route search schema)
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
      // numero_venta per-column text filter
      { columnId: 'numero_venta', searchKey: 'numero_venta', type: 'string' },
      // fecha_venta filter
      { columnId: 'fecha_venta', searchKey: 'fecha_venta', type: 'string' },
      // metodo_pago filter
      { columnId: 'metodo_pago', searchKey: 'metodo_pago', type: 'array' },
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
        searchPlaceholder='Buscar por número de venta...'
        searchKey='numero_venta'
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
