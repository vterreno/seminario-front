import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Categoria } from '../data/schema'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    displayName?: string
  }
}

interface CategoriasColumnsOptions {
  canBulkAction?: boolean // Opción para controlar bulk actions
  isSuperAdmin?: boolean // Opción para controlar si mostrar columna empresa
}

export const categoriasColumns = (options: CategoriasColumnsOptions = {}): ColumnDef<Categoria>[] => {
  const { canBulkAction = true, isSuperAdmin = false } = options
  
  const baseColumns: ColumnDef<Categoria>[] = []

  // Solo agregar la columna de selección si tiene permisos para bulk actions
  if (canBulkAction) {
    baseColumns.push({
      id: 'select',
      header: ({ table }) => {
        // Seleccionar todas las filas
        const selectableRows = table.getRowModel().rows
        
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
        <DataTableColumnHeader column={column} title='Nombre' />
      ),
      cell: ({ row }) => {        
        return (
          <div className="flex items-center gap-2">
            <LongText className='max-w-36'>{row.getValue('nombre')}</LongText>
          </div>
        )
      },
      enableSorting: true, // Habilitar ordenamiento explícitamente
      meta: { 
        className: 'w-36',
        displayName: 'Nombre'
      },
    },
    {
      accessorKey: 'descripcion',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Descripción' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-60'>{row.getValue('descripcion')}</LongText>
          </div>
        )
      },
      enableSorting: true,
      enableHiding: false,
      meta: {
        displayName: 'Descripción',
        className: 'w-60'
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
      filterFn: (row, id, value) => {
        const estado = row.getValue(id) as boolean
        return value.includes(estado.toString())
      },
      enableSorting: true,
      meta: {
        displayName: 'Estado'
      },
    }
  )

  // Solo agregar la columna empresa si el usuario es superadmin
  if (isSuperAdmin) {
    // Insertar la columna empresa después de descripción y antes de estado
    const estadoColumnIndex = baseColumns.findIndex(col => 'accessorKey' in col && col.accessorKey === 'estado')
    baseColumns.splice(estadoColumnIndex, 0, {
      accessorKey: 'empresa.name',
      id: 'empresa', // ID específico para filtrado
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' /> 
      ),
      cell: ({ row }) => {
        const empresa = row.original.empresa;
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-60'>{empresa?.name || '-'}</LongText>
          </div>
        )
      },
      filterFn: (row, _id, value) => {
        // Si no hay valores seleccionados, mostrar todo
        if (!value?.length) return true
        
        // Extraer el ID de empresa para comparar
        const empresaId = row.original.empresa?.id?.toString()
        
        // Verificar si el ID de empresa está en los valores filtrados
        return value.includes(empresaId)
      },
      enableSorting: true,
      enableHiding: false,
      meta: {
        displayName: 'Empresa',
        className: 'w-60'
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