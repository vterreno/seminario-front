import { Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { Contacto } from '@/service/apiContactos.service'

export function DataTableRowActions({ row, onEdit, onDelete }: { row: Row<Contacto>, onEdit: (c: Contacto) => void, onDelete: (c: Contacto) => void }) {
  const contacto = row.original
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit(contacto)}>Editar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(contacto)}>Eliminar</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


