import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { Sucursal } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    displayName?: string
  }
}

interface SucursalesColumnsOptions {
  showEmpresaColumn?: boolean
  canBulkAction?: boolean // Nueva opción para controlar bulk actions
}

// Obtener datos del usuario desde localStorage para determinar si es superadmin
const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem('user_data') || '{}')
  } catch {
    return {}
  }
}

// Verificar si el usuario es superadmin basándose en los roles
const isSuperAdmin = () => {
  try {
    const userData = getUserData()
    // Verificar si tiene empresa asociada
    return userData.empresa && userData.empresa.id == null
  } catch {
    return false
  }
}

export const sucursalesColumns = (options: SucursalesColumnsOptions = {}): ColumnDef<Sucursal>[] => {
  const { showEmpresaColumn = isSuperAdmin(), canBulkAction = true } = options
  
  const baseColumns: ColumnDef<Sucursal>[] = []

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
        <DataTableColumnHeader column={column} title='Nombre de la sucursal' />
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
        className: ''
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const cellValue = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return cellValue.includes(searchValue)
      },
    },
    {
      accessorKey: 'codigo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Código' />
      ),
      cell: ({ row }) => {
        return (
          <div className='w-[100px] font-mono text-sm'>
            {row.getValue('codigo')}
          </div>
        )
      },
      meta: {
        displayName: 'Código',
        className: ''
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const cellValue = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return cellValue.includes(searchValue)
      },
    },
    {
      accessorKey: 'direccion',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Dirección' />
      ),
      cell: ({ row }) => {
        return (
          <div className='max-w-[250px] truncate'>
            {row.getValue('direccion')}
          </div>
        )
      },
      meta: {
        displayName: 'Dirección',
        className: ''
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const cellValue = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return cellValue.includes(searchValue)
      },
    }
  )

  // Columna de empresa - solo visible para superadmin
  if (showEmpresaColumn) {
    baseColumns.push({
      accessorKey: 'empresa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' />
      ),
      cell: ({ row }) => {
        const empresa = row.getValue('empresa') as Sucursal['empresa']
        return (
          <div className='w-[120px]'>
            {empresa?.name || `Empresa ${row.original.empresa_id || ''}`}
          </div>
        )
      },
      meta: {
        displayName: 'Empresa',
        className: '',
      },
      enableSorting: true,
    })
  }

  // Agregar columnas de estado y fechas
  baseColumns.push(
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
        className: ''
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
        className: ''
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
        className: ''
      },
      enableSorting: true,
    }
  )

  // Agregar columna de acciones
  baseColumns.push({
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  })

  return baseColumns
}