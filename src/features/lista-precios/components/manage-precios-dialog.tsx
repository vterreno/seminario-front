import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Edit, Save, X, Percent, TrendingUp, TrendingDown } from 'lucide-react'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import type { ListaPrecios, ProductoListaPrecio } from '../data/schema'
import { ProductSelectorDialog } from './product-selector-dialog'
import { formatCurrency, formatCurrencyInput, parseCurrency } from './format-money'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'

interface ManagePreciosDialogProps {
    lista: ListaPrecios | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    empresaId?: number
    isSuperAdmin?: boolean
}

interface ProductoConPrecio extends ProductoListaPrecio {
    precioEditado?: string
}

export function ManagePreciosDialog({
    lista,
    isOpen,
    onClose,
    onSuccess,
    empresaId,
    isSuperAdmin = false
}: ManagePreciosDialogProps) {
    const [productos, setProductos] = useState<ProductoConPrecio[]>([])
    const [loading, setLoading] = useState(false)
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingPrice, setEditingPrice] = useState('')
    const [porcentajeAjuste, setPorcentajeAjuste] = useState<string>('')
    const [tipoAjuste, setTipoAjuste] = useState<'aumento' | 'descuento'>('aumento')
    const [showPorcentajePanel, setShowPorcentajePanel] = useState(false)

    useEffect(() => {
        if (isOpen && lista) {
            loadProductos()
        }
    }, [isOpen, lista])

    const loadProductos = async () => {
        if (!lista) return
        
        try {
            setLoading(true)
            const data = await apiListaPreciosService.getProductosByListaPrecios(lista.id)
            setProductos(data)
        } catch (error) {
            console.error('Error loading productos:', error)
            toast.error('Error al cargar los productos')
        } finally {
            setLoading(false)
        }
    }

    const handleAddProductos = async (productIds: number[]) => {
        if (!lista) return
        
        try {
            await apiListaPreciosService.addProductosToListaPrecios(lista.id, productIds)
            toast.success(`${productIds.length} producto(s) agregado(s) a la lista`)
            await loadProductos()
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al agregar productos')
        }
    }

    const handleStartEdit = (producto: ProductoConPrecio) => {
        setEditingId(producto.id)
        setEditingPrice(formatCurrency(producto.precio))
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditingPrice('')
    }

    const handleSaveEdit = async (producto: ProductoConPrecio) => {
        if (!lista) return
        
        try {
            const newPrice = parseCurrency(editingPrice)
            
            if (newPrice <= 0) {
                toast.error('El precio debe ser mayor a cero')
                return
            }

            // Actualizar el precio en el backend
            await apiListaPreciosService.updateProductoPrecioInLista(lista.id, producto.id, newPrice)
            
            // Actualizar localmente
            setProductos(prev => prev.map(p => 
                p.id === producto.id ? { ...p, precio: newPrice } : p
            ))
            
            toast.success('Precio actualizado exitosamente')
            setEditingId(null)
            setEditingPrice('')
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al actualizar el precio')
        }
    }

    const handleRemoveProducto = async (productoId: number) => {
        if (!lista) return
        
        try {
            await apiListaPreciosService.removeProductoFromListaPrecios(lista.id, productoId)
            setProductos(prev => prev.filter(p => p.id !== productoId))
            toast.success('Producto eliminado de la lista')
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al eliminar el producto')
        }
    }

    const aplicarPorcentajeATodos = async () => {
        if (!lista) return
        
        const porcentaje = parseFloat(porcentajeAjuste)
        
        if (isNaN(porcentaje) || porcentaje < 0) {
            toast.error('Ingrese un porcentaje válido')
            return
        }

        if (productos.length === 0) {
            toast.error('No hay productos en la lista')
            return
        }

        try {
            // Aplicar el porcentaje a todos los productos
            const promesas = productos.map(producto => {
                const precioBase = producto.precio_venta ?? 0
                let nuevoPrecio: number
                
                if (tipoAjuste === 'aumento') {
                    nuevoPrecio = precioBase * (1 + porcentaje / 100)
                } else {
                    nuevoPrecio = precioBase * (1 - porcentaje / 100)
                }
                
                nuevoPrecio = Math.max(0, Math.round(nuevoPrecio * 100) / 100)
                
                return apiListaPreciosService.updateProductoPrecioInLista(lista.id, producto.id, nuevoPrecio)
            })

            await Promise.all(promesas)
            
            // Recargar productos
            await loadProductos()
            
            toast.success(
                `${tipoAjuste === 'aumento' ? 'Aumento' : 'Descuento'} del ${porcentaje}% aplicado a ${productos.length} producto(s)`
            )
            
            setPorcentajeAjuste('')
            setShowPorcentajePanel(false)
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al aplicar el porcentaje')
        }
    }

    const productosYaAgregados = productos.map(p => p.id)

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent 
                    resizable={true}
                    minWidth={600}
                    minHeight={400}
                    maxWidth={window.innerWidth * 0.9}
                    maxHeight={window.innerHeight * 0.9}
                    defaultWidth={900}
                    defaultHeight={700}
                    className="flex flex-col p-0"
                >
                    <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                        <DialogTitle className="text-xl">
                            Gestionar Precios - {lista?.nombre}
                        </DialogTitle>
                        <DialogDescription>
                            Agrega productos y define precios específicos para esta lista
                        </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-4 border-b shrink-0 space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                onClick={() => setIsProductSelectorOpen(true)}
                                className="w-full sm:w-auto"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Productos
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowPorcentajePanel(!showPorcentajePanel)}
                                className="w-full sm:w-auto"
                                disabled={productos.length === 0}
                            >
                                <Percent className="mr-2 h-4 w-4" />
                                Ajuste Porcentual Global
                            </Button>
                        </div>

                        {/* Panel de ajuste porcentual */}
                        {showPorcentajePanel && productos.length > 0 && (
                            <div className="rounded-lg border bg-muted/50 p-4 animate-in slide-in-from-top-2">
                                <Label className="mb-3 flex items-center gap-2 text-sm font-semibold">
                                    <Percent className="h-4 w-4" />
                                    Aplicar ajuste a todos los productos de la lista
                                </Label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            type="button"
                                            variant={tipoAjuste === 'aumento' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTipoAjuste('aumento')}
                                            className="gap-1 flex-1 sm:flex-none"
                                        >
                                            <TrendingUp className="h-4 w-4" />
                                            Aumento
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={tipoAjuste === 'descuento' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setTipoAjuste('descuento')}
                                            className="gap-1 flex-1 sm:flex-none"
                                        >
                                            <TrendingDown className="h-4 w-4" />
                                            Descuento
                                        </Button>
                                    </div>
                                    <div className="relative flex-1">
                                        <Input
                                            type="number"
                                            placeholder="Ej: 10"
                                            value={porcentajeAjuste}
                                            onChange={e => setPorcentajeAjuste(e.target.value)}
                                            className="pr-8"
                                            min="0"
                                            step="0.01"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={aplicarPorcentajeATodos}
                                        disabled={!porcentajeAjuste}
                                        className="w-full sm:w-auto"
                                    >
                                        Aplicar a Todos
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    💡 Se aplicará el {tipoAjuste} del {porcentajeAjuste || '0'}% sobre el precio base de cada producto
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto px-6">
                        {loading ? (
                            <div className="space-y-3 py-4">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : productos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-lg font-medium">No hay productos en esta lista</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Haz clic en "Agregar Productos" para comenzar
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border mt-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-32">Código</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="w-40">Marca</TableHead>
                                            <TableHead className="w-40">Categoría</TableHead>
                                            <TableHead className="w-40 text-right">Precio Base</TableHead>
                                            <TableHead className="w-40 text-right">Precio en Lista</TableHead>
                                            <TableHead className="w-32 text-center">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {productos.map((producto) => {
                                            const isEditing = editingId === producto.id
                                            
                                            return (
                                                <TableRow key={producto.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {producto.codigo}
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {producto.nombre}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {producto.marca?.nombre || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {producto.categoria?.nombre || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground">
                                                        ${formatCurrency(producto.precio_venta)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {isEditing ? (
                                                            <Input
                                                                value={editingPrice}
                                                                onChange={(e) => {
                                                                    const formatted = formatCurrencyInput(e.target.value, editingPrice)
                                                                    setEditingPrice(formatted)
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        handleSaveEdit(producto)
                                                                    } else if (e.key === 'Escape') {
                                                                        handleCancelEdit()
                                                                    }
                                                                }}
                                                                className="w-full text-right"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className="font-semibold">
                                                                ${formatCurrency(producto.precio ?? producto.precio_venta ?? 0)}
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-1">
                                                            {isEditing ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleSaveEdit(producto)}
                                                                    >
                                                                        <Save className="h-4 w-4 text-green-600" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleStartEdit(producto)}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8"
                                                                        onClick={() => handleRemoveProducto(producto.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
                        <Button variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ProductSelectorDialog
                isOpen={isProductSelectorOpen}
                onClose={() => setIsProductSelectorOpen(false)}
                onConfirm={handleAddProductos}
                initialSelectedIds={productosYaAgregados}
                empresaId={empresaId}
                isSuperAdmin={isSuperAdmin}
            />
        </>
    )
}
