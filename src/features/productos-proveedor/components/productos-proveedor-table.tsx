import { ColumnDef } from '@tanstack/react-table'
import { ProductoProveedor } from '@/service/apiProductoProveedor.service'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'

interface ProductosProveedorTableProps {
  data: ProductoProveedor[]
  onEdit: (producto: ProductoProveedor) => void
  onDelete: (producto: ProductoProveedor) => void
}

export function ProductosProveedorTable({ data, onEdit, onDelete }: ProductosProveedorTableProps) {
  const columns: ColumnDef<ProductoProveedor>[] = [
    {
      accessorKey: 'producto.codigo',
      header: 'Código',
    },
    {
      accessorKey: 'producto.nombre',
      header: 'Nombre',
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
      accessorKey: 'producto.precio_costo',
      header: 'Precio Costo',
      cell: ({ row }) => `$${Number(row.original.producto?.precio_costo || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'producto.precio_venta',
      header: 'Precio Venta',
      cell: ({ row }) => `$${Number(row.original.producto?.precio_venta || 0).toFixed(2)}`,
    },
    {
      accessorKey: 'producto.stock',
      header: 'Stock',
    },
    {
      accessorKey: 'producto.estado',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.producto?.estado ? 'default' : 'secondary'}>
          {row.original.producto?.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

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
            <TableRow key={row.id}>
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
  )
}
