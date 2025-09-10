import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { Role } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    displayName?: string
  }
}

const baseColumns: ColumnDef<Role>[] = [
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
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => <div className='w-[80px]'>{row.getValue('id')}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre del rol' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-[200px] truncate font-medium'>
            {row.getValue('nombre')}
          </span>
        </div>
      )
    },
    meta: {
      displayName: 'Nombre',
      className: '',
    },
    enableSorting: true,
    filterFn: (row, id, value) => {
      const cellValue = String(row.getValue(id)).toLowerCase()
      const searchValue = String(value).toLowerCase()
      return cellValue.includes(searchValue)
    },
  },
  {
    accessorKey: 'empresa_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Empresa' />
    ),
    cell: ({ row }) => {
      const role = row.original as Role
      const empresaNombre = role.empresa?.nombre || `Empresa ${role.empresa_id}`
      
      return (
        <div className='w-[140px] truncate'>
          {empresaNombre}
        </div>
      )
    },
    meta: {
      displayName: 'Empresa',
      className: '',
    },
    enableSorting: true,
    filterFn: (row, _, value) => {
      const role = row.original as Role
      const empresaNombre = role.empresa?.nombre || ''
      const searchValue = String(value).toLowerCase()
      return empresaNombre.toLowerCase().includes(searchValue)
    },
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
    meta: {
      displayName: 'Estado',
      className: '',
    },
    filterFn: (row, id, value) => {
      const estado = row.getValue(id) as boolean
      return value.includes(estado.toString())
    },
    enableSorting: true,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Fecha de creación' />
    ),
    cell: ({ row }) => {
      const created_at = row.getValue('created_at') as string
      return (
        <div className='w-[140px]'>
          {created_at ? format(new Date(created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
        </div>
      )
    },
    meta: {
      displayName: 'Fecha de creación',
      className: '',
    },
    enableSorting: true,
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Última actualización' />
    ),
    cell: ({ row }) => {
      const updated_at = row.getValue('updated_at') as string
      return (
        <div className='w-[140px]'>
          {updated_at ? format(new Date(updated_at), 'dd/MM/yyyy', { locale: es }) : '-'}
        </div>
      )
    },
    meta: {
      displayName: 'Última actualización',
      className: '',
    },
    enableSorting: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]

// Function to get columns based on user type
export function getRolesColumns(isSuperAdmin: boolean): ColumnDef<Role>[] {
  if (isSuperAdmin) {
    // Superadmin sees all columns including empresa
    return baseColumns
  } else {
    // Regular users don't see empresa column
    return baseColumns.filter(column => 
      !('accessorKey' in column) || column.accessorKey !== 'empresa_id'
    )
  }
}

// Export the base columns for backward compatibility
export const rolesColumns = baseColumns
