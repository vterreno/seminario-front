import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'

export const usersColumns = (showEmpresaColumn: boolean = false): ColumnDef<User>[] => {
  const baseColumns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
          className='translate-y-[2px]'
        />
      ),
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Select row'
          className='translate-y-[2px]'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: 'nombre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre' />
      ),
      cell: ({ row }) => {
        const { nombre, apellido } = row.original
        const fullName = `${nombre} ${apellido}`
        return <LongText className='max-w-36'>{fullName}</LongText>
      },
      meta: { className: 'w-36' },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => (
        <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Estado' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as boolean
        return (
          <Badge variant={status ? 'green' : 'secondary'}>
            {status ? 'Activo' : 'Inactivo'}
          </Badge>
        )
      },
      enableSorting: true,
    },
    {
      id: 'role',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Rol' />
      ),
      cell: ({ row }) => {
        const { role } = row.original
        return (
          <div className='flex items-center gap-x-2'>
            <span className='text-sm capitalize'>{role?.nombre || 'Sin rol'}</span>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
     {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha de creación' />
      ),
      cell: ({ row }) => {
        const created_at = row.getValue('created_at') as Date
        return (
          <div className='w-[140px]'>
            {created_at ? format(created_at, 'dd/MM/yyyy', { locale: es }) : '-'}
          </div>
        )
      },
      enableSorting: true,
    },
  ]

  // Add empresa column only for superadmin
  if (showEmpresaColumn) {
    baseColumns.splice(4, 0, {
      id: 'empresa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' />
      ),
      cell: ({ row }) => {
        const { empresa } = row.original
        return (
          <div className='flex items-center gap-x-2'>
            <span className='text-sm'>{empresa?.name || 'Sin empresa'}</span>
          </div>
        )
      },
      enableSorting: false,
    })
  }
  

  // Add actions column
  baseColumns.push({
    id: 'actions',
    cell: DataTableRowActions,
  })

  return baseColumns
}
