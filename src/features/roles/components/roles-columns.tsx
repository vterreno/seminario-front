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
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

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
      header: ({ table }) => {
        // Obtener datos del usuario actual desde localStorage para filtrar roles propios
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const currentUserRoles = userData?.roles || []
        
        // Filtrar filas que no sean roles propios del usuario
        const selectableRows = table.getRowModel().rows.filter(row => {
          const role = row.original
          return !currentUserRoles.some((userRole: any) => userRole.nombre === role.nombre)
        })
        
        // Verificar cuántas filas seleccionables están seleccionadas
        const selectedSelectableRows = selectableRows.filter(row => row.getIsSelected())
        const isAllSelectableSelected = selectableRows.length > 0 && selectedSelectableRows.length === selectableRows.length
        const isSomeSelectableSelected = selectedSelectableRows.length > 0 && selectedSelectableRows.length < selectableRows.length
        
        return (
          <Checkbox
            checked={isAllSelectableSelected || (isSomeSelectableSelected && 'indeterminate')}
            onCheckedChange={(value) => {
              // Seleccionar/deseleccionar solo las filas que no son roles propios
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
        const currentUserRoles = userData?.roles || []
        const role = row.original
        
        // Verificar si es el propio rol del usuario
        const isOwnRole = currentUserRoles.some((userRole: any) => userRole.nombre === role.nombre)
        
        // Si es el rol propio, no renderizar el checkbox
        if (isOwnRole) {
          return null
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
      accessorKey: 'nombre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre del rol' />
      ),
      cell: ({ row }) => {
        // Obtener datos del usuario actual desde localStorage
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const currentUserRoles = userData?.roles || []
        const role = row.original
        
        // Verificar si es el propio rol del usuario
        const isOwnRole = currentUserRoles.some((userRole: any) => userRole.nombre === role.nombre)
        
        return (
          <div className="flex items-center gap-2">
            <LongText className='max-w-36'>{row.getValue('nombre')}</LongText>
            {isOwnRole && (
              <Badge variant="secondary" className="text-xs">
                Tu rol
              </Badge>
            )}
          </div>
        )
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
        const permisosCount = permisos ? Object.keys(permisos).filter(key => permisos[key as keyof typeof permisos] === true).length : 0
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