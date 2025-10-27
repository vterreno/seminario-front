import { useState, useMemo } from 'react'
import { Label } from '@/components/ui/label'
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

interface ClienteSelectorProps {
  clientes: Contacto[]
  clienteSeleccionado: number | null
  onClienteChange: (clienteId: number) => void
  empresaSeleccionada?: number | null
}

export function ClienteSelector({
  clientes,
  clienteSeleccionado,
  onClienteChange,
}: ClienteSelectorProps) {
  const [busqueda, setBusqueda] = useState('')

  const clientesFiltrados = useMemo(() => {
    if (!busqueda) return clientes

    const busquedaLower = busqueda.toLowerCase()
    return clientes.filter((cliente) => {
      const nombre = cliente.nombre_razon_social?.toLowerCase() || ''
      const email = cliente.email?.toLowerCase() || ''
      const telefono = cliente.telefono_movil || ''
      
      return (
        nombre.includes(busquedaLower) ||
        email.includes(busquedaLower) ||
        telefono.includes(busquedaLower)
      )
    })
  }, [clientes, busqueda])

  return (
    <div className="space-y-2">      
      <div className="relative">
        <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar cliente por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={clienteSeleccionado?.toString() || ''}
        onValueChange={(value) => onClienteChange(Number(value))}
      >
        <SelectTrigger id="cliente" className="w-full">
          <SelectValue placeholder="Seleccione un cliente" />
        </SelectTrigger>
        <SelectContent>
          {clientesFiltrados.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {busqueda ? (
                <p>No se encontraron clientes con esa búsqueda</p>
              ) : clientes.length === 0 ? (
                <div className="space-y-1">
                  <p className="font-medium">No hay clientes disponibles</p>
                  <p className="text-xs">No hay clientes registrados para esta empresa</p>
                </div>
              ) : (
                <p>No se encontraron clientes</p>
              )}
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id!.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{cliente.nombre_razon_social}</span>
                  {cliente.email && (
                    <span className="text-xs text-muted-foreground">{cliente.email}</span>
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
