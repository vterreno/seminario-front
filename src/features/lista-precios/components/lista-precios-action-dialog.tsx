import { useEffect, useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { useListaPreciosContext } from './lista-precios-provider'
import apiListaPreciosService from '@/service/apiListaPrecios.service'
import { toast } from 'sonner'
import { listaPreciosFormUnifiedSchema } from '../data/schema'
import { AuthContext } from '@/context/auth-provider'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { ProductWithPriceSelectorDialog } from './product-with-price-selector-dialog'
import { Package, Plus, X, DollarSign } from 'lucide-react'
import type { ProductoConPrecio } from '../data/schema'

interface ListaPreciosActionDialogProps {
    mode: 'add' | 'edit'
    onSuccess?: () => void
}

export function ListaPreciosActionDialog({ mode, onSuccess }: ListaPreciosActionDialogProps) {
    const {
        selectedLista,
        isAddDialogOpen,
        isEditDialogOpen,
        setIsAddDialogOpen,
        setIsEditDialogOpen,
        isSuperAdmin,
        userEmpresaId,
    } = useListaPreciosContext()
    
    const { refreshUserData } = useContext(AuthContext)

    const [empresas, setEmpresas] = useState<Array<{ id: number; name: string }>>([])
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
    const [selectedProductos, setSelectedProductos] = useState<ProductoConPrecio[]>([])
    
    const isOpen = mode === 'add' ? isAddDialogOpen : isEditDialogOpen
    const setIsOpen = mode === 'add' ? setIsAddDialogOpen : setIsEditDialogOpen

    const form = useForm<any>({
        resolver: zodResolver(listaPreciosFormUnifiedSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            estado: true,
            empresa_id: userEmpresaId,
            productos: [],
        },
    })

    useEffect(() => {
        if (mode === 'edit' && selectedLista && isEditDialogOpen) {
            // Convertir productos de la lista al formato ProductoConPrecio
            const productosConPrecio: ProductoConPrecio[] = selectedLista.productos?.map(p => ({
                producto_id: p.id,
                precio_venta_especifico: p.precio ?? p.precio_venta ?? 0
            })) || []
            
            form.reset({
                nombre: selectedLista.nombre,
                descripcion: selectedLista.descripcion || '',
                estado: selectedLista.estado,
                empresa_id: selectedLista.empresa_id,
                productos: productosConPrecio,
            })
            setSelectedProductos(productosConPrecio)
        } else if (mode === 'add' && isAddDialogOpen) {
            form.reset({
                nombre: '',
                descripcion: '',
                estado: true,
                empresa_id: userEmpresaId,
                productos: [],
            })
            setSelectedProductos([])
        }
    }, [mode, selectedLista, isAddDialogOpen, isEditDialogOpen])

    useEffect(() => {
        if (isSuperAdmin) {
            apiEmpresaService.getAllEmpresas().then(data => {
                setEmpresas(data.map(e => ({ id: e.id!, name: e.name! })))
            })
        }
    }, [isSuperAdmin])

    const handleProductSelection = (productos: ProductoConPrecio[]) => {
        setSelectedProductos(productos)
        form.setValue('productos', productos)
    }

    const onSubmit = async (data: any) => {
        try {
            if (!isSuperAdmin) {
                delete data.empresa_id
            }
            if (mode === 'add') {
                await apiListaPreciosService.createListaPrecios(data)
                
                toast.success('Lista de precios creada exitosamente')
                
                // Refrescar los datos del usuario para obtener el nuevo permiso desde el backend
                // Esto asegura que el permiso esté disponible inmediatamente
                await refreshUserData()
            } else if (selectedLista) {
                await apiListaPreciosService.updateListaPrecios(selectedLista.id, data)
                toast.success('Lista de precios actualizada exitosamente')
            }

            setIsOpen(false)
            form.reset()
            setSelectedProductos([])
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la lista de precios')
        }
    }

    const onError = (errors: any) => {
        console.error('Form validation errors:', errors)
        toast.error('Error de validación en el formulario')
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent 
                resizable={true}
                minWidth={400}
                minHeight={300}
                maxWidth={window.innerWidth * 0.9}
                maxHeight={window.innerHeight * 0.9}
                defaultWidth={650}
                defaultHeight={600}
                className='sm:max-w-2xl'
            >
                <DialogHeader>
                    <DialogTitle>
                        {mode === 'add' ? 'Nueva lista de precios' : 'Editar lista de precios'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem className='mt-4'>
                                    <FormLabel>Nombre *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Lista Minorista" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descripción opcional..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isSuperAdmin && (
                            <FormField
                                control={form.control}
                                name="empresa_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Empresa *</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                                            value={field.value?.toString()}
                                        >
                                            <FormControl>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder="Seleccionar empresa" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {empresas.map((empresa) => (
                                                    <SelectItem key={empresa.id} value={empresa.id.toString()}>
                                                        {empresa.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Selector de Productos */}
                        <div className="space-y-2">
                            <FormLabel>Productos</FormLabel>
                            <FormDescription>
                                {isSuperAdmin && !form.watch('empresa_id') 
                                    ? 'Primero selecciona una empresa para agregar productos'
                                    : 'Selecciona los productos y define sus precios específicos para esta lista'
                                }
                            </FormDescription>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsProductSelectorOpen(true)}
                                    disabled={isSuperAdmin && !form.watch('empresa_id')}
                                    className="flex-1"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    {selectedProductos.length > 0 
                                        ? `${selectedProductos.length} producto(s) seleccionado(s)` 
                                        : 'Seleccionar productos y precios'}
                                </Button>
                                {selectedProductos.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedProductos([])
                                            form.setValue('productos', [])
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {selectedProductos.length > 0 && (
                                <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Package className="h-4 w-4" />
                                        <span>{selectedProductos.length} productos en esta lista</span>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <DollarSign className="inline h-3 w-3 mr-1" />
                                        Precios asignados. Click en "Seleccionar productos" para editar.
                                    </div>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="estado"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Estado activo</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            La lista estará disponible para usar
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit">
                                {mode === 'add' ? 'Crear' : 'Guardar'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
            
            {/* Diálogo de Selector de Productos con Precios */}
            <ProductWithPriceSelectorDialog
                isOpen={isProductSelectorOpen}
                onClose={() => setIsProductSelectorOpen(false)}
                onConfirm={handleProductSelection}
                initialProductos={selectedProductos}
                empresaId={form.watch('empresa_id')}
                isSuperAdmin={isSuperAdmin}
            />
        </Dialog>
    )
}
