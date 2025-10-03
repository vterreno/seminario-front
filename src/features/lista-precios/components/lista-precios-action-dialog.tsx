import { useEffect, useState } from 'react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { ProductSelectorDialog } from './product-selector-dialog'
import { Package, Plus, X } from 'lucide-react'

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

    const [empresas, setEmpresas] = useState<Array<{ id: number; name: string }>>([])
    const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
    const [selectedProductIds, setSelectedProductIds] = useState<number[]>([])
    
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
            form.reset({
                nombre: selectedLista.nombre,
                descripcion: selectedLista.descripcion || '',
                estado: selectedLista.estado,
                empresa_id: selectedLista.empresa_id,
                productos: selectedLista.productos?.map(p => p.id) || [],
            })
            setSelectedProductIds(selectedLista.productos?.map(p => p.id) || [])
        } else if (mode === 'add' && isAddDialogOpen) {
            form.reset({
                nombre: '',
                descripcion: '',
                estado: true,
                empresa_id: userEmpresaId,
                productos: [],
            })
            setSelectedProductIds([])
        }
    }, [mode, selectedLista, isAddDialogOpen, isEditDialogOpen])

    useEffect(() => {
        if (isSuperAdmin) {
            apiEmpresaService.getAllEmpresas().then(data => {
                setEmpresas(data.map(e => ({ id: e.id!, name: e.name! })))
            })
        }
    }, [isSuperAdmin])

    const handleProductSelection = (ids: number[]) => {
        setSelectedProductIds(ids)
        form.setValue('productos', ids)
    }

    const onSubmit = async (data: any) => {
        try {
            if (!isSuperAdmin) {
                delete data.empresa_id
            }

            // Asegurar que los productos seleccionados se incluyan
            data.productos = selectedProductIds

            if (mode === 'add') {
                await apiListaPreciosService.createListaPrecios(data)
                toast.success('Lista de precios creada exitosamente')
            } else if (selectedLista) {
                await apiListaPreciosService.updateListaPrecios(selectedLista.id, data)
                toast.success('Lista de precios actualizada exitosamente')
            }

            setIsOpen(false)
            form.reset()
            setSelectedProductIds([])
            onSuccess?.()
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar la lista de precios')
        }
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
                        {mode === 'add' ? 'Nueva Lista de Precios' : 'Editar Lista de Precios'}
                    </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
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
                                                <SelectTrigger>
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
                                    : 'Selecciona los productos que deseas incluir en esta lista'
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
                                    {selectedProductIds.length > 0 
                                        ? `${selectedProductIds.length} producto(s) seleccionado(s)` 
                                        : 'Seleccionar productos'}
                                </Button>
                                {selectedProductIds.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setSelectedProductIds([])
                                            form.setValue('productos', [])
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {selectedProductIds.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Package className="h-4 w-4" />
                                    <span>{selectedProductIds.length} productos en esta lista</span>
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="estado"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Estado Activo</FormLabel>
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
            
            {/* Diálogo de Selector de Productos */}
            <ProductSelectorDialog
                isOpen={isProductSelectorOpen}
                onClose={() => setIsProductSelectorOpen(false)}
                onConfirm={handleProductSelection}
                initialSelectedIds={selectedProductIds}
                empresaId={form.watch('empresa_id')}
                isSuperAdmin={isSuperAdmin}
            />
        </Dialog>
    )
}
