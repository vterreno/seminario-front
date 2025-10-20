import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Venta } from '../data/schema'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    displayName?: string
  }
}

interface VentasColumnsOptions {
  canBulkAction?: boolean // Opción para controlar bulk actions
  isSuperUser?: boolean // Opción para mostrar columna de empresa
  canView?: boolean // Permiso para ver detalles
  canEdit?: boolean // Permiso para editar
  canDelete?: boolean // Permiso para eliminar
}

export const ventasColumns = (options: VentasColumnsOptions = {}): ColumnDef<Venta>[] => {
  const { canBulkAction = true, isSuperUser = false, canView = false, canEdit = false, canDelete = false } = options
  
  const baseColumns: ColumnDef<Venta>[] = []

  // Solo agregar la columna de selección si tiene permisos para bulk actions
  if (canBulkAction) {
    baseColumns.push({
      id: 'select',
      header: ({ table }) => {
        const selectableRows = table.getRowModel().rows
        const selectedSelectableRows = selectableRows.filter(row => row.getIsSelected())
        const isAllSelectableSelected = selectableRows.length > 0 && selectedSelectableRows.length === selectableRows.length
        const isSomeSelectableSelected = selectedSelectableRows.length > 0 && selectedSelectableRows.length < selectableRows.length
        
        return (
          <Checkbox
            checked={isAllSelectableSelected || (isSomeSelectableSelected && 'indeterminate')}
            onCheckedChange={(value) => {
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

  // Solo agregar la columna de empresa si es superusuario
  if (isSuperUser) {
    baseColumns.push({
      accessorKey: 'empresa',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Empresa' />
      ),
      cell: ({ row }) => {
        const sucursal = row.original.sucursal
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-36'>{sucursal?.empresa?.name || '-'}</LongText>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'Empresa',
        className: 'w-36'
      },
    })
  }

  // Agregar las demás columnas
  baseColumns.push(
    {
      accessorKey: 'numero_venta',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Número' />
      ),
      cell: ({ row }) => {        
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue('numero_venta')}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        // Convertir el número de venta a string para la búsqueda
        const numeroVenta = String(row.getValue(id))
        return numeroVenta.toLowerCase().includes(String(value).toLowerCase())
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: { 
        className: 'w-24',
        displayName: 'Número'
      },
    },
    {
      accessorKey: 'sucursal',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Sucursal' />
      ),
      cell: ({ row }) => {
        const sucursal = row.original.sucursal
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-36'>{sucursal?.nombre || '-'}</LongText>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'Sucursal',
        className: 'w-36'
      },
    },
    {
      accessorKey: 'fecha_venta',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha' />
      ),
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_venta') as Date | string
        const fechaDate = typeof fecha === 'string' ? new Date(fecha) : fecha
        return (
          <div className='w-[100px]'>
            {fechaDate ? format(fechaDate, 'dd/MM/yyyy', { locale: es }) : '-'}
          </div>
        )
      },
      enableSorting: true,
      meta: {
        displayName: 'Fecha',
        className: 'w-[100px]'
      },
    },
    {
      accessorKey: 'contacto',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cliente' />
      ),
      cell: ({ row }) => {
        const contacto = row.original.contacto
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-40'>{contacto?.nombre_razon_social|| '-'}</LongText>
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'Cliente',
        className: 'w-40'
      },
    },
    {
      accessorKey: 'monto_total',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Total' />
      ),
      cell: ({ row }) => {
        const total = row.getValue('monto_total') as number
        const totalNumber = typeof total === 'string' ? parseFloat(total) : total
        const displayTotal = isNaN(totalNumber) || totalNumber === null || totalNumber === undefined ? 0 : totalNumber
        return (
          <div className='font-medium'>
            ${displayTotal.toFixed(2)}
          </div>
        )
      },
      enableSorting: true,
      meta: {
        displayName: 'Total',
        className: 'w-24'
      },
    },
    {
      accessorKey: 'pago.metodo_pago',
      id: 'metodo_pago',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Método de pago' />
      ),
      cell: ({ row }) => {
        const metodo = row.original.pago?.metodo_pago || '-'
        const metodosMap: Record<string, string> = {
          efectivo: 'Efectivo',
          transferencia: 'Transferencia',
        }
        return (
          <Badge variant='outline'>
            {metodosMap[metodo] || metodo}
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value?.length) return true
        const metodo = row.original.pago?.metodo_pago
        return value.includes(metodo)
      },
      enableSorting: false,
      meta: {
        displayName: 'Método de pago',
        className: 'w-32'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DataTableRowActions 
          row={row} 
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ),
    }
  )

  return baseColumns
}