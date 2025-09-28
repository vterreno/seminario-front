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
import { type Marca } from '../data/schema'
import { MarcasMultiDeleteDialog } from './marcas-multi-delete-dialog'
import apiMarcasService from '@/service/apiMarcas.service'
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

    const selectedMarcas = selectedRows.map((row) => row.original as Marca)

    const canModify = hasPermission('marca_modificar')
    const canDelete = hasPermission('marca_eliminar')

    const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
        const marcaIds = selectedMarcas.filter(marca => marca.id !== undefined).map(marca => marca.id)
        
        try {
        await apiMarcasService.bulkUpdateMarcaStatus(marcaIds, status === 'active')
        
        table.resetRowSelection()
        toast.success(`${status === 'active' ? 'Activadas' : 'Desactivadas'} ${selectedMarcas.length} marca${selectedMarcas.length > 1 ? 's' : ''}`)
        onSuccess?.()
        } catch (error) {
        console.error('Error updating marcas:', error)
        toast.error(`Error al ${status === 'active' ? 'activar' : 'desactivar'} marcas`)
        }
    }

    return (
        <>
        <BulkActionsToolbar table={table} entityName='marca' entityNamePlural='marcas' isFeminine={true}>
            {canModify && (
            <Tooltip>
                <TooltipTrigger asChild>
                <Button
                    variant='outline'
                    size='icon'
                    onClick={() => handleBulkStatusChange('active')}
                    className='size-8'
                    aria-label='Activar marcas seleccionadas'
                    title='Activar marcas seleccionadas'
                >
                    <Shield />
                    <span className='sr-only'>Activar marcas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Activar marcas seleccionadas</p>
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
                    aria-label='Desactivar marcas seleccionadas'
                    title='Desactivar marcas seleccionadas'
                >
                    <ShieldOff />
                    <span className='sr-only'>Desactivar marcas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Desactivar marcas seleccionadas</p>
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
                    aria-label='Eliminar marcas seleccionadas'
                    title='Eliminar marcas seleccionadas'
                >
                    <Trash2 />
                    <span className='sr-only'>Eliminar marcas seleccionadas</span>
                </Button>
                </TooltipTrigger>
                <TooltipContent>
                <p>Eliminar marcas seleccionadas</p>
                </TooltipContent>
            </Tooltip>
            )}
        </BulkActionsToolbar>

        <MarcasMultiDeleteDialog
            table={table}
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            onSuccess={onSuccess}
        />
        </>
    )
}
