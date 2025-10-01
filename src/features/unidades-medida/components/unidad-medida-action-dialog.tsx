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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { UnidadMedida, UnidadMedidaForm, unidadMedidaFormSchema } from '../data/schema'
import { toast } from 'sonner'
import { ErrorHandler } from '@/utils/error-handler'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'
import apiEmpresa from '@/service/apiEmpresa.service'
import { useEffect, useState } from 'react'
import { usePermissions } from '@/hooks/use-permissions'

type UnidadMedidaActionDialogProps = {
  currentRow?: UnidadMedida
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UnidadMedidaActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UnidadMedidaActionDialogProps) {
  const isEdit = !!currentRow
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const { isSuperAdmin, userEmpresaId } = usePermissions()
  
  const form = useForm<UnidadMedidaForm>({
    resolver: zodResolver(unidadMedidaFormSchema),
    defaultValues: isEdit
      ? {
          nombre: currentRow.nombre,
          abreviatura: currentRow.abreviatura,
          aceptaDecimales: currentRow.aceptaDecimales ?? false,
          empresaId: currentRow.empresaId || userEmpresaId || 0,
          isEdit: true,
        }
      : {
          nombre: '',
          abreviatura: '',
          aceptaDecimales: false,
          empresaId: isSuperAdmin ? 0 : (userEmpresaId || 0),
          isEdit: false,
        },
  })

  // Cargar empresas cuando se abre el diálogo (solo para superadmin)
  useEffect(() => {
    if (open && isSuperAdmin) {
      loadEmpresas()
    }
  }, [open, isSuperAdmin])

  const loadEmpresas = async () => {
    try {
      setLoadingEmpresas(true)
      const response = await apiEmpresa.getAllEmpresas()
      setEmpresas(response)
    } catch (error) {
      console.error('Error loading empresas:', error)
      toast.error('Error al cargar las empresas')
      setEmpresas([])
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const onSubmit = async (values: UnidadMedidaForm) => {
    try {
      // Para usuarios normales, usar su empresaId automáticamente
      const finalEmpresaId = isSuperAdmin ? values.empresaId : (userEmpresaId || values.empresaId);
      
      if (isEdit && currentRow?.id) {
        await apiUnidadesMedida.updateUnidadMedidaPartial(currentRow.id, {
          nombre: values.nombre,
          abreviatura: values.abreviatura,
          aceptaDecimales: values.aceptaDecimales,
          empresaId: finalEmpresaId
        })
        toast.success('Unidad de medida actualizada exitosamente')
      } else {
        await apiUnidadesMedida.createUnidadMedida({
          nombre: values.nombre,
          abreviatura: values.abreviatura,
          aceptaDecimales: values.aceptaDecimales,
          empresaId: finalEmpresaId
        })
        toast.success('Unidad de medida creada exitosamente')
      }
      form.reset({
        nombre: '',
        abreviatura: '',
        aceptaDecimales: false,
        empresaId: isSuperAdmin ? 0 : (userEmpresaId || 0),
        isEdit: false,
      })
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving unidad de medida:', error)
      
      // Usar el manejador de errores para obtener un mensaje apropiado
      const context = isEdit ? 'actualizar la unidad de medida' : 'crear la unidad de medida'
      const errorMessage = ErrorHandler.formatErrorMessage(error, context)
      
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset({
            nombre: '',
            abreviatura: '',
            aceptaDecimales: false,
            empresaId: isSuperAdmin ? 0 : (userEmpresaId || 0),
            isEdit: false,
          })
        }
        onOpenChange(state)
      }}
    >
      <DialogContent
        resizable={true}
        minWidth={300}
        minHeight={250}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={512}
        defaultHeight={500}
        className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar unidad de medida' : 'Crear nueva unidad de medida'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la unidad de medida.'
              : 'Completa los siguientes campos para crear una nueva unidad de medida.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 my-3'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ej. Kilogramo, Metro, Litro' 
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
              name='abreviatura'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ej. kg, m, l' 
                      {...field} 
                      autoComplete='off'
                      maxLength={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSuperAdmin && (
              <FormField
                control={form.control}
                name='empresaId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value ? field.value.toString() : ''}
                      disabled={loadingEmpresas}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 px-3 py-2 w-full">
                          <SelectValue placeholder={loadingEmpresas ? "Cargando empresas..." : "Seleccione una empresa"} />
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

            <FormField
              control={form.control}
              name='aceptaDecimales'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Acepta decimales</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      {field.value
                        ? 'Permite cantidades con decimales (ej. 2,5 kg)' 
                        : 'Solo permite cantidades enteras (ej. 5 unidades)'
                      }
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

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit'>
                {isEdit ? 'Actualizar' : 'Crear'} unidad de medida
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}