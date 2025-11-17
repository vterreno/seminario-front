import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useState } from 'react'
import { toast } from 'sonner'
import apiComprasService from '@/service/apiCompras.service'
import { Compra } from '../data/schema'
import { Loader2 } from 'lucide-react'

type ComprasPayDialogProps = {
  currentRow: Compra | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ComprasPayDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: ComprasPayDialogProps) {
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [loading, setLoading] = useState(false)

  const handlePagar = async () => {
    if (!currentRow?.id) return

    // Validar que la compra tenga sucursal
    if (!currentRow.sucursal?.id) {
      toast.error('La compra no tiene una sucursal asociada')
      return
    }

    // Validar que la compra esté en estado PENDIENTE_PAGO
    if (currentRow.estado !== 'PENDIENTE_PAGO') {
      toast.error('Solo se pueden pagar compras en estado PENDIENTE_PAGO')
      return
    }

    // Validar que la compra no tenga un pago asociado (si existe en el schema)
    if ((currentRow as any).pago) {
      toast.error('Esta compra ya tiene un pago asociado')
      return
    }

    try {
      setLoading(true)
      
      // Preparar los datos del pago
      const pagoData = {
        fecha_pago: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
        monto_pago: typeof currentRow.monto_total === 'string' 
          ? parseFloat(currentRow.monto_total) 
          : currentRow.monto_total,
        metodo_pago: metodoPago,
        sucursal_id: currentRow.sucursal.id,
      }

      await apiComprasService.asociarPagoACompra(currentRow.id, pagoData)
      toast.success('Pago asociado exitosamente')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error al asociar pago a compra:', error)
      toast.error(error.message || 'Error al asociar el pago a la compra')
    } finally {
      setLoading(false)
    }
  }

  if (!currentRow) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagar compra</DialogTitle>
          <DialogDescription>
            Compra #{currentRow.numero_compra} - Total: ${typeof currentRow.monto_total === 'string' 
              ? parseFloat(currentRow.monto_total).toFixed(2) 
              : currentRow.monto_total.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-base font-semibold mb-3 block">
            Método de pago
          </Label>
          <RadioGroup 
            value={metodoPago} 
            onValueChange={(value) => setMetodoPago(value as 'efectivo' | 'transferencia')}
            className="space-y-3"
          >
            <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="efectivo" id="efectivo" />
              <Label htmlFor="efectivo" className="cursor-pointer flex-1">
                <div className="font-medium">Efectivo</div>
                <div className="text-sm text-muted-foreground">Pago en efectivo</div>
              </Label>
            </div>
            <div className="flex items-center space-x-3 border rounded-lg p-3 hover:bg-muted/50 cursor-pointer">
              <RadioGroupItem value="transferencia" id="transferencia" />
              <Label htmlFor="transferencia" className="cursor-pointer flex-1">
                <div className="font-medium">Transferencia</div>
                <div className="text-sm text-muted-foreground">Pago por transferencia bancaria</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handlePagar}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              'Confirmar pago'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
