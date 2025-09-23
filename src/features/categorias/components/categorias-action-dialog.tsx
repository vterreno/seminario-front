import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Categoria, CategoriaForm, CategoriaFormSchema } from '../data/schema'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Empresa } from '@/features/empresa/data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'
import apiCategoriasService from '@/service/apiCategorias.service'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Switch } from '@/components/ui/switch'

type CategoriasActionDialogProps = {
  currentRow?: Categoria
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CategoriasActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: CategoriasActionDialogProps) {
  const isEdit = !!currentRow
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener datos del usuario desde localStorage
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
  const userEmpresaId = userData?.empresa?.id
  const isSuperAdmin = !userEmpresaId // Si el usuario no tiene empresa_id, es superadmin

  const form = useForm<CategoriaForm>({
    resolver: zodResolver(CategoriaFormSchema) as any,
    defaultValues: isEdit && currentRow
      ? {
          nombre: currentRow.nombre,
          descripcion: currentRow.descripcion,
          estado: currentRow.estado,
          empresa_id: currentRow.empresa_id,
          isEdit,
        }
      : {
          nombre: '',
          descripcion: '',
          estado: true,
          empresa_id: userEmpresaId || undefined,
          isEdit,
        },
  })

  // Cargar empresas si es superadmin
  useEffect(() => {
    if (isSuperAdmin && open) {
      fetchCategorias()
      fetchEmpresas()
    }
  }, [isSuperAdmin, open])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      const data = await apiCategoriasService.getAllCategorias()
      setCategorias(data.filter((categoria: Categoria) => categoria.estado))
    } catch (error) {
      console.error('Error fetching categorias:', error)
      toast.error('Error al cargar las categorias')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const data = await apiEmpresaService.getAllEmpresas()
      setEmpresas(data.filter((empresa: Empresa) => empresa.estado))
    } catch (error) {
      console.error('Error fetching empresas:', error)
      toast.error('Error al cargar las empresas')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values: CategoriaForm) => {
    try {
      // Asegurarnos de que haya un empresa_id válido
      const dataToSend = isSuperAdmin
        ? values as CategoriaForm
        : { 
            ...values, 
            empresa_id: values.empresa_id || userEmpresaId
      };
      console.log(dataToSend.empresa_id)

      if (isEdit && currentRow?.id) {
        await apiCategoriasService.updateCategoria(currentRow.id, dataToSend)
        toast.success('Categoría actualizada exitosamente')
      } else {
        await apiCategoriasService.createCategoria(dataToSend)
        toast.success('Categoría creada exitosamente')
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      form.reset()
      toast.error(error.message || 'Error al guardar la categoría')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar categoría' : 'Crear nueva categoría'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la categoría.'
              : 'Completa los siguientes campos para crear una nueva categoría.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form id='categoria-form' onSubmit={form.handleSubmit(onSubmit as any)} className='space-y-6 my-4'>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name='nombre'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la categoría</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder='Ingrese el nombre de la categoría' 
                          {...field} 
                          autoComplete='off'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='descripcion'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='Ingrese una descripción para la categoría' 
                          {...field} 
                          className='resize-none'
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isSuperAdmin && (
                  <FormField
                    control={form.control}
                    name='empresa_id'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            disabled={isEdit}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {empresas.map((empresa) => (
                                <SelectItem key={empresa.id} value={empresa.id?.toString() || ''}>
                                  {empresa.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

              <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Estado activo</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      La categoria estará {field.value ? 'activa' : 'inactiva'} en el sistema
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
                
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            type='submit'
            form='categoria-form'
            onClick={form.handleSubmit(onSubmit as any)}
          >
            {isEdit ? 'Actualizar' : 'Crear'} categoría
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
