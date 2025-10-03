import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ListaPrecios } from '../data/schema'
import { useListaPreciosContext } from './lista-precios-provider'
import { usePermissions } from '@/hooks/use-permissions'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { toast } from 'sonner'

interface DataTableRowActionsProps {
    row: Row<ListaPrecios>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
    const lista = row.original
    const { setSelectedLista, setIsEditDialogOpen, setIsDeleteDialogOpen, setIsManagePreciosDialogOpen } = useListaPreciosContext()
    const { hasPermission } = usePermissions()

    const canEdit = hasPermission('lista_precios_modificar')
    const canDelete = hasPermission('lista_precios_eliminar')
    const canManage = hasPermission('lista_precios_modificar') // Mismo permiso que editar

    const handleEdit = async () => {
        try {
            // Cargar la lista completa con productos
            const listaCompleta = await apiListaPreciosService.getListaPreciosById(lista.id)
            setSelectedLista(listaCompleta)
            setIsEditDialogOpen(true)
        } catch (error: any) {
            toast.error(error.message || 'Error al cargar la lista de precios')
        }
    }

    if (!canEdit && !canDelete) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
                >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>Abrir menú</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[200px]'>
                {canManage && (
                    <DropdownMenuItem
                        onClick={() => {
                            setSelectedLista(lista)
                            setIsManagePreciosDialogOpen(true)
                        }}
                    >
                        Gestionar Precios
                    </DropdownMenuItem>
                )}
                {canEdit && (
                    <>
                        {canManage && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={handleEdit}>
                            Editar
                        </DropdownMenuItem>
                    </>
                )}
                {canDelete && (
                    <>
                        {(canEdit || canManage) && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={() => {
                                setSelectedLista(lista)
                                setIsDeleteDialogOpen(true)
                            }}
                            className='text-destructive'
                        >
                            Eliminar
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
