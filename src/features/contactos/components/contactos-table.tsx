import { useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTableToolbar, DataTablePagination } from '@/components/data-table'
import { getContactosColumns } from './contactos-columns'
import { Contacto } from '@/service/apiContactos.service'
import { DataTableRowActions } from './data-table-row-actions'
import { ContactosBulkActions } from './data-table-bulk-actions'
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, getPaginationRowModel, getFacetedRowModel, getFacetedUniqueValues, type SortingState, type VisibilityState, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export function ContactosTable({ 
  data, 
  onEdit, 
  onDelete, 
  canBulkAction, 
  tipo = 'cliente', 
  onSuccess,
  isSuperAdmin = false,
  canEdit = true,
  canDelete = true
}: { 
  data: Contacto[], 
  onEdit: (c: Contacto) => void, 
  onDelete: (c: Contacto) => void, 
  canBulkAction?: boolean, 
  tipo?: 'cliente' | 'proveedor', 
  onSuccess?: () => void,
  isSuperAdmin?: boolean,
  canEdit?: boolean,
  canDelete?: boolean
}) {
  const columns: ColumnDef<Contacto>[] = useMemo(() => {
    return [
      ...getContactosColumns(isSuperAdmin),
      {
        id: 'actions',
        cell: ({ row }) => <DataTableRowActions row={row} onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />,
      },
    ]
  }, [onEdit, onDelete, isSuperAdmin, canEdit, canDelete])

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection, columnVisibility },
    enableRowSelection: canBulkAction,
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

  return (
    <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar contactos...'
        searchKey='nombre_razon_social'
        filters={[
          {
            columnId: 'estado',
            title: 'Estado',
            options: [
              { label: 'Activos', value: 'true' },
              { label: 'Inactivos', value: 'false' },
            ],
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
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
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {canBulkAction && <ContactosBulkActions table={table} tipo={tipo} onSuccess={onSuccess || (() => {})} canModify={canEdit} canDelete={canDelete} />}
    </div>
  )
}


