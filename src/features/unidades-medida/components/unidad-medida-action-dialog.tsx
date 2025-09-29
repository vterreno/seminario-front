import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { UnidadMedida, UnidadMedidaForm, unidadMedidaFormSchema } from '../data/schema'
import { toast } from 'sonner'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'

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
  
  const getDefaultValues = (): UnidadMedidaForm => {
    if (isEdit && currentRow) {
      return {
        nombre: currentRow.nombre,
        abreviatura: currentRow.abreviatura,
        aceptaDecimales: currentRow.aceptaDecimales,
        isEdit: true,
      }
    }
    return {
      nombre: '',
      abreviatura: '',
      aceptaDecimales: false,
      isEdit: false,
    }
  }

  const form = useForm<UnidadMedidaForm>({
    resolver: zodResolver(unidadMedidaFormSchema),
    defaultValues: getDefaultValues(),
  })

  // Actualizar el formulario cuando cambie currentRow
  useEffect(() => {
    form.reset(getDefaultValues())
  }, [currentRow, open])

  const onSubmit = async (values: UnidadMedidaForm) => {
    try {
      if (isEdit && currentRow?.id) {
        await apiUnidadesMedida.update(currentRow.id, {
          nombre: values.nombre,
          abreviatura: values.abreviatura,
          aceptaDecimales: values.aceptaDecimales
        })
        toast.success('Unidad de medida actualizada exitosamente')
      } else {
        await apiUnidadesMedida.create({
          nombre: values.nombre,
          abreviatura: values.abreviatura,
          aceptaDecimales: values.aceptaDecimales
        })
        toast.success('Unidad de medida creada exitosamente')
      }
      
      // Reset del formulario con valores por defecto
      form.reset(getDefaultValues())
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving unidad de medida:', error)
      // Manejar error de empresa requerida
      if (error.message && error.message.includes('pertenecer a una empresa')) {
        toast.error('Debe pertenecer a una empresa para gestionar unidades de medida. Solo el superadministrador no puede realizar esta acción.')
      }
      // Manejar errores de unicidad
      else if (error.message && (error.message.includes('unique') || error.message.includes('ya existe'))) {
        toast.error('Ya existe una unidad de medida con ese nombre o abreviatura para esta empresa')
      }
      // Error genérico
      else {
        toast.error(isEdit ? 'Error al actualizar la unidad de medida' : 'Error al crear la unidad de medida')
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          form.reset(getDefaultValues())
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

            <FormField
              control={form.control}
              name='aceptaDecimales'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Acepta decimales</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      {field.value 
                        ? 'Permite cantidades con decimales (ej. 2.5 kg)' 
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