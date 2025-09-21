import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { 
    Producto, 
    ProductoForm, 
    ProductoFormSuperAdmin, 
    productoFormSchema, 
    productoFormSuperAdminSchema 
} from '../data/schema'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import apiEmpresaService, { type Empresa } from '@/service/apiEmpresa.service'
import apiProductosService from '@/service/apiProductos.service'
import apiMarcasService from '@/service/apiMarcas.service'
import { type Marca } from '@/features/marcas/data/schema'

interface UserData {
    id: number
    nombre: string
    apellido: string
    email: string
    role: {
        id: number
        nombre: string
        permisos?: {
        [key: string]: boolean
        }
    }
    empresa?: {
        id: number
        name: string
    } | null
}

type ProductosActionDialogProps = {
    currentRow?: Producto
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function ProductosActionDialog({
    currentRow,
    open,
    onOpenChange,
    onSuccess,
}: ProductosActionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const [marcas, setMarcas] = useState<Marca[]>([])
    const isEdit = !!currentRow

    // Detectar si el usuario es superadmin
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    const userEmpresaId = userData?.empresa?.id
    const isSuperAdmin = !userEmpresaId

    // Usar diferentes schemas según el tipo de usuario
    const formSchema = isSuperAdmin ? productoFormSuperAdminSchema : productoFormSchema

    const form = useForm<ProductoForm | ProductoFormSuperAdmin>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit && currentRow
        ? {
            codigo: currentRow.codigo,
            nombre: currentRow.nombre,
            marca_id: currentRow.marca_id,
            categoria_id: currentRow.categoria_id,
            unidad_medida_id: currentRow.unidad_medida_id,
            precio_costo: currentRow.precio_costo,
            precio_venta: currentRow.precio_venta,
            stock_apertura: currentRow.stock_apertura,
            stock: currentRow.stock,
            ...(isSuperAdmin && { empresa_id: currentRow.empresa_id }),
            estado: currentRow.estado,
            }
        : {
            codigo: '',
            nombre: '',
            marca_id: undefined,
            categoria_id: undefined,
            unidad_medida_id: undefined,
            precio_costo: 0,
            precio_venta: 0,
            stock_apertura: 0,
            stock: 0,
            ...(isSuperAdmin && { empresa_id: undefined }),
            estado: true,
            },
    })

    // Cargar empresas si es superadmin y marcas
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    // Cargar empresas solo si es superadmin
                    if (isSuperAdmin) {
                        const empresasResponse = await apiEmpresaService.getAllEmpresas()
                        setEmpresas(empresasResponse)
                    }
                    
                    // Cargar marcas siempre
                    const marcasResponse = await apiMarcasService.getAllMarcas()
                    setMarcas(marcasResponse)
                } catch (error) {
                    toast.error('Error al cargar los datos')
                }
            }
            fetchData()
        }
    }, [isSuperAdmin, open])

    const onSubmit = async (_values: ProductoForm | ProductoFormSuperAdmin) => {
        try {
        setLoading(true)
        
        // Para usuarios regulares, agregar empresa_id automáticamente
        let finalValues = isSuperAdmin 
            ? _values as ProductoFormSuperAdmin
            : { ..._values as ProductoForm, empresa_id: userEmpresaId! }

        // Si es creación, establecer el stock actual igual al stock inicial
        if (!isEdit) {
            finalValues = {
                ...finalValues,
                stock: finalValues.stock_apertura
            }
        } else {
            // Si es edición, remover campos que no deben modificarse
            const { stock, codigo, ...editValues } = finalValues
            finalValues = editValues as typeof finalValues
        }

        if (isEdit && currentRow) {
            await apiProductosService.updateProducto(currentRow.id, finalValues)
            toast.success('Producto actualizado exitosamente')
        } else {
            await apiProductosService.createProducto(finalValues)
            toast.success('Producto creado exitosamente')
        }
        
        onOpenChange(false)
        onSuccess?.()
        form.reset()

        } catch (error: any) {
            form.reset()
            toast.error(error.message || `Error al ${isEdit ? 'actualizar' : 'crear'} el producto`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
            resizable={true}
            minWidth={400}
            minHeight={300}
            maxWidth={window.innerWidth * 0.9}
            maxHeight={window.innerHeight * 0.9}
            defaultWidth={650}
            defaultHeight={650}
            className='sm:max-w-2xl'
        >
            <DialogHeader>
            <DialogTitle>
                {isEdit ? 'Editar producto' : 'Agregar producto'}
            </DialogTitle>
            <DialogDescription>
                {isEdit ? 'Modifica los datos del producto seleccionado.' : 'Completa los datos para crear un nuevo producto.'}
            </DialogDescription>
            </DialogHeader>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Código *</FormLabel>
                        <FormControl>
                            <Input
                            placeholder="Ej: PROD001"
                            {...field}
                            disabled={loading || isEdit}
                            />
                        </FormControl>
                        <FormMessage />
                        {isEdit && (
                            <div className="text-sm text-muted-foreground">
                                El código no puede ser modificado después de la creación
                            </div>
                        )}
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre *</FormLabel>
                        <FormControl>
                            <Input
                            placeholder="Nombre del producto"
                            {...field}
                            disabled={loading}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="marca_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))} 
                            value={field.value?.toString() || "null"}
                            disabled={loading}
                        >
                            <FormControl>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Selecciona una marca" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="null">Sin marca</SelectItem>
                            {marcas
                                .filter((marca) => marca.id != null && marca.estado)
                                .map((marca) => (
                                    <SelectItem key={marca.id} value={marca.id!.toString()}>
                                        {marca.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="categoria_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))} 
                            value={field.value?.toString() || "null"}
                            disabled={loading}
                        >
                            <FormControl>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="null">Sin categoría</SelectItem>
                            {/* TODO: Agregar categorías cuando esté implementado en el backend */}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="unidad_medida_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Unidad de Medida</FormLabel>
                        <Select 
                            onValueChange={(value) => field.onChange(value === "null" ? null : Number(value))} 
                            value={field.value?.toString() || "null"}
                            disabled={loading}
                        >
                            <FormControl>
                            <SelectTrigger className='w-full'>
                                <SelectValue placeholder="Selecciona una unidad" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="null">Sin unidad</SelectItem>
                            {/* TODO: Agregar unidades de medida cuando esté implementado en el backend */}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    {/* Campo de selección de empresa solo para superadmin */}
                    {isSuperAdmin && (
                        <FormField
                        control={form.control}
                        name="empresa_id"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Empresa *</FormLabel>
                            <Select 
                                onValueChange={(value) => field.onChange(Number(value))} 
                                value={field.value?.toString()}
                                disabled={loading}
                            >
                                <FormControl>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder="Selecciona una empresa" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {empresas
                                    .filter((empresa) => empresa.id != null)
                                    .map((empresa) => (
                                        <SelectItem key={empresa.id!} value={empresa.id!.toString()}>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="precio_costo"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio de Costo *</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={loading}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="precio_venta"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Precio de Venta *</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            disabled={loading}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>

                {/* Mostrar diferentes campos según si es crear o editar */}
                {!isEdit ? (
                    // Campo de stock inicial solo al crear
                    <FormField
                    control={form.control}
                    name="stock_apertura"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Stock Inicial *</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={loading}
                            />
                        </FormControl>
                        <FormMessage />
                        <div className="text-sm text-muted-foreground">
                            Este será el stock inicial del producto. Una vez creado, solo podrás modificar el stock actual.
                        </div>
                        </FormItem>
                    )}
                    />
                ) : (
                    // Campo de stock actual solo al editar - SOLO LECTURA
                    <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Stock Actual</FormLabel>
                        <FormControl>
                            <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            disabled={true}
                            className="bg-muted"
                            />
                        </FormControl>
                        <FormMessage />
                        <div className="text-sm text-muted-foreground">
                            Stock inicial: {currentRow?.stock_apertura || 0} unidades
                        </div>
                        <div className="text-sm text-amber-600">
                            El stock no puede ser modificado desde aquí. Utiliza los movimientos de inventario.
                        </div>
                        </FormItem>
                    )}
                    />
                )}

                <FormField
                control={form.control}
                name="estado"
                render={({ field }) => {
                    const handleStateChange = (checked: boolean) => {
                        // Si intenta desactivar y tiene stock > 0
                        if (!checked && isEdit && currentRow && currentRow.stock > 0) {
                            toast.error('No se puede inactivar un producto con stock mayor a cero. Primero debe ajustar el stock a cero mediante movimientos de inventario.');
                            return;
                        }
                        field.onChange(checked);
                    };

                    return (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Estado</FormLabel>
                            <div className="text-sm text-muted-foreground">
                            El producto estará {field.value ? 'activo' : 'inactivo'}
                            </div>
                            {isEdit && currentRow && currentRow.stock > 0 && (
                                <div className="text-sm text-amber-600">
                                    Stock actual: {currentRow.stock} unidades. No se puede inactivar mientras tenga stock.
                                </div>
                            )}
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={handleStateChange}
                            disabled={loading}
                            />
                        </FormControl>
                        </FormItem>
                    )
                }}
                />

                <div className="flex justify-end space-x-2 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
                </Button>
                </div>
            </form>
            </Form>
        </DialogContent>
        </Dialog>
    )
}
