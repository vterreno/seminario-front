import { Row } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Venta } from '../data/schema'
import { useVentas } from './ventas-provider'

type DataTableRowActionsProps = {
  row: Row<Venta>
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DataTableRowActions({ row, canView = false, canEdit = false, canDelete = false }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useVentas()
  const venta = row.original

  // Si no tiene ningún permiso, no mostrar el menú
  const hasAnyPermission = useMemo(() => canView || canEdit || canDelete, [canView, canEdit, canDelete])
  
  if (!hasAnyPermission) {
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
        {canView && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(venta)
              setOpen('view')
            }}
          >
            <Eye size={16} />
            Ver detalle
          </DropdownMenuItem>
        )}
        {canEdit && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(venta)
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
