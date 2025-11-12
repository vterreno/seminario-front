import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Banknote } from 'lucide-react'

interface MetodoPagoSelectorProps {
  metodoPago: 'efectivo' | 'transferencia' | null
  onMetodoPagoChange: (metodo: 'efectivo' | 'transferencia') => void
}

export function MetodoPagoSelector({
  metodoPago,
  onMetodoPagoChange,
}: MetodoPagoSelectorProps) {
  return (
    <RadioGroup
      value={metodoPago || ''}
      onValueChange={(value) => onMetodoPagoChange(value as 'efectivo' | 'transferencia')}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <RadioGroupItem
            value="efectivo"
            id="efectivo"
            className="peer sr-only"
          />
          <Label
            htmlFor="efectivo"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Banknote className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Efectivo</span>
          </Label>
        </div>
        <div>
          <RadioGroupItem
            value="transferencia"
            id="transferencia"
            className="peer sr-only"
          />
          <Label
            htmlFor="transferencia"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <CreditCard className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Transferencia</span>
          </Label>
        </div>
      </div>
    </RadioGroup>
  )
}
