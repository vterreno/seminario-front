import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type ListaPrecios } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

declare module '@tanstack/react-table' {
    interface ColumnMeta<TData, TValue> {
        className?: string
        displayName?: string
    }
}

interface ListaPreciosColumnsOptions {
    showEmpresaColumn?: boolean
    canBulkAction?: boolean
}

export const listaPreciosColumns = (options: ListaPreciosColumnsOptions = {}): ColumnDef<ListaPrecios>[] => {
    const { showEmpresaColumn = false, canBulkAction = true } = options

    const baseColumns: ColumnDef<ListaPrecios>[] = []

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

    // Columna de expansión
    baseColumns.push({
        id: 'expander',
        header: () => null,
        cell: ({ row }) => (
            <Button
                variant="ghost"
                size="sm"
                className="p-0 h-8 w-8"
                onClick={() => row.toggleExpanded()}
            >
                {row.getIsExpanded() ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </Button>
        ),
        meta: {
            className: 'w-12',
        },
        enableSorting: false,
        enableHiding: false,
    })

    // Agregar las demás columnas
    baseColumns.push(
        {
            accessorKey: 'nombre',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Nombre de la lista' />
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <LongText className='max-w-48 font-medium'>{row.getValue('nombre')}</LongText>
                </div>
            ),
            meta: { 
                className: 'w-56',
                displayName: 'Nombre'
            },
        },
        {
            accessorKey: 'descripcion',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Descripción' />
            ),
            cell: ({ row }) => {
                const descripcion = row.original.descripcion
                return (
                    <div className="max-w-[200px]">
                        <LongText className='max-w-full text-muted-foreground'>
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

    // Columna de empresa solo para superadmin
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
                    <Badge 
                        variant={estado ? 'default' : 'secondary'}
                        className={cn(
                            estado 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                        )}
                    >
                        {estado ? 'Activo' : 'Inactivo'}
                    </Badge>
                )
            },
            meta: {
                className: 'w-28',
                displayName: 'Estado'
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: 'created_at',
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title='Fecha de creación' />
            ),
            cell: ({ row }) => {
                const date = row.getValue('created_at') as string
                return (
                    <div className="text-sm">
                        {format(new Date(date), 'dd/MM/yyyy', { locale: es })}
                    </div>
                )
            },
            meta: {
                className: 'w-36',
                displayName: 'Creación'
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => <DataTableRowActions row={row} />,
            meta: {
                className: cn('sticky md:table-cell end-0 pr-4'),
            },
        }
    )

    return baseColumns
}
