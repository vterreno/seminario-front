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
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { type Marca } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { marcasColumns } from './marcas-columns'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className?: string
    }
}

type DataTableProps = {
    data: Marca[]
    search: Record<string, unknown>
    navigate: any // Tipo flexible para evitar conflictos
    onSuccess?: () => void
    canBulkAction: boolean // Nueva prop para controlar bulk actions
    showEmpresaColumn?: boolean // Nueva prop para mostrar columna empresa
}

export function MarcasTable({ data, search, navigate, onSuccess, canBulkAction, showEmpresaColumn = false }: DataTableProps) {
    // Get columns based on user type and permissions
    const columns = marcasColumns({
        showEmpresaColumn: showEmpresaColumn, // Solo mostrar columna empresa para superadmin
        canBulkAction: canBulkAction // Pasar el control de bulk actions
    })
    
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    // Synced with URL states (keys/defaults mirror roles route search schema)
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
        enableRowSelection: canBulkAction, // Usar canBulkAction para habilitar/deshabilitar la selección de filas
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
        <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
        <DataTableToolbar
            table={table}
            searchPlaceholder='Buscar marcas por nombre...'
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
        {/* Solo mostrar bulk actions si tiene permisos */}
        {canBulkAction && <DataTableBulkActions table={table} onSuccess={onSuccess} />}
        </div>
    )
}