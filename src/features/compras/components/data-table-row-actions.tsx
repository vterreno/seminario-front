import { Row } from '@tanstack/react-table'
import { Eye, MoreHorizontal, Pencil, Trash2, DollarSign } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Compra } from '../data/schema'
import { useCompras } from './compras-provider'

type DataTableRowActionsProps = {
  row: Row<Compra>
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export function DataTableRowActions({ row, canView = false, canEdit = false, canDelete = false }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCompras()
  const compra = row.original

  // Verificar si la compra está pendiente de pago
  const isPendientePago = compra.estado?.toUpperCase() === 'PENDIENTE_PAGO'

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
              setCurrentRow(compra)
              setOpen('view')
            }}
          >
            <Eye size={16} />
            Ver detalle
          </DropdownMenuItem>
        )}
        {isPendientePago && canEdit && (
          <>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(compra)
                setOpen('modify')
              }}
            >
              <Pencil size={16} />
              Modificar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(compra)
                setOpen('pay')
              }}
              className='text-green-600 hover:text-green-600'
            >
              <DollarSign size={16} className='text-green-600' />
              Pagar compra
            </DropdownMenuItem>
          </>
        )}
        {(canEdit || canDelete) && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(compra)
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
