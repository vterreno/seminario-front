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
import { ListaPrecios } from '../data/schema'
import { usePermissions } from '@/hooks/use-permissions'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { ListaPreciosMultiDeleteDialog } from './lista-precios-multi-delete-dialog'

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

    const selectedListas = selectedRows.map((row) => row.original as ListaPrecios)

    const canModify = hasPermission('modulo_listas_modificar')
    const canDelete = hasPermission('modulo_listas_eliminar')

        const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
        const listaIds = selectedListas.filter(lista => lista.id !== undefined).map(lista => lista.id)

        try {
            await apiListaPreciosService.bulkUpdateListaPreciosStatus(listaIds, status === 'active')

            table.resetRowSelection()
            toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedListas.length} lista${selectedListas.length > 1 ? 's' : ''} de precios`)
            onSuccess?.()
        } catch (error: any) {
            // Mostrar el mensaje específico del backend si está disponible
            const errorMessage = error?.message || `Error al ${status === 'active' ? 'activar' : 'desactivar'} listas de precios`
            toast.error(errorMessage)
        }
    }


    return (
        <>
        <BulkActionsToolbar table={table} entityName='lista' entityNamePlural='listas' isFeminine={true}>
            {canModify && (
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleBulkStatusChange('active')}
                    className='size-8'
                    aria-label='Activar lista seleccionados'
                    title='Activar listas seleccionadas'
                >
                    <Shield />
                    <span className='sr-only'>Activar listas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Activar listas seleccionadas</p>
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
                    aria-label='Desactivar listas seleccionadas'
                    title='Desactivar listas seleccionadas'
                >
                    <ShieldOff />
                    <span className='sr-only'>Desactivar listas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Desactivar listas seleccionadas</p>
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
                    <span className='sr-only'>Eliminar listas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Eliminar listas seleccionadas</p>
                </TooltipContent>
            </Tooltip>
            )}
        </BulkActionsToolbar>

        <ListaPreciosMultiDeleteDialog
            table={table}
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            onSuccess={onSuccess}
        />
        </>
    )
}
