import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
    AjusteStockForm,
    ajusteStockFormSchema,
    Producto, 
} from '../data/schema'
import { useState } from 'react'
import { toast } from 'sonner'
import apiMovimientoStockService from '@/service/apiMovimientoStock.service'
import { useProductos } from './productos-provider'
import apiProductosService from '@/service/apiProductos.service'

type ProductosAjusteStockDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Producto | null
    onSuccess?: () => void
}

export function ProductosAjusteStockDialog({ 
    open, 
    onOpenChange, 
    currentRow,
    onSuccess
}: ProductosAjusteStockDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { setCurrentRow } = useProductos() 


    const form = useForm<AjusteStockForm>({
        resolver: zodResolver(ajusteStockFormSchema),
        defaultValues: {
            tipo_ajuste: 'aumento',
            cantidad: 1,
            motivo: ''
        }
    })

    const onSubmit = async (data: AjusteStockForm) => {
        if (!currentRow) return

        setIsSubmitting(true)
        try {
            await apiMovimientoStockService.realizarAjusteStock(currentRow.id, data)
            const productoActualizado = await apiProductosService.getProductoById(currentRow.id)
            setCurrentRow(productoActualizado)
            toast.success('Ajuste de stock realizado correctamente')
            handleClose()
            onSuccess?.()
        } catch (error: any) {
            console.error('Error al realizar ajuste:', error)
            toast.error(error.message || 'Error al realizar el ajuste de stock')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
    }

    const handleCancel = () => {
        handleClose()
    }

    if (!currentRow) return null

    const tipoAjuste = form.watch('tipo_ajuste')
    const cantidad = form.watch('cantidad')

    const stockResultante = tipoAjuste === 'aumento' 
        ? currentRow.stock + (cantidad || 0)
        : Math.max(0, currentRow.stock - (cantidad || 0))

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-xl">
                        Ajuste de stock
                    </DialogTitle>
                    <div className="bg-muted/30 p-4 rounded-lg border">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-foreground">{currentRow.nombre}</h4>
                                <p className="text-sm text-muted-foreground">Código: {currentRow.codigo}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground">Stock actual</p>
                                <p className="text-2xl font-bold text-foreground">{currentRow.stock}</p>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="tipo_ajuste"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Tipo de ajuste *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-11 w-full">
                                                <SelectValue placeholder="Seleccione el tipo de ajuste" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="aumento" className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    Aumento de stock
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="disminucion" className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <TrendingDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    Disminución de stock
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cantidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Cantidad *</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="99999"
                                            placeholder="Ingrese la cantidad"
                                            className="h-11 text-lg font-medium"
                                            {...field}
                                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Vista previa del resultado */}
                        {cantidad > 0 && (
                            <Alert className={`${
                                stockResultante === 0 
                                    ? 'border-yellow-500/50 bg-yellow-500/10 dark:border-yellow-400/50 dark:bg-yellow-400/10' 
                                    : tipoAjuste === 'aumento' 
                                        ? 'border-green-500/50 bg-green-500/10 dark:border-green-400/50 dark:bg-green-400/10'
                                        : 'border-blue-500/50 bg-blue-500/10 dark:border-blue-400/50 dark:bg-blue-400/10'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {tipoAjuste === 'aumento' ? (
                                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : stockResultante === 0 ? (
                                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                                    ) : (
                                        <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <AlertDescription>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <span className="text-muted-foreground">
                                                        Stock actual: 
                                                        <span className="text-foreground ml-1 font-semibold">{currentRow.stock}</span>
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                                                        tipoAjuste === 'aumento' 
                                                            ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                                                            : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                                                    }`}>
                                                        {tipoAjuste === 'aumento' ? `+${cantidad}` : `-${cantidad}`}
                                                    </span>
                                                    <span className="text-muted-foreground text-lg">→</span>
                                                    <span className={`font-bold ${
                                                        stockResultante === 0 
                                                            ? 'text-yellow-600 dark:text-yellow-400' 
                                                            : 'text-foreground'
                                                    }`}>
                                                        {stockResultante}
                                                    </span>
                                                </div>
                                                
                                                {stockResultante === 0 && (
                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                                        <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                                                        <span className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                                                            Atención: El stock quedará en cero después de este ajuste
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                {tipoAjuste === 'disminucion' && cantidad > currentRow.stock && (
                                                    <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                                        <AlertTriangle className="h-3 w-3 text-red-600 dark:text-red-400" />
                                                        <span className="text-xs text-red-700 dark:text-red-300 font-medium">
                                                            La cantidad a disminuir es mayor al stock actual
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </AlertDescription>
                                    </div>
                                </div>
                            </Alert>
                        )}

                        <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-semibold">Motivo del ajuste *</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describa detalladamente el motivo del ajuste (ej: mercadería dañada por humedad, error en conteo de inventario, devolución de cliente, etc.)"
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-xs text-muted-foreground">
                                        Este texto aparecerá en el historial de movimientos. Mínimo 3 caracteres, máximo 500 caracteres.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                size="lg"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="lg"
                                className={`min-w-[140px] ${
                                    tipoAjuste === 'aumento' 
                                        ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700' 
                                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                                }`}
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting 
                                    ? 'Guardando...' 
                                    : `${tipoAjuste === 'aumento' ? 'Aumentar' : 'Disminuir'} stock`
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
