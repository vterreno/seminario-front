import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Role } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    displayName?: string
  }
}

interface RolesColumnsOptions {
  showEmpresaColumn?: boolean
  canBulkAction?: boolean // Nueva opción para controlar bulk actions
}

export const rolesColumns = (options: RolesColumnsOptions = {}): ColumnDef<Role>[] => {
  const { showEmpresaColumn = false, canBulkAction = true } = options
  
  const baseColumns: ColumnDef<Role>[] = []

  // Solo agregar la columna de selección si tiene permisos para bulk actions
  if (canBulkAction) {
    baseColumns.push({
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
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
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
    })
  }

  // Agregar las demás columnas
  baseColumns.push(
    {
      accessorKey: 'nombre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre del rol' />
      ),
      cell: ({ row }) => {
        return <LongText className='max-w-36'>{row.getValue('nombre')}</LongText>
      },
      meta: { 
        className: 'w-36',
        displayName: 'Nombre'
      },
    },
    {
      id: 'permisos_count',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Permisos' />
      ),
      cell: ({ row }) => {
        const { permisos } = row.original
        const permisosCount = permisos ? Object.keys(permisos).length : 0
        return (
          <div className='flex items-center gap-x-2'>
            <Badge variant='outline' className='text-xs'>
              {permisosCount} {permisosCount === 1 ? 'permiso' : 'permisos'}
            </Badge>
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        displayName: 'Permisos'
      },
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
      meta: {
        displayName: 'Estado'
      },
    }
  )

  // Agregar columna de empresa solo si es necesario
  if (showEmpresaColumn) {
    const empresaColumnIndex = canBulkAction ? 4 : 3 // Ajustar índice según si hay columna select
    baseColumns.splice(empresaColumnIndex, 0, {
      id: 'empresa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' />
      ),
      cell: ({ row }) => {
        const { empresa } = row.original
        return (
          <div className='flex items-center gap-x-2'>
            <span className='text-sm'>{empresa?.nombre || 'Sin empresa'}</span>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'Empresa'
      },
    })
  }

  // Agregar columna de fecha de creación
  baseColumns.push({
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
    meta: {
      displayName: 'Fecha de creación'
    },
  })

  // Agregar columna de acciones
  baseColumns.push({
    id: 'actions',
    cell: DataTableRowActions,
  })

  return baseColumns
}