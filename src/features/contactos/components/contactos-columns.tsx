import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Contacto } from '@/service/apiContactos.service'

export const contactosColumns: ColumnDef<Contacto>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Seleccionar todos'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Seleccionar fila'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'nombre_razon_social',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre / Razón Social' />
    ),
    meta: { displayName: 'Nombre / Razón Social' },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const cellValue = String(row.getValue(id)).toLowerCase()
      const searchValue = String(value).toLowerCase()
      return cellValue.includes(searchValue)
    },
  },
  {
    accessorKey: 'condicion_iva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Condición IVA' />
    ),
  },
  {
    accessorKey: 'telefono_movil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
  },
  {
    id: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    cell: ({ row }) => {
      const c = row.original
      const dir = [c.direccion_calle, c.direccion_numero, c.direccion_piso_dpto].filter(Boolean).join(' ')
      const loc = [c.ciudad, c.provincia, c.codigo_postal].filter(Boolean).join(', ')
      return <span>{[dir, loc].filter(Boolean).join(' - ') || '-'}</span>
    }
  },
  {
    accessorKey: 'estado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const estado = row.getValue('estado') as boolean
      return (
        <Badge variant={estado ? 'green' : 'secondary'}>
          {estado ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as boolean
      return value.includes(estado.toString())
    },
    enableSorting: true,
  },
]


