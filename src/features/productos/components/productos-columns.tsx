import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Producto } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className?: string
        displayName?: string
    }
}

interface ProductosColumnsOptions {
    showEmpresaColumn?: boolean
    canBulkAction?: boolean // Nueva opción para controlar bulk actions
}

export const productosColumns = (options: ProductosColumnsOptions = {}): ColumnDef<Producto>[] => {
    const { showEmpresaColumn = false, canBulkAction = true } = options

    const baseColumns: ColumnDef<Producto>[] = []

    // Solo agregar la columna de selección si tiene permisos para bulk actions
    if (canBulkAction) {
        baseColumns.push({
        id: 'select',
        header: ({ table }) => (
            <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label='Seleccionar todos'
            className='translate-y-[2px]'
            />
        ),
        meta: {
            className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
        },
        cell: ({ row }) => (
            <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Seleccionar fila'
            className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
        })
    }

    // Agregar las demás columnas
    baseColumns.push(
        {
        accessorKey: 'codigo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Código' />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
            <span className="font-mono font-medium">{row.getValue('codigo')}</span>
            </div>
        ),
        meta: { 
            className: 'w-32',
            displayName: 'Código'
        },
        },
        {
        accessorKey: 'nombre',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nombre del producto' />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
            <LongText className='max-w-36'>{row.getValue('nombre')}</LongText>
            </div>
        ),
        meta: { 
            className: 'w-48',
            displayName: 'Nombre'
        },
        },
        {
        accessorKey: 'marca',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Marca' />
        ),
        cell: ({ row }) => {
            const marca = row.original.marca
            return (
            <div className="max-w-[150px]">
                <LongText className='max-w-full'>
                {marca?.nombre || '-'}
                </LongText>
            </div>
            )
        },
        meta: {
            className: 'w-40',
            displayName: 'Marca'
        },
        },
        {
        accessorKey: 'categoria',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Categoría' />
        ),
        cell: ({ row }) => {
            const categoria = row.original.categoria
            return (
            <div className="max-w-[150px]">
                <LongText className='max-w-full'>
                {categoria?.nombre || '-'}
                </LongText>
            </div>
            )
        },
        meta: {
            className: 'w-36',
            displayName: 'Categoría'
        },
        },
        {
        accessorKey: 'unidadMedida',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Unidad' />
        ),
        cell: ({ row }) => {
            const unidadMedida = row.original.unidadMedida
            return (
            <div className="max-w-[100px]">
                <span className="text-sm">
                {unidadMedida?.sigla || '-'}
                </span>
            </div>
            )
        },
        meta: {
            className: 'w-24',
            displayName: 'Unidad'
        },
        },
        {
        accessorKey: 'stock',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Stock' />
        ),
        cell: ({ row }) => {
            const stock = row.getValue('stock') as number
            return (
            <div className="text-right">
                <span className={cn(
                "font-medium",
                stock <= 0 ? "text-red-600" : 
                stock <= 10 ? "text-yellow-600" : 
                "text-green-600"
                )}>
                {stock.toLocaleString()}
                </span>
            </div>
            )
        },
        meta: {
            className: 'w-20',
            displayName: 'Stock'
        },
        },
        {
        accessorKey: 'precio_costo',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='P. Costo' />
        ),
        cell: ({ row }) => {
            const precio = row.getValue('precio_costo') as number
            return (
            <div className="text-right">
                <span className="font-medium">
                ${precio.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                })}
                </span>
            </div>
            )
        },
        meta: {
            className: 'w-24',
            displayName: 'Precio Costo'
        },
        },
        {
        accessorKey: 'precio_venta',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='P. Venta' />
        ),
        cell: ({ row }) => {
            const precio = row.getValue('precio_venta') as number
            return (
            <div className="text-right">
                <span className="font-medium">
                ${precio.toLocaleString('es-AR', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2 
                })}
                </span>
            </div>
            )
        },
        meta: {
            className: 'w-24',
            displayName: 'Precio Venta'
        },
        }
    )

    // Agregar columna de empresa solo si showEmpresaColumn es true (superadmin)
    if (showEmpresaColumn) {
        baseColumns.push({
        accessorKey: 'empresa',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Empresa' />
        ),
        cell: ({ row }) => {
            const empresa = row.original.empresa
            return (
            <div className="max-w-[150px]">
                <LongText className='max-w-full'>
                {empresa?.name || '-'}
                </LongText>
            </div>
            )
        },
        meta: {
            className: 'w-40',
            displayName: 'Empresa'
        },
        })
    }

    baseColumns.push(
        {
        accessorKey: 'estado',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Estado' />
        ),
        cell: ({ row }) => {
            const estado = row.getValue('estado') as boolean
            return (
            <Badge variant={estado ? 'green' : 'secondary'}>
                {estado ? 'Activo' : 'Inactivo'}
            </Badge>
            )
        },
        filterFn: (row, id, value) => {
            const rowValue = row.getValue(id) as boolean
            if (value.length === 0) return true
            return value.some((filterValue: string) => {
                if (filterValue === 'true') return rowValue === true
                if (filterValue === 'false') return rowValue === false
                return false
            })
        },
        enableSorting: true,
        meta: {
            displayName: 'Estado'
        },
        }
    )

    // Agregar columna de fecha de creación
    baseColumns.push({
        accessorKey: 'created_at',
        header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha de creación' />
        ),
        cell: ({ row }) => {
        const created_at = row.getValue('created_at') as Date
        return (
            <div className='w-[140px]'>
            {created_at ? format(created_at, 'dd/MM/yyyy', { locale: es }) : '-'}
            </div>
        )
        },
        enableSorting: true,
        meta: {
        displayName: 'Fecha de creación'
        },
    })

    // Agregar columna de acciones
    baseColumns.push({
        id: 'actions',
        cell: DataTableRowActions,
    })

    return baseColumns
}