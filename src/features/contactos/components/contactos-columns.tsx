import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Contacto } from '@/service/apiContactos.service'

// Helper function para mostrar "-" cuando el valor es null, undefined o string vacío
const displayValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return String(value)
}

// Función para generar columnas dinámicamente según el rol
export const getContactosColumns = (isSuperAdmin: boolean = false): ColumnDef<Contacto>[] => [
  {
    id: 'select',
    header: ({ table }) => {
      // Filtrar filas que no sean consumidor final
      const selectableRows = table.getRowModel().rows.filter(row => {
        const contacto = row.original
        return !contacto.es_consumidor_final
      })
      
      // Verificar cuántas filas seleccionables están seleccionadas
      const selectedSelectableRows = selectableRows.filter(row => row.getIsSelected())
      const isAllSelectableSelected = selectableRows.length > 0 && selectedSelectableRows.length === selectableRows.length
      const isSomeSelectableSelected = selectedSelectableRows.length > 0 && selectedSelectableRows.length < selectableRows.length
      
      return (
        <Checkbox
          checked={isAllSelectableSelected || (isSomeSelectableSelected && 'indeterminate')}
          onCheckedChange={(value) => {
            // Seleccionar/deseleccionar solo las filas que no son consumidor final
            selectableRows.forEach(row => {
              row.toggleSelected(!!value)
            })
          }}
          aria-label='Seleccionar todos'
          className='translate-y-[2px]'
        />
      )
    },
    cell: ({ row }) => {
      const contacto = row.original
      
      // Si es consumidor final, no renderizar el checkbox funcional
      if (contacto.es_consumidor_final) {
        return <Checkbox disabled aria-hidden="true" tabIndex={-1} className="pointer-events-none" />
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
  },
  {
    accessorKey: 'nombre_razon_social',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre / Razón social' />
    ),
    meta: { displayName: 'Nombre / Razón social' },
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue('nombre_razon_social') as string
      const contacto = row.original
      
      return (
        <div className="flex items-center gap-2">
          <span>{displayValue(value)}</span>
          {contacto.es_consumidor_final && (
            <Badge variant="secondary" className="text-xs">
              CF
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const cellValue = String(row.getValue(id)).toLowerCase()
      const searchValue = String(value).toLowerCase()
      return cellValue.includes(searchValue)
    },
  },
  // Columna de empresa solo visible para superadmin
  ...(isSuperAdmin ? [{
    accessorKey: 'empresa',
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title='Empresa' />
    ),
    meta: { displayName: 'Empresa' },
    cell: ({ row }: any) => {
      const empresa = row.original.empresa
      return displayValue(empresa?.name)
    },
    enableSorting: true,
  }] : []),
  {
    accessorKey: 'condicion_iva',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Condición IVA' />
    ),
    meta: { displayName: 'Condición IVA' },
    cell: ({ row }) => {
      const value = row.getValue('condicion_iva') as string
      return displayValue(value)
    },
    enableHiding: true,
  },
  {
    accessorKey: 'telefono_movil',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Teléfono' />
    ),
    meta: { displayName: 'Teléfono' },
    cell: ({ row }) => {
      const value = row.getValue('telefono_movil') as string
      return displayValue(value)
    },
  },
  {
    id: 'direccion',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Dirección' />
    ),
    meta: { displayName: 'Dirección' },
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

// Exportar las columnas por defecto para mantener compatibilidad
export const contactosColumns: ColumnDef<Contacto>[] = getContactosColumns(false)


