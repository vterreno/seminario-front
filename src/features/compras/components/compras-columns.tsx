import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { DataTableRowActions } from './data-table-row-actions'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Compra } from '../data/schema'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string
    displayName?: string
  }
}

interface ComprasColumnsOptions {
  canBulkAction?: boolean
  isSuperUser?: boolean
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

export const comprasColumns = (options: ComprasColumnsOptions = {}): ColumnDef<Compra>[] => {
  const { canBulkAction = true, canView = false, canEdit = false, canDelete = false } = options
  
  const baseColumns: ColumnDef<Compra>[] = []

  // Solo agregar la columna de selección si tiene permisos para bulk actions
  if (canBulkAction) {
    baseColumns.push({
      id: 'select',
      header: ({ table }) => {
        // Solo contar filas que pueden ser eliminadas (pendiente_pago)
        const selectableRows = table.getRowModel().rows.filter(row => {
          const compraEstado = (row.original.estado || '').toLowerCase()
          return compraEstado === 'pendiente_pago'
        })
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
        // Solo permitir seleccionar si la compra está pendiente de pago
        const compraEstado = (row.original.estado || '').toLowerCase()
        const puedeSeleccionar = compraEstado === 'pendiente_pago'
        
        if (!puedeSeleccionar) {
          return null // No mostrar checkbox si no se puede seleccionar
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
      accessorKey: 'numero_compra',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Número' />
      ),
      cell: ({ row }) => {        
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue('numero_compra')}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const numeroCompra = String(row.getValue(id))
        return numeroCompra.toLowerCase().includes(String(value).toLowerCase())
      },
      enableSorting: true,
      enableColumnFilter: true,
      meta: { 
        className: 'w-24',
        displayName: 'Número'
      },
    },
    {
      id: 'sucursal',
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
      filterFn: (row, _id, value) => {
        if (!value) return true
        const sucursal = row.original.sucursal
        const nombreSucursal = sucursal?.nombre || ''
        return nombreSucursal.toLowerCase().includes(String(value).toLowerCase())
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        displayName: 'Sucursal',
        className: 'w-36'
      },
    },
    {
      accessorKey: 'fecha_compra',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Fecha' />
      ),
      cell: ({ row }) => {
        const fecha = row.getValue('fecha_compra') as Date | string
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
      id: 'contacto',
      accessorKey: 'contacto',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Proveedor' />
      ),
      cell: ({ row }) => {
        const contacto = row.original.contacto
        const nombre = contacto?.nombre_razon_social || '-'
        return (
          <div className='flex items-center gap-x-2'>
            <LongText className='max-w-40'>{nombre}</LongText>
          </div>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value) return true
        const contacto = row.original.contacto
        const nombreContacto = contacto?.nombre_razon_social || ''
        return nombreContacto.toLowerCase().includes(String(value).toLowerCase())
      },
      enableSorting: false,
      enableColumnFilter: true,
      meta: {
        displayName: 'Proveedor',
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
      accessorKey: 'estado',
      id: 'estado',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Estado' />
      ),
      cell: ({ row }) => {
        const estado = (row.original.estado || '-').toLowerCase()
        const estadosMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
          pendiente_pago: { label: 'PENDIENTE PAGO', variant: 'destructive', className: 'bg-red-500 hover:bg-red-600 text-white' },
          pagada: { label: 'PAGADO', variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' },
          pagado: { label: 'PAGADO', variant: 'default', className: 'bg-green-500 hover:bg-green-600 text-white' },
          cancelada: { label: 'Cancelada', variant: 'destructive' },
        }
        const estadoInfo = estadosMap[estado] || { label: estado, variant: 'outline' as const }
        return (
          <Badge variant={estadoInfo.variant} className={estadoInfo.className}>
            {estadoInfo.label}
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value?.length) return true
        const estado = row.original.estado
        return value.includes(estado)
      },
      enableSorting: false,
      meta: {
        displayName: 'Estado',
        className: 'w-32'
      },
    },
    {
      accessorKey: 'numero_factura',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='N° Factura' />
      ),
      cell: ({ row }) => {
        const numeroFactura = row.original.numero_factura
        return (
          <div className='flex items-center gap-x-2'>
            {numeroFactura ? (
              <LongText className='max-w-40 font-mono text-sm'>{numeroFactura}</LongText>
            ) : (
              <span className='text-muted-foreground'>-</span>
            )}
          </div>
        )
      },
      enableSorting: false,
      meta: {
        displayName: 'N° Factura',
        className: 'w-40'
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        // Solo permitir eliminar si la compra está pendiente de pago
        const compraEstado = (row.original.estado || '').toLowerCase()
        const puedeEliminar = compraEstado === 'pendiente_pago' && canDelete
        
        return (
          <DataTableRowActions 
            row={row} 
            canView={canView}
            canEdit={canEdit}
            canDelete={puedeEliminar}
          />
        )
      },
    }
  )

  return baseColumns
}
