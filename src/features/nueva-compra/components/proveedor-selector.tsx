import { useState, useMemo } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Contacto } from '@/service/apiContactos.service'
import { Search } from 'lucide-react'

interface ProveedorSelectorProps {
  proveedor: Contacto[]
  proveedorSeleccionado: number | null
  onProveedorChange: (proveedorId: number) => void
  empresaSeleccionada?: number | null
}

export function ProveedorSelector({
  proveedor,
  proveedorSeleccionado,
  onProveedorChange,
}: ProveedorSelectorProps) {
  const [busqueda, setBusqueda] = useState('')

  const proveedoresFiltrados = useMemo(() => {
    if (!busqueda) return proveedor

    const busquedaLower = busqueda.toLowerCase()
    return proveedor.filter((proveedor) => {
      const nombre = proveedor.nombre_razon_social?.toLowerCase() || ''
      const email = proveedor.email?.toLowerCase() || ''
      const telefono = proveedor.telefono_movil || ''
      
      return (
        nombre.includes(busquedaLower) ||
        email.includes(busquedaLower) ||
        telefono.includes(busquedaLower)
      )
    })
  }, [proveedor, busqueda])

  return (
    <div className="space-y-2">      
      <div className="relative">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar proveedor por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={proveedorSeleccionado?.toString() || ''}
        onValueChange={(value) => onProveedorChange(Number(value))}
      >
        <SelectTrigger id="proveedor" className="w-full">
          <SelectValue placeholder="Seleccione un proveedor" />
        </SelectTrigger>
        <SelectContent>
          {proveedoresFiltrados.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {busqueda ? (
                <p>No se encontraron proveedores con esa búsqueda</p>
              ) : proveedor.length === 0 ? (
                <div className="space-y-1">
                  <p className="font-medium">No hay proveedores disponibles</p>
                  <p className="text-xs">No hay proveedores registrados para esta empresa</p>
                </div>
              ) : (
                <p>No se encontraron proveedores</p>
              )}
            </div>
          ) : (
            proveedoresFiltrados.map((proveedor) => (
              <SelectItem key={proveedor.id} value={proveedor.id!.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{proveedor.nombre_razon_social}</span>
                  {proveedor.email && (
                    <span className="text-xs text-muted-foreground">{proveedor.email}</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
