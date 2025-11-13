import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Package } from 'lucide-react'
import { Contacto } from '@/service/apiContactos.service'

export function DataTableRowActions({ 
  row, 
  onEdit, 
  onDelete,
  onViewProducts,
  isProveedor = false,
  canEdit = true, 
  canDelete = true 
}: { 
  row: Row<Contacto>, 
  onEdit: (c: Contacto) => void, 
  onDelete: (c: Contacto) => void,
  onViewProducts?: (c: Contacto) => void,
  isProveedor?: boolean,
  canEdit?: boolean,
  canDelete?: boolean
}) {
  const contacto = row.original
  
  // Si es consumidor final, no mostrar acciones
  if (contacto.es_consumidor_final) {
    return null
  }
  
  // Si no tiene permisos, no mostrar nada
  if (!canEdit && !canDelete && !isProveedor) {
    return null
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        {isProveedor && onViewProducts && (
          <>
            <DropdownMenuItem onClick={() => onViewProducts(contacto)}>
              <Package className="mr-2 h-4 w-4" />
              Ver Productos
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {canEdit && (
          <DropdownMenuItem onClick={() => onEdit(contacto)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        {canEdit && canDelete && <DropdownMenuSeparator />}
        {canDelete && (
          <DropdownMenuItem onClick={() => onDelete(contacto)} className="text-destructive hover:text-red-600">
            <Trash2 className="mr-2 h-4 w-4 text-red-600 hover:text-red-600" />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


