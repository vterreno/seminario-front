import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, Package, Percent, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import apiProductosService from '@/service/apiProductos.service'
import type { Producto } from '@/features/productos/data/schema'
import { formatCurrency } from './format-money'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import type { ProductoConPrecio } from '../data/schema'

interface ProductWithPriceSelectorDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (productos: ProductoConPrecio[]) => void
    initialProductos?: ProductoConPrecio[]
    empresaId?: number
    isSuperAdmin?: boolean
}

interface ProductoConDatos extends Producto {
    precioEspecifico: number
    selected: boolean
}

export function ProductWithPriceSelectorDialog({
    isOpen,
    onClose,
    onConfirm,
    initialProductos = [],
    empresaId,
    isSuperAdmin = false
}: ProductWithPriceSelectorDialogProps) {
    const [productos, setProductos] = useState<ProductoConDatos[]>([])
    const [filteredProductos, setFilteredProductos] = useState<ProductoConDatos[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [porcentajeAjuste, setPorcentajeAjuste] = useState<string>('0')
    const [tipoAjuste, setTipoAjuste] = useState<'aumento' | 'descuento'>('aumento')

    useEffect(() => {
        if (isOpen) {
            loadProductos()
            setPorcentajeAjuste('0')
        }
    }, [isOpen, initialProductos])

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredProductos(productos)
        } else {
            const term = searchTerm.toLowerCase()
            const filtered = productos.filter(
                p =>
                    p.nombre.toLowerCase().includes(term) ||
                    p.codigo.toLowerCase().includes(term) ||
                    p.marca?.nombre.toLowerCase().includes(term) ||
                    p.categoria?.nombre.toLowerCase().includes(term)
            )
            setFilteredProductos(filtered)
        }
    }, [searchTerm, productos])

    // 🔥 Aplicar porcentaje automáticamente mientras se escribe (siempre activo)
    useEffect(() => {
        if (!porcentajeAjuste) return
        
        const porcentaje = parseFloat(porcentajeAjuste)
        if (isNaN(porcentaje)) return

        const productosSeleccionados = productos.filter(p => p.selected)
        if (productosSeleccionados.length === 0) return

        setProductos(prev =>
            prev.map(p => {
                if (!p.selected) return p
                
                const precioBase = p.precio_venta ?? 0
                let nuevoPrecio: number
                
                if (tipoAjuste === 'aumento') {
                    nuevoPrecio = precioBase * (1 + porcentaje / 100)
                } else {
                    nuevoPrecio = precioBase * (1 - porcentaje / 100)
                }
                
                // Redondear a 2 decimales
                nuevoPrecio = Math.max(0, Math.round(nuevoPrecio * 100) / 100)
                
                return { ...p, precioEspecifico: nuevoPrecio }
            })
        )
    }, [porcentajeAjuste, tipoAjuste, productos.filter(p => p.selected).length])

    const loadProductos = async () => {
        try {
            setLoading(true)
            let data: Producto[]
            
            if (isSuperAdmin && empresaId) {
                data = await apiProductosService.getProductosByEmpresa(empresaId)
            } else if (isSuperAdmin) {
                data = await apiProductosService.getAllProductos()
            } else {
                const userEmpresaId = empresaId || 0
                data = await apiProductosService.getProductosByEmpresa(userEmpresaId)
            }
            
            // Filtrar solo productos activos
            const productosActivos = data.filter(p => p.estado)
            
            // Convertir a ProductoConDatos y aplicar valores iniciales
            const productosConDatos: ProductoConDatos[] = productosActivos.map(p => {
                const productoInicial = initialProductos.find(ip => ip.producto_id === p.id)
                return {
                    ...p,
                    // Si existe en initialProductos, usar ese precio, si no, usar 0 por defecto
                    precioEspecifico: productoInicial?.precio_venta_especifico ?? 0,
                    selected: !!productoInicial
                }
            })
            
            setProductos(productosConDatos)
            setFilteredProductos(productosConDatos)
        } catch (error) {
            console.error('Error loading productos:', error)
            toast.error('Error al cargar productos')
        } finally {
            setLoading(false)
        }
    }

    const toggleProducto = (id: number) => {
        setProductos(prev =>
            prev.map(p =>
                p.id === id ? { ...p, selected: !p.selected } : p
            )
        )
    }

    const updatePrecio = (id: number, precio: number) => {
        setProductos(prev =>
            prev.map(p =>
                p.id === id ? { ...p, precioEspecifico: precio } : p
            )
        )
    }

    const usePrecioBase = (id: number) => {
        setProductos(prev =>
            prev.map(p =>
                p.id === id ? { ...p, precioEspecifico: p.precio_venta ?? 0 } : p
            )
        )
    }

    const handleConfirm = () => {
        const productosSeleccionados = productos.filter(p => p.selected)
        
        if (productosSeleccionados.length === 0) {
            toast.error('Debe seleccionar al menos un producto')
            return
        }

        const productosConPrecio: ProductoConPrecio[] = productosSeleccionados.map(p => ({
            producto_id: p.id,
            precio_venta_especifico: p.precioEspecifico
        }))

        onConfirm(productosConPrecio)
        onClose()
    }

    const handleCancel = () => {
        setSearchTerm('')
        setPorcentajeAjuste('0')
        onClose()
    }

    const productosSeleccionados = productos.filter(p => p.selected)

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent 
                resizable={true}
                minWidth={600}
                minHeight={400}
                maxWidth={window.innerWidth * 0.95}
                maxHeight={window.innerHeight * 0.95}
                defaultWidth={1000}
                defaultHeight={700}
                className="sm:max-w-5xl"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Seleccionar productos y asignar precios
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona los productos y define sus precios específicos para esta lista.
                        {productosSeleccionados.length > 0 && (
                            <span className="ml-2 font-semibold text-primary">
                                ({productosSeleccionados.length} seleccionado{productosSeleccionados.length !== 1 ? 's' : ''})
                            </span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                {/* Barra de búsqueda */}
                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre, código, marca o categoría..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                            onClick={() => setSearchTerm('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Controles de ajuste porcentual */}
                <div className="rounded-lg border p-4 bg-primary/10 border-primary my-4">
                    <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Label className="flex items-center gap-2 text-sm font-semibold">
                            <Percent className="h-4 w-4" />
                            Ajuste porcentual global (sobre productos seleccionados)
                        </Label>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-medium animate-pulse">
                                ● Actualización automática
                            </span>
                        </div>
                    </div>
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
                                placeholder="Ej: 10 (por defecto 0%)"
                                value={porcentajeAjuste}
                                onChange={e => setPorcentajeAjuste(e.target.value)}
                                className="pr-8 border-primary"
                                min="0"
                                step="0.01"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                %
                            </span>
                        </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        💡 Los precios se actualizan automáticamente al cambiar el porcentaje o tipo de ajuste
                    </p>
                </div>

                {/* Lista de productos */}
                <ScrollArea className="h-[400px] rounded-md border">
                    {loading ? (
                        <div className="space-y-2 p-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full" />
                            ))}
                        </div>
                    ) : filteredProductos.length === 0 ? (
                        <div className="flex h-40 items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <Package className="mx-auto h-12 w-12 opacity-20" />
                                <p className="mt-2">No se encontraron productos</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {filteredProductos.map(producto => (
                                <div
                                    key={producto.id}
                                    className={cn(
                                        'flex items-center gap-4 rounded-lg border p-3 transition-colors',
                                        producto.selected
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted/50'
                                    )}
                                >
                                    <Checkbox
                                        checked={producto.selected}
                                        onCheckedChange={() => toggleProducto(producto.id)}
                                    />
                                    
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-medium">{producto.nombre}</div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>Código: {producto.codigo}</span>
                                                    {producto.marca && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{producto.marca.nombre}</span>
                                                        </>
                                                    )}
                                                    {producto.categoria && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{producto.categoria.nombre}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="whitespace-nowrap">
                                                Base: {formatCurrency(producto.precio_venta ?? 0)}
                                            </Badge>
                                        </div>
                                        
                                        {producto.selected && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                <Label className="text-sm font-medium">Precio en lista:</Label>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <div className="relative flex-1">
                                                        <DollarSign className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            value={producto.precioEspecifico}
                                                            onChange={e =>
                                                                updatePrecio(producto.id, parseFloat(e.target.value) || 0)
                                                            }
                                                            className="pl-8"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => usePrecioBase(producto.id)}
                                                        className="whitespace-nowrap w-full sm:w-auto"
                                                    >
                                                        Usar precio base
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="flex items-center justify-between sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {productosSeleccionados.length > 0 ? (
                            <span>
                                {productosSeleccionados.length} producto{productosSeleccionados.length !== 1 ? 's' : ''}{' '}
                                seleccionado{productosSeleccionados.length !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <span>No hay productos seleccionados</span>
                        )}
                    </div>
                    <div className="flex gap-2 my-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleConfirm}
                            disabled={productosSeleccionados.length === 0}
                        >
                            Confirmar ({productosSeleccionados.length})
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
