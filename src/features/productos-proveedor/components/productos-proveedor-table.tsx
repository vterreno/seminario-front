import { useState, useMemo } from 'react'
import { ColumnDef, RowSelectionState } from '@tanstack/react-table'
import { ProductoProveedor } from '@/service/apiProductoProveedor.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Edit, Trash2, Search, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table'

interface ProductosProveedorTableProps {
  data: ProductoProveedor[]
  onEdit: (producto: ProductoProveedor) => void
  onDelete: (producto: ProductoProveedor) => void
  onBulkDelete?: (ids: number[]) => void
  isBulkDeleting?: boolean
}

export function ProductosProveedorTable({ 
  data, 
  onEdit, 
  onDelete, 
  onBulkDelete,
  isBulkDeleting = false 
}: ProductosProveedorTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Filtrar datos basado en el término de búsqueda
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data
    
    const term = searchTerm.toLowerCase()
    return data.filter(item => 
      item.producto?.nombre?.toLowerCase().includes(term) ||
      item.producto?.codigo?.toLowerCase().includes(term) ||
      item.codigo_proveedor?.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  const columns: ColumnDef<ProductoProveedor>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'producto.codigo',
      header: 'Código Producto',
      cell: ({ row }) => row.original.producto?.codigo || '-',
    },
    {
      accessorKey: 'producto.nombre',
      header: 'Nombre Producto',
      cell: ({ row }) => row.original.producto?.nombre || '-',
    },
    {
      accessorKey: 'codigo_proveedor',
      header: 'Código Proveedor',
      cell: ({ row }) => row.original.codigo_proveedor || '-',
    },
    {
      accessorKey: 'precio_proveedor',
      header: 'Precio Proveedor',
      cell: ({ row }) => `$${Number(row.original.precio_proveedor).toFixed(2)}`,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onEdit(row.original)}
          >
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(row.original)}
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
    getRowId: (row) => row.id.toString(),
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedIds = selectedRows.map(row => row.original.id)

  const handleBulkDelete = () => {
    if (onBulkDelete && selectedIds.length > 0) {
      onBulkDelete(selectedIds)
    }
  }

  const clearSelection = () => {
    setRowSelection({})
  }

  if (data.length === 0) {
    return (
      <div className='rounded-md border p-8 text-center'>
        <p className='text-muted-foreground'>
          No hay productos asociados a este proveedor
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Barra de búsqueda y acciones en masa */}
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <div className='relative w-full sm:max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre o código...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10 pr-10'
          />
          {searchTerm && (
            <Button
              variant='ghost'
              size='sm'
              className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0'
              onClick={() => setSearchTerm('')}
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>

        {/* Acciones en masa */}
        {selectedIds.length > 0 && (
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={clearSelection}
            >
              Limpiar
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
            >
              <Trash2 className='h-4 w-4 mr-2' />
              {isBulkDeleting ? 'Eliminando...' : `Eliminar (${selectedIds.length})`}
            </Button>
          </div>
        )}
      </div>

      {/* Mensaje cuando no hay resultados de búsqueda */}
      {filteredData.length === 0 && searchTerm && (
        <div className='rounded-md border p-8 text-center'>
          <p className='text-muted-foreground'>
            No se encontraron productos que coincidan con "{searchTerm}"
          </p>
        </div>
      )}

      {/* Tabla */}
      {filteredData.length > 0 && (
        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow 
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
