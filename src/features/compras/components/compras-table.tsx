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
import { Compra } from '../data/schema'
import { comprasColumns } from './compras-columns'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableProps = {
  data: Compra[]
  search: Record<string, unknown>
  navigate: NavigateFn
  onSuccess?: () => void
  canBulkAction: boolean
  isSuperUser?: boolean
}

export function ComprasTable({ data, search, navigate, onSuccess, canBulkAction, isSuperUser = false }: DataTableProps) {
  const { hasPermission } = usePermissions()
  
  // Calcular permisos una sola vez
  const permissions = useMemo(() => ({
    canView: hasPermission('compras_ver'),
    canEdit: hasPermission('compras_modificar'),
    canDelete: hasPermission('compras_eliminar'),
  }), [hasPermission])
  
  // Configurar columnas con las opciones
  const columns = useMemo(() => comprasColumns({
    canBulkAction: canBulkAction,
    isSuperUser: isSuperUser,
    canView: permissions.canView,
    canEdit: permissions.canEdit,
    canDelete: permissions.canDelete,
  }), [canBulkAction, isSuperUser, permissions])

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    sorting: {
      enabled: true,
      defaultSorting: [{ id: 'fecha_compra', desc: true }] // Ordenamiento por defecto: fecha descendente
    },
    columnFilters: [
      { columnId: 'id', searchKey: 'numero', type: 'string' },
      { columnId: 'fecha_compra', searchKey: 'fecha_compra', type: 'string' },
      { columnId: 'estado', searchKey: 'estado', type: 'array' },
      // sucursal filter
      { columnId: 'sucursal', searchKey: 'sucursal', type: 'string' },
      // contacto filter
      { columnId: 'contacto', searchKey: 'contacto', type: 'string' },
    ],
  })

  // Función de filtro global personalizada para buscar en múltiples campos
  const globalFilterFn = (row: any, _columnId: string, filterValue: string) => {
    if (!filterValue) return true
    
    const searchValue = filterValue.toLowerCase()
    const numeroCompra = String(row.original.numero_compra || '')
    const sucursalNombre = row.original.sucursal?.nombre || ''
    const contactoNombre = row.original.contacto?.nombre_razon_social || ''
    
    return (
      numeroCompra.toLowerCase().includes(searchValue) ||
      sucursalNombre.toLowerCase().includes(searchValue) ||
      contactoNombre.toLowerCase().includes(searchValue)
    )
  }

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
    onSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
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
        searchPlaceholder='Buscar por número, sucursal o proveedor...'
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
