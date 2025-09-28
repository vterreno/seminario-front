import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Marca } from '../data/schema'
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

interface MarcasColumnsOptions {
    showEmpresaColumn?: boolean
    canBulkAction?: boolean // Nueva opción para controlar bulk actions
}

export const marcasColumns = (options: MarcasColumnsOptions = {}): ColumnDef<Marca>[] => {
    const { showEmpresaColumn = false, canBulkAction = true } = options

    const baseColumns: ColumnDef<Marca>[] = []

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
        accessorKey: 'nombre',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Nombre de la marca' />
        ),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
            <LongText className='max-w-36'>{row.getValue('nombre')}</LongText>
            </div>
        ),
        meta: { 
            className: 'w-36',
            displayName: 'Nombre'
        },
        },
        {
        accessorKey: 'descripcion',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Descripción' />
        ),
        cell: ({ row }) => {
            const descripcion = row.getValue('descripcion') as string
            return (
            <div className="max-w-[200px]">
                <LongText className='max-w-full'>
                {descripcion || '-'}
                </LongText>
            </div>
            )
        },
        meta: {
            className: 'w-48',
            displayName: 'Descripción'
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