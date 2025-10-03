import { useEffect, useState, Fragment } from 'react'
import {
    type SortingState,
    type VisibilityState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
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
import { type ListaPrecios, type ProductoListaPrecio } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { listaPreciosColumns } from './lista-precios-columns'
import { Skeleton } from '@/components/ui/skeleton'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from './format-money'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className?: string
    }
}

type DataTableProps = {
    data: ListaPrecios[]
    search: Record<string, unknown>
    navigate: any
    onSuccess?: () => void
    canBulkAction: boolean
    showEmpresaColumn?: boolean
}

export function ListaPreciosTable({ 
    data, 
    search, 
    navigate, 
    onSuccess, 
    canBulkAction, 
    showEmpresaColumn = false 
}: DataTableProps) {
    const columns = listaPreciosColumns({
        showEmpresaColumn,
        canBulkAction
    })
    
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
    const [sorting, setSorting] = useState<SortingState>([])
    const [expanded, setExpanded] = useState<ExpandedState>({})
    const [loadingProducts, setLoadingProducts] = useState<Record<number, boolean>>({})
    const [productsData, setProductsData] = useState<Record<number, ProductoListaPrecio[]>>({})

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
            expanded,
        },
        enableRowSelection: canBulkAction,
        onPaginationChange,
        onColumnFiltersChange,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onExpandedChange: setExpanded,
        getExpandedRowModel: getExpandedRowModel(),
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

    // Cargar productos cuando se expande una fila
    const loadProducts = async (listaId: number) => {
        if (productsData[listaId]) return // Ya cargados
        
        setLoadingProducts(prev => ({ ...prev, [listaId]: true }))
        try {
            const productos = await apiListaPreciosService.getProductosByListaPrecios(listaId)
            setProductsData(prev => ({ ...prev, [listaId]: productos }))
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoadingProducts(prev => ({ ...prev, [listaId]: false }))
        }
    }

    // Monitorear expansión de filas
    useEffect(() => {
        const expandedRows = Object.keys(expanded).filter(key => expanded[key as keyof typeof expanded])
        expandedRows.forEach(index => {
            const row = table.getRowModel().rows[Number.parseInt(index)]
            if (row) {
                loadProducts(row.original.id)
            }
        })
    }, [expanded])

    return (
        <div className='w-full space-y-2.5 overflow-auto'>
            <DataTableToolbar table={table} />
            <div className='overflow-hidden rounded-lg border bg-card'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = header.column.columnDef.meta
                                    return (
                                        <TableHead
                                            key={header.id}
                                            colSpan={header.colSpan}
                                            className={cn(meta?.className)}
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
                                <Fragment key={row.id}>
                                    <TableRow
                                        data-state={row.getIsSelected() && 'selected'}
                                        className={cn(
                                            row.getIsExpanded() && 'border-b-0'
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const meta = cell.column.columnDef.meta
                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(meta?.className)}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            )
                                        })}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={columns.length} className="p-4">
                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-semibold">
                                                        Productos en esta lista
                                                    </h4>
                                                    {loadingProducts[row.original.id] ? (
                                                        <div className="space-y-2">
                                                            {[...Array(3)].map((_, i) => (
                                                                <Skeleton key={i} className="h-12 w-full" />
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-md border">
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="w-32">Código</TableHead>
                                                                        <TableHead>Nombre</TableHead>
                                                                        <TableHead className="w-32">Marca</TableHead>
                                                                        <TableHead className="w-32">Categoría</TableHead>
                                                                        <TableHead className="w-32 text-right">Precio</TableHead>
                                                                        <TableHead className="w-24">Estado</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {productsData[row.original.id]?.length ? (
                                                                        productsData[row.original.id].map((producto) => (
                                                                            <TableRow key={producto.id}>
                                                                                <TableCell className="font-mono text-sm">
                                                                                    {producto.codigo}
                                                                                </TableCell>
                                                                                <TableCell>{producto.nombre}</TableCell>
                                                                                <TableCell className="text-sm text-muted-foreground">
                                                                                    {producto.marca?.nombre || '-'}
                                                                                </TableCell>
                                                                                <TableCell className="text-sm text-muted-foreground">
                                                                                    {producto.categoria?.nombre || '-'}
                                                                                </TableCell>
                                                                                <TableCell className="text-right font-medium">
                                                                                    {formatCurrency(producto.precio ?? producto.precio_venta ?? 0)}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <Badge 
                                                                                        variant={producto.estado ? 'default' : 'secondary'}
                                                                                        className={cn(
                                                                                            'text-xs',
                                                                                            producto.estado 
                                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                                                                        )}
                                                                                    >
                                                                                        {producto.estado ? 'Activo' : 'Inactivo'}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))
                                                                    ) : (
                                                                        <TableRow>
                                                                            <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">
                                                                                No hay productos en esta lista de precios
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='h-24 text-center'>
                                    No se encontraron resultados.
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
