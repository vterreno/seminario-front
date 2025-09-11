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
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

interface UsersColumnsOptions {
  showEmpresaColumn?: boolean
  canBulkAction?: boolean // Nueva opción
}

export const usersColumns = (options: UsersColumnsOptions = {}): ColumnDef<User>[] => {
  const { showEmpresaColumn = false, canBulkAction = true } = options
  
  const baseColumns: ColumnDef<User>[] = []

  // Solo agregar la columna de selección si tiene permisos para bulk actions
  if (canBulkAction) {
    baseColumns.push({
      id: 'select',
      header: ({ table }) => {
        // Obtener datos del usuario actual desde localStorage para filtrar usuario propio
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const currentUserId = userData?.id
        
        // Filtrar filas que no sean del usuario actual
        const selectableRows = table.getRowModel().rows.filter(row => {
          const user = row.original
          const isOwnUserById = user.id === currentUserId
          const isOwnUserByEmail = userData?.email && user.email === userData.email
          return !(isOwnUserById || isOwnUserByEmail)
        })
        
        // Verificar cuántas filas seleccionables están seleccionadas
        const selectedSelectableRows = selectableRows.filter(row => row.getIsSelected())
        const isAllSelectableSelected = selectableRows.length > 0 && selectedSelectableRows.length === selectableRows.length
        const isSomeSelectableSelected = selectedSelectableRows.length > 0 && selectedSelectableRows.length < selectableRows.length
        
        return (
          <Checkbox
            checked={isAllSelectableSelected || (isSomeSelectableSelected && 'indeterminate')}
            onCheckedChange={(value) => {
              // Seleccionar/deseleccionar solo las filas que no son del usuario actual
              selectableRows.forEach(row => {
                row.toggleSelected(!!value)
              })
            }}
            aria-label='Seleccionar todos'
            className='translate-y-[2px]'
          />
        )
      },
      meta: {
        className: cn('sticky md:table-cell start-0 z-10 rounded-tl-[inherit]'),
      },
      cell: ({ row }) => {
        // Obtener datos del usuario actual desde localStorage
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const currentUserId = userData?.id
        const user = row.original
        
        // Verificar si es el propio usuario - usando múltiples métodos de verificación
        const isOwnUserById = user.id === currentUserId
        const isOwnUserByEmail = userData?.email && user.email === userData.email
        const isOwnUser = isOwnUserById || isOwnUserByEmail
        
        // Si es el usuario propio, no renderizar el checkbox
        if (isOwnUser) {
          return <div className="w-[20px]"></div> // Placeholder para mantener el espacio
        }
        
        return (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Seleccionar fila'
            className='translate-y-[2px]'
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
    })
  }

  // Agregar las demás columnas
  baseColumns.push(
    {
      id: 'nombre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre' />
      ),
      cell: ({ row }) => {
        // Obtener datos del usuario actual desde localStorage
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const currentUserId = userData?.id
        const user = row.original
        
        // Verificar si es el propio usuario - probemos también con email como fallback
        const isOwnUserById = user.id === currentUserId
        const isOwnUserByEmail = userData?.email && user.email === userData.email
        const isOwnUser = isOwnUserById || isOwnUserByEmail
        
        const { nombre, apellido } = user
        const fullName = `${nombre} ${apellido}`
        
        return (
          <div className="flex items-center gap-2">
            <LongText className='max-w-36'>{fullName}</LongText>
            {isOwnUser && (
              <Badge variant="secondary" className="text-xs">
                Tú {isOwnUserById ? '(ID)' : '(Email)'}
              </Badge>
            )}
          </div>
        )
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
    }
  )

  // Add empresa column only for superadmin
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
            <span className='text-sm'>{empresa?.name || 'Sin empresa'}</span>
          </div>
        )
      },
      enableSorting: false,
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
  })

  // Add actions column
  baseColumns.push({
    id: 'actions',
    cell: DataTableRowActions,
  })

  return baseColumns
}