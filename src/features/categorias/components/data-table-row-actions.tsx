import { Row } from '@tanstack/react-table'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Categoria } from '../data/schema'
import { useCategorias } from './categorias-provider'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableRowActionsProps = {
  row: Row<Categoria>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCategorias()
  const { hasPermission } = usePermissions()
  const categoria = row.original

  // Verificar permisos para categorías
  const canEdit = hasPermission('categoria_modificar')
  const canDelete = hasPermission('categoria_eliminar')

  // Si no tiene ningún permiso, no mostrar el menú
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
          <MoreHorizontal className='h-4 w-4' />
          <span className='sr-only'>Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        {canEdit && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(categoria)
              setOpen('edit')
            }}
          >
            <Pencil size={16} />
            Editar
          </DropdownMenuItem>
        )}
        {canEdit && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(categoria)
              setOpen('delete')
            }}
            className='text-red-600 hover:text-red-600'
          >
            <Trash2 size={16} color='red'/>
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
