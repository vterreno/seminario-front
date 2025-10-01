import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { DataTableRowActions } from './data-table-row-actions'
import { UnidadMedida } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCircle, XCircle } from 'lucide-react'

export const getUnidadMedidaColumns = (isSuperAdmin: boolean = false): ColumnDef<UnidadMedida>[] => {
  const baseColumns: ColumnDef<UnidadMedida>[] = [
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
      accessorKey: 'nombre',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nombre' />
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
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const cellValue = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return cellValue.includes(searchValue)
      },
    },
    {
      accessorKey: 'abreviatura',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Abreviatura' />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex space-x-2'>
            <Badge variant="outline" className='max-w-[100px] truncate'>
              {row.getValue('abreviatura')}
            </Badge>
          </div>
        )
      },
      meta: {
        displayName: 'Abreviatura',
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const cellValue = String(row.getValue(id)).toLowerCase()
        const searchValue = String(value).toLowerCase()
        return cellValue.includes(searchValue)
      },
    },
  ]

  // Agregar columna empresa solo para superadmin
  if (isSuperAdmin) {
    baseColumns.push({
      accessorKey: 'empresa_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' />
      ),
      cell: ({ row }) => {
        const empresaId = row.getValue('empresa_id') as number
        return (
          <div className='flex space-x-2'>
            {empresaId ? (
              <Badge variant="default" className='max-w-[150px] truncate'>
                Empresa {empresaId}
              </Badge>
            ) : (
              <Badge variant="secondary" className='max-w-[150px] truncate text-muted-foreground'>
                Sin empresa
              </Badge>
            )}
          </div>
        )
      },
      meta: {
        displayName: 'Empresa',
      },
      enableSorting: true,
      filterFn: (row, id, value) => {
        const empresaId = row.getValue(id) as number
        const searchValue = String(value).toLowerCase()
        
        // Si busca "sin empresa" y no hay empresa_id, coincide
        if (searchValue.includes('sin empresa') && !empresaId) {
          return true
        }
        
        // Si hay empresa_id, busca por el número
        if (empresaId) {
          return String(empresaId).includes(searchValue)
        }
        
        return false
      },
    })
  }

  // Agregar las columnas restantes
  baseColumns.push(
    {
      accessorKey: 'aceptaDecimales',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Acepta decimales' />
      ),
      meta: {
        displayName: 'Acepta decimales',
      },
      cell: ({ row }) => {
        const aceptaDecimales = row.getValue('aceptaDecimales') as boolean

        return (
          <div className="flex items-center space-x-2">
            {aceptaDecimales ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Si</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-600">No</span>
              </>
            )}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const aceptaDecimales = row.getValue(id) as boolean
        return value.includes(aceptaDecimales.toString())
      },
      enableSorting: true,
    },
    {
      accessorKey: 'created_at',
      meta: {
        displayName: 'Fecha de creacion',
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha de creacion' />
      ),
      cell: ({ row }) => {
        const created_at = row.getValue('created_at') as string
        return (
          <div className='w-[140px]'>
            {created_at ? format(new Date(created_at), 'dd/MM/yyyy', { locale: es }) : '-'}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: 'updated_at',
      meta: {
        displayName: 'Fecha de modificacion',
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha de modificacion' />
      ),
      cell: ({ row }) => {
        const updated_at = row.getValue('updated_at') as string
        return (
          <div className='w-[140px]'>
            {updated_at ? format(new Date(updated_at), 'dd/MM/yyyy', { locale: es }) : '-'}
          </div>
        )
      },
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    }
  )

  return baseColumns
}