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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X, Package, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import apiProductosService from '@/service/apiProductos.service'
import type { Producto } from '@/features/productos/data/schema'
import { formatCurrency } from './format-money'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ProductSelectorDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (selectedIds: number[]) => void
    initialSelectedIds?: number[]
    empresaId?: number
    isSuperAdmin?: boolean
}

export function ProductSelectorDialog({
    isOpen,
    onClose,
    onConfirm,
    initialSelectedIds = [],
    empresaId,
    isSuperAdmin = false
}: ProductSelectorDialogProps) {
    const [productos, setProductos] = useState<Producto[]>([])
    const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds)
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12)

    useEffect(() => {
        if (isOpen) {
            loadProductos()
            setSelectedIds(initialSelectedIds)
            setCurrentPage(1) // Reset a primera página al abrir
        }
    }, [isOpen, initialSelectedIds])

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
        setCurrentPage(1) // Reset a primera página al filtrar
    }, [searchTerm, productos])

    // Calcular productos paginados
    const totalPages = Math.ceil(filteredProductos.length / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProductos = filteredProductos.slice(startIndex, endIndex)

    const loadProductos = async () => {
        try {
            setLoading(true)
            let data: Producto[]
            if (isSuperAdmin && empresaId) {
                data = await apiProductosService.getProductosByEmpresa(empresaId)
            } else if (isSuperAdmin) {
                data = await apiProductosService.getAllProductos()
            } else {
                // El usuario tiene empresa, cargar solo productos de su empresa
                const userEmpresaId = empresaId || 0
                data = await apiProductosService.getProductosByEmpresa(userEmpresaId)
            }
            // Filtrar solo productos activos
            const productosActivos = data.filter(p => p.estado)
            setProductos(productosActivos)
            setFilteredProductos(productosActivos)
        } catch (error) {
            console.error('Error loading productos:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleProducto = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const toggleAll = () => {
        // Seleccionar todos los productos filtrados (no solo los de la página actual)
        if (selectedIds.length === filteredProductos.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredProductos.map(p => p.id))
        }
    }

    const handleConfirm = () => {
        onConfirm(selectedIds)
        onClose()
    }

    const handleCancel = () => {
        setSelectedIds(initialSelectedIds)
        setSearchTerm('')
        setCurrentPage(1)
        onClose()
    }
    
    const handlePageSizeChange = (newSize: string) => {
        setPageSize(Number(newSize))
        setCurrentPage(1) // Reset a primera página al cambiar tamaño
    }
    
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }

    const allSelected = filteredProductos.length > 0 && selectedIds.length === filteredProductos.length

    return (
        <Dialog open={isOpen} onOpenChange={handleCancel}>
            <DialogContent 
                resizable={true}
                minWidth={600}
                minHeight={400}
                maxWidth={window.innerWidth * 0.95}
                maxHeight={window.innerHeight * 0.95}
                defaultWidth={1200}
                defaultHeight={800}
                className="flex flex-col p-0"
            >
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="text-xl">Seleccionar Productos</DialogTitle>
                    <DialogDescription>
                        Haz clic en los productos que deseas incluir en esta lista de precios
                    </DialogDescription>
                </DialogHeader>

                {/* Barra de búsqueda y acciones */}
                <div className="px-6 py-3 border-b space-y-3 shrink-0">
                    <div className="flex gap-3 items-center flex-wrap">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre, código, marca o categoría..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-10"
                            />
                            {searchTerm && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                                    onClick={() => setSearchTerm('')}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                Mostrar:
                            </span>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={handlePageSizeChange}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6</SelectItem>
                                    <SelectItem value="12">12</SelectItem>
                                    <SelectItem value="24">24</SelectItem>
                                    <SelectItem value="48">48</SelectItem>
                                    <SelectItem value="96">96</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleAll}
                            className="shrink-0"
                        >
                            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                        <span className="text-muted-foreground">
                            <strong>{selectedIds.length}</strong> de <strong>{filteredProductos.length}</strong> productos seleccionados
                        </span>
                        {selectedIds.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedIds([])}
                            >
                                Limpiar selección
                            </Button>
                        )}
                    </div>
                </div>

                {/* Grid de productos */}
                <ScrollArea className="flex-1 px-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 py-4">
                            {[...Array(pageSize)].map((_, i) => (
                                <div key={i} className="p-4 border rounded-lg">
                                    <Skeleton className="h-5 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-1/2 mb-3" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            ))}
                        </div>
                    ) : filteredProductos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">No se encontraron productos</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay productos disponibles'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 py-4">
                            {paginatedProductos.map((producto) => {
                                const isSelected = selectedIds.includes(producto.id)
                                return (
                                    <div
                                        key={producto.id}
                                        onClick={() => toggleProducto(producto.id)}
                                        className={cn(
                                            'relative p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md',
                                            isSelected 
                                                ? 'border-primary bg-primary/5' 
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        {/* Checkbox en esquina superior derecha */}
                                        <div className="absolute top-3 right-3">
                                            <Checkbox
                                                checked={isSelected}
                                                className={cn(
                                                    "h-5 w-5",
                                                    isSelected && "data-[state=checked]:bg-primary"
                                                )}
                                                onClick={(e) => e.stopPropagation()}
                                                onCheckedChange={() => toggleProducto(producto.id)}
                                            />
                                        </div>

                                        {/* Contenido del producto */}
                                        <div className="pr-8 space-y-2">
                                            <div>
                                                <h4 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
                                                    {producto.nombre}
                                                </h4>
                                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                                    {producto.codigo}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Badge variant="secondary" className="text-base font-semibold">
                                                    ${formatCurrency(producto.precio_venta)}
                                                </Badge>
                                                {producto.stock !== undefined && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className={cn(
                                                            "text-xs",
                                                            producto.stock > 0 
                                                                ? "border-green-500 text-green-700 dark:text-green-400" 
                                                                : "border-red-500 text-red-700 dark:text-red-400"
                                                        )}
                                                    >
                                                        Stock: {producto.stock}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-1.5">
                                                {producto.marca && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {producto.marca.nombre}
                                                    </Badge>
                                                )}
                                                {producto.categoria && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {producto.categoria.nombre}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>

                {/* Paginación */}
                {!loading && filteredProductos.length > 0 && (
                    <div className="px-6 py-3 border-t shrink-0">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm text-muted-foreground">
                                Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(endIndex, filteredProductos.length)}</strong> de <strong>{filteredProductos.length}</strong> productos
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm px-2">
                                    Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer con botones */}
                <div className="px-6 py-4 border-t flex flex-col-reverse sm:flex-row gap-2 sm:justify-end shrink-0">
                    <Button variant="outline" onClick={handleCancel} className="sm:w-auto">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedIds.length === 0} className="sm:w-auto">
                        Confirmar ({selectedIds.length})
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
