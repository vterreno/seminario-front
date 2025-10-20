import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Empresa } from '@/service/apiEmpresa.service'

interface EmpresaSelectorProps {
  empresas: Empresa[]
  empresaSeleccionada: number | null
  onEmpresaChange: (empresaId: number) => void
}

export function EmpresaSelector({
  empresas,
  empresaSeleccionada,
  onEmpresaChange,
}: EmpresaSelectorProps) {
  return (
    <Select
      value={empresaSeleccionada?.toString() || ''}
      onValueChange={(value) => onEmpresaChange(Number(value))}
    >
      <SelectTrigger id="empresa">
        <SelectValue placeholder="Seleccione una empresa" />
      </SelectTrigger>
      <SelectContent>
        {empresas.map((empresa) => (
          <SelectItem key={empresa.id} value={empresa.id!.toString()}>
            {empresa.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
