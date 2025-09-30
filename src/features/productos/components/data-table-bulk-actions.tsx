import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Shield, ShieldOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type Producto } from '../data/schema'
import { ProductosMultiDeleteDialog } from './productos-multi-delete-dialog'
import apiProductosService from '@/service/apiProductos.service'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableBulkActionsProps<TData> = {
    table: Table<TData>
    onSuccess?: () => void
}

export function DataTableBulkActions<TData>({
    table,
    onSuccess,
}: DataTableBulkActionsProps<TData>) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const { hasPermission } = usePermissions()
    const selectedRows = table.getFilteredSelectedRowModel().rows

    const selectedProductos = selectedRows.map((row) => row.original as Producto)

    const canModify = hasPermission('producto_modificar')
    const canDelete = hasPermission('producto_eliminar')

    const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
        const productoIds = selectedProductos.filter(producto => producto.id !== undefined).map(producto => producto.id)

        try {
        await apiProductosService.bulkUpdateProductoStatus(productoIds, status === 'active')

            table.resetRowSelection()
            toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedProductos.length} producto${selectedProductos.length > 1 ? 's' : ''}`)
            onSuccess?.()
        } catch (error: any) {
            // Mostrar el mensaje específico del backend si está disponible
            const errorMessage = error?.message || `Error al ${status === 'active' ? 'activar' : 'desactivar'} productos`
            toast.error(errorMessage)
        }
    }

    return (
        <>
        <BulkActionsToolbar table={table} entityName='producto' entityNamePlural='productos' isFeminine={true}>
            {canModify && (
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleBulkStatusChange('active')}
                    className='size-8'
                    aria-label='Activar productos seleccionados'
                    title='Activar productos seleccionados'
                >
                    <Shield />
                    <span className='sr-only'>Activar productos seleccionados</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Activar productos seleccionados</p>
                </TooltipContent>
            </Tooltip>
            )}

            {canModify && (
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleBulkStatusChange('inactive')}
                    className='size-8'
                    aria-label='Desactivar productos seleccionados'
                    title='Desactivar productos seleccionados'
                >
                    <ShieldOff />
                    <span className='sr-only'>Desactivar productos seleccionados</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Desactivar productos seleccionados</p>
                </TooltipContent>
            </Tooltip>
            )}

            {canDelete && (
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    variant='destructive'
                    size='icon'
                    onClick={() => setShowDeleteConfirm(true)}
                    className='size-8'
                    aria-label='Eliminar productos seleccionados'
                    title='Eliminar productos seleccionados'
                >
                    <Trash2 />
                    <span className='sr-only'>Eliminar productos seleccionados</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Eliminar productos seleccionados</p>
                </TooltipContent>
            </Tooltip>
            )}
        </BulkActionsToolbar>

        <ProductosMultiDeleteDialog
            table={table}
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            onSuccess={onSuccess}
        />
        </>
    )
}
