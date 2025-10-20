import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sucursal } from '@/features/sucursales/data/schema'

interface SucursalSelectorProps {
  sucursales: Sucursal[]
  sucursalSeleccionada: number | null
  onSucursalChange: (sucursalId: number) => void
}

export function SucursalSelector({
  sucursales,
  sucursalSeleccionada,
  onSucursalChange,
}: SucursalSelectorProps) {
  return (
    <Select
      value={sucursalSeleccionada?.toString() || ''}
      onValueChange={(value) => onSucursalChange(Number(value))}
    >
      <SelectTrigger id="sucursal">
        <SelectValue placeholder="Seleccione una sucursal" />
      </SelectTrigger>
      <SelectContent>
        {sucursales.map((sucursal) => (
          <SelectItem key={sucursal.id} value={sucursal.id!.toString()}>
            {sucursal.nombre} {sucursal.codigo && `(${sucursal.codigo})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
