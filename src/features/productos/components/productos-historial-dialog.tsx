import { useEffect, useState, useMemo } from 'react'
import { format, startOfDay, endOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
    Loader2, 
    Settings, 
    Search, 
    Filter, 
    Calendar,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    TrendingUp,
    TrendingDown
} from 'lucide-react'
import { 
    Producto, 
    MovimientoStock,
    formatTipoMovimiento,
    formatCantidadMovimiento,
    getMovimientoStockColor
} from '../data/schema'
import { useProductos } from './productos-provider'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from 'sonner'
import apiMovimientoStockService from '@/service/apiMovimientoStock.service'

type ProductosHistorialDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Producto | null
}

export function ProductosHistorialDialog({ 
    open, 
    onOpenChange, 
    currentRow 
}: ProductosHistorialDialogProps) {
    const [movimientos, setMovimientos] = useState<MovimientoStock[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTipo, setSelectedTipo] = useState<string>('all')
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')
    const [sortBy, setSortBy] = useState<'fecha' | 'cantidad' | 'tipo'>('fecha')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(10)
    
    const { setOpen } = useProductos()
    const { hasPermission } = usePermissions()

    const canAdjustStock = hasPermission('producto_modificar')

    // Lógica de filtrado y paginación
    const filteredAndSortedMovimientos = useMemo(() => {
        let filtered = [...movimientos]

        // Filtro por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(mov => 
                mov.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        // Filtro por tipo
        if (selectedTipo !== 'all') {
            filtered = filtered.filter(mov => mov.tipo_movimiento === selectedTipo)
        }

        // Filtro por fecha
        if (dateFrom) {
            const fromDate = startOfDay(new Date(dateFrom))
            filtered = filtered.filter(mov => new Date(mov.fecha || mov.created_at) >= fromDate)
        }
        
        if (dateTo) {
            const toDate = endOfDay(new Date(dateTo))
            filtered = filtered.filter(mov => new Date(mov.fecha || mov.created_at) <= toDate)
        }

        // Ordenamiento
        filtered.sort((a, b) => {
            let valueA: any, valueB: any
            
            switch (sortBy) {
                case 'fecha':
                    valueA = new Date(a.fecha || a.created_at)
                    valueB = new Date(b.fecha || b.created_at)
                    break
                case 'cantidad':
                    valueA = Math.abs(a.cantidad)
                    valueB = Math.abs(b.cantidad)
                    break
                case 'tipo':
                    valueA = a.tipo_movimiento
                    valueB = b.tipo_movimiento
                    break
                default:
                    return 0
            }

            if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
            if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
            return 0
        })

        return filtered
    }, [movimientos, searchTerm, selectedTipo, dateFrom, dateTo, sortBy, sortOrder])

    // Cálculo de estadísticas
    const estadisticas = useMemo(() => {
        const totalMovimientos = movimientos.length
        const aumentos = movimientos.filter(m => m.cantidad > 0).length
        const disminuciones = movimientos.filter(m => m.cantidad < 0).length
        const totalAumentado = movimientos
            .filter(m => m.cantidad > 0)
            .reduce((sum, m) => sum + m.cantidad, 0)
        const totalDisminuido = movimientos
            .filter(m => m.cantidad < 0)
            .reduce((sum, m) => sum + Math.abs(m.cantidad), 0)

        return {
            totalMovimientos,
            aumentos,
            disminuciones,
            totalAumentado,
            totalDisminuido
        }
    }, [movimientos])

    // Paginación
    const totalPages = Math.ceil(filteredAndSortedMovimientos.length / itemsPerPage)
    const paginatedMovimientos = filteredAndSortedMovimientos.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    useEffect(() => {
        if (open && currentRow) {
            fetchMovimientos()
            // Reset filters when opening
            setSearchTerm('')
            setSelectedTipo('all')
            setDateFrom('')
            setDateTo('')
            setSortBy('fecha')
            setSortOrder('desc')
            setCurrentPage(1)
        }
    }, [open, currentRow])

    const fetchMovimientos = async () => {
        if (!currentRow) return

        setLoading(true)
        try {
            const data = await apiMovimientoStockService.obtenerMovimientos(currentRow.id)
            setMovimientos(data)
        } catch (error) {
            toast.error('Error al cargar el historial de movimientos')
        } finally {
            setLoading(false)
        }
    }

    const handleAjustarStock = () => {
        setOpen('ajuste')
    }

    const handleSort = (column: 'fecha' | 'cantidad' | 'tipo') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('desc')
        }
        setCurrentPage(1)
    }

    const handleClose = () => {
        onOpenChange(false)
        setMovimientos([])
    }

    if (!currentRow) return null

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                        Historial de movimientos: {currentRow.nombre}
                    </DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Código: {currentRow.codigo}</span>
                        <span>Stock actual: <strong className="text-foreground">{currentRow.stock}</strong></span>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col space-y-4">
                    {/* Estadísticas resumidas */}
                    {!loading && movimientos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-shrink-0">
                            <Card className="p-3">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-blue-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                            <p className="text-lg font-semibold">{estadisticas.totalMovimientos}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-3">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Aumentos</p>
                                            <p className="text-lg font-semibold text-green-600">{estadisticas.aumentos}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-3">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Disminuciones</p>
                                            <p className="text-lg font-semibold text-red-600">{estadisticas.disminuciones}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-3">
                                <CardContent className="p-0">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total ingresado</p>
                                        <p className="text-lg font-semibold text-green-600">+{estadisticas.totalAumentado}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="p-3">
                                <CardContent className="p-0">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total salido</p>
                                        <p className="text-lg font-semibold text-red-600">-{estadisticas.totalDisminuido}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Controles de filtro */}
                    {!loading && movimientos.length > 0 && (
                        <Card className="flex-shrink-0">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filtros y búsqueda
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div>
                                        <Label htmlFor="search" className="text-xs">Buscar en descripción</Label>
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="search"
                                                placeholder="Buscar..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8 h-9"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Tipo de movimiento</Label>
                                        <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los tipos</SelectItem>
                                                <SelectItem value="STOCK_APERTURA">Stock de apertura</SelectItem>
                                                <SelectItem value="VENTA">Ventas</SelectItem>
                                                <SelectItem value="COMPRA">Compras</SelectItem>
                                                <SelectItem value="AJUSTE_MANUAL">Ajustes manuales</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="dateFrom" className="text-xs">Fecha desde</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="dateFrom"
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="pl-8 h-9"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="dateTo" className="text-xs">Fecha hasta</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="dateTo"
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="pl-8 h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {(searchTerm || selectedTipo !== 'all' || dateFrom || dateTo) && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Mostrando {filteredAndSortedMovimientos.length} de {movimientos.length} movimientos</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSearchTerm('')
                                                setSelectedTipo('all')
                                                setDateFrom('')
                                                setDateTo('')
                                                setCurrentPage(1)
                                            }}
                                        >
                                            Limpiar filtros
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Botón de ajuste */}
                    {canAdjustStock && !loading && (
                        <div className="flex-shrink-0">
                            <Button 
                                onClick={handleAjustarStock}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                            >
                                <Settings className="h-4 w-4" />
                                Realizar ajuste de stock
                            </Button>
                        </div>
                    )}

                    {/* Tabla de movimientos */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                <span>Cargando movimientos...</span>
                            </div>
                        ) : filteredAndSortedMovimientos.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                {movimientos.length === 0 
                                    ? "No se encontraron movimientos para este producto"
                                    : "No se encontraron movimientos con los filtros aplicados"
                                }
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-background">
                                            <TableRow>
                                                <TableHead className="w-[140px]">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSort('fecha')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Fecha y hora
                                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="w-[120px]">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSort('tipo')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent"
                                                    >
                                                        Tipo
                                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="min-w-[200px]">Descripción</TableHead>
                                                <TableHead className="w-[100px] text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleSort('cantidad')}
                                                        className="h-auto p-0 font-semibold hover:bg-transparent ml-auto"
                                                    >
                                                        Cantidad
                                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="w-[120px] text-right">Stock resultante</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedMovimientos.map((movimiento) => (
                                                <TableRow key={movimiento.id}>
                                                    <TableCell className="font-mono text-sm">
                                                        {format(new Date(movimiento.fecha || movimiento.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="outline" 
                                                            className={`text-xs ${getMovimientoStockColor(movimiento.tipo_movimiento)}`}
                                                        >
                                                            {formatTipoMovimiento(movimiento.tipo_movimiento)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[250px]">
                                                        <div className="truncate" title={movimiento.descripcion}>
                                                            {movimiento.descripcion}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        <span className={`${movimiento.cantidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {formatCantidadMovimiento(movimiento.cantidad)}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {movimiento.stock_resultante.toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Paginación */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-4 border-t flex-shrink-0">
                                        <div className="text-sm text-muted-foreground">
                                            Página {currentPage} de {totalPages} ({filteredAndSortedMovimientos.length} movimientos)
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Anterior
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Siguiente
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-2 pt-4 flex-shrink-0">
                    <Button variant="outline" onClick={handleClose}>
                        Cerrar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
