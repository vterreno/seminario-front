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
import { UnidadMedida } from '../data/schema'
import { useUnidadMedida } from './unidad-medida-provider'
// import { usePermissions } from '@/hooks/use-permissions' // TODO: Restaurar cuando se corrijan los permisos

type DataTableRowActionsProps = {
  row: Row<UnidadMedida>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useUnidadMedida()
  // const { hasPermission } = usePermissions() // TODO: Restaurar cuando se corrijan los permisos
  const unidadMedida = row.original

  // TODO: Restaurar verificación de permisos cuando esté corregida
  // Verificar permisos
  // const canEdit = hasPermission('unidad_medida_modificar')
  // const canDelete = hasPermission('unidad_medida_eliminar')
  const canEdit = true // Temporal: permitir editar a todos los usuarios
  const canDelete = true // Temporal: permitir eliminar a todos los usuarios

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
              setCurrentRow(unidadMedida)
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
              setCurrentRow(unidadMedida)
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