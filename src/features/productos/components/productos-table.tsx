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
import { Cross2Icon } from '@radix-ui/react-icons'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTablePagination, DataTableFacetedFilter, DataTableViewOptions } from '@/components/data-table'
import { type Producto } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { productosColumns } from './productos-columns'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className?: string
    }
}

type DataTableProps = {
    data: Producto[]
    search: Record<string, unknown>
    navigate: any // Tipo flexible para evitar conflictos
    onSuccess?: () => void
    canBulkAction: boolean // Nueva prop para controlar bulk actions
    showEmpresaColumn?: boolean // Nueva prop para mostrar columna empresa
}

export function ProductosTable({ data, search, navigate, onSuccess, canBulkAction, showEmpresaColumn = false }: DataTableProps) {
    // Filtrar datos en el cliente por nombre o código
    const [searchTerm, setSearchTerm] = useState('')
    
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data
        
        const term = searchTerm.toLowerCase()
        return data.filter(item => 
            item.nombre?.toLowerCase().includes(term) ||
            item.codigo?.toLowerCase().includes(term)
        )
    }, [data, searchTerm])

    // Get columns based on user type and permissions
    const columns = useMemo(() => productosColumns({
        showEmpresaColumn: showEmpresaColumn,
        canBulkAction: canBulkAction
    }), [showEmpresaColumn, canBulkAction])
    
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])

    // Synced with URL states
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
        { columnId: 'estado', searchKey: 'estado', type: 'array' },
        ],
    })

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            pagination,
            rowSelection,
            columnFilters,
            columnVisibility,
        },
        enableRowSelection: canBulkAction,
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
        <div className='space-y-4 max-sm:has-[div[role="toolbar"]]:mb-16 w-full'>
        <div className='flex items-center justify-between gap-2'>
            <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
                <Input
                    placeholder='Buscar por nombre o código...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='h-8 w-[150px] lg:w-[250px]'
                />
                <div className='flex gap-x-2'>
                    {table.getColumn('estado') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('estado')!}
                            title='Estado'
                            options={[
                                { label: 'Activo', value: 'true' },
                                { label: 'Inactivo', value: 'false' },
                            ]}
                        />
                    )}
                </div>
                {(table.getState().columnFilters.length > 0 || searchTerm) && (
                    <Button
                        variant='ghost'
                        onClick={() => {
                            table.resetColumnFilters()
                            setSearchTerm('')
                        }}
                        className='h-8 px-2 lg:px-3'
                    >
                        Borrar
                        <Cross2Icon className='ms-2 h-4 w-4' />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
        
        <div className='overflow-auto rounded-md border'>
            <Table className="min-w-[1200px]">
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