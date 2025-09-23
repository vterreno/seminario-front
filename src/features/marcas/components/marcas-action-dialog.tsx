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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { 
    Marca, 
    MarcaForm, 
    MarcaFormSuperAdmin, 
    marcaFormSchema, 
    marcaFormSuperAdminSchema 
} from '../data/schema'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import apiMarcasService from '@/service/apiMarcas.service'
import apiEmpresaService, { type Empresa } from '@/service/apiEmpresa.service'


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

type MarcasActionDialogProps = {
    currentRow?: Marca
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function MarcasActionDialog({
    currentRow,
    open,
    onOpenChange,
    onSuccess,
}: MarcasActionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [empresas, setEmpresas] = useState<Empresa[]>([])
    const isEdit = !!currentRow

    // Detectar si el usuario es superadmin
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
    const userEmpresaId = userData?.empresa?.id
    const isSuperAdmin = !userEmpresaId

    // Usar diferentes schemas según el tipo de usuario
    const formSchema = isSuperAdmin ? marcaFormSuperAdminSchema : marcaFormSchema
    
    const form = useForm<MarcaForm | MarcaFormSuperAdmin>({
        resolver: zodResolver(formSchema),
        defaultValues: isEdit && currentRow
        ? {
            nombre: currentRow.nombre,
            descripcion: currentRow.descripcion || '',
            ...(isSuperAdmin && { empresa_id: currentRow.empresa_id }),
            estado: currentRow.estado,
            }
        : {
            nombre: '',
            descripcion: '',
            ...(isSuperAdmin && { empresa_id: undefined }),
            estado: true,
            },
    })

    // Cargar empresas si es superadmin
    useEffect(() => {
        if (isSuperAdmin && open) {
            const fetchEmpresas = async () => {
                try {
                    const response = await apiEmpresaService.getAllEmpresas()
                    setEmpresas(response)
                } catch (error) {
                    console.error('Error fetching empresas:', error)
                    toast.error('Error al cargar las empresas')
                }
            }
            fetchEmpresas()
        }
    }, [isSuperAdmin, open])

    const onSubmit = async (_values: MarcaForm | MarcaFormSuperAdmin) => {
        try {
        setLoading(true)
        
        // Para usuarios regulares, agregar empresa_id automáticamente
        const finalValues = isSuperAdmin 
            ? _values as MarcaFormSuperAdmin
            : { ..._values as MarcaForm, empresa_id: userEmpresaId! }
        
        if (isEdit && currentRow) {
            await apiMarcasService.updateMarca(currentRow.id, finalValues)
            toast.success('Marca actualizada exitosamente')
        } else {
            await apiMarcasService.createMarca(finalValues)
            toast.success('Marca creada exitosamente')
        }
        
        onOpenChange(false)
        onSuccess?.()
        form.reset()

        } catch (error: any) {
            form.reset()
            toast.error(error.message || `Error al ${isEdit ? 'actualizar' : 'crear'} la marca`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
            resizable={true}
            minWidth={300}
            minHeight={200}
            maxWidth={window.innerWidth * 0.9}
            maxHeight={window.innerHeight * 0.9}
            defaultWidth={512}
            defaultHeight={450}
            className='sm:max-w-lg'
        >
            <DialogHeader>
            <DialogTitle>
                {isEdit ? 'Editar marca' : 'Agregar marca'}
            </DialogTitle>
            </DialogHeader>

            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="Ingresa el nombre de la marca"
                        {...field}
                        disabled={loading}
                        />
                    </FormControl>
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
                        <FormLabel>Empresa</FormLabel>
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

                <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Ingresa una descripción para la marca"
                        {...field}
                        disabled={loading}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">Estado</FormLabel>
                        <div className="text-sm text-muted-foreground">
                        La marca estará {field.value ? 'activa' : 'inactiva'}
                        </div>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={loading}
                        />
                    </FormControl>
                    </FormItem>
                )}
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
