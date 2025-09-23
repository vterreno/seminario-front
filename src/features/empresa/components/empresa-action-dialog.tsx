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
import { Switch } from '@/components/ui/switch'
import { Empresa, EmpresaForm, empresaFormSchema } from '../data/schema'
import { toast } from 'sonner'
import apiEmpresaService from '@/service/apiEmpresa.service'

type EmpresaActionDialogProps = {
  currentRow?: Empresa
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EmpresaActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: EmpresaActionDialogProps) {
  const isEdit = !!currentRow
  const form = useForm<EmpresaForm>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: isEdit
      ? {
          name: currentRow.name,
          estado: currentRow.estado,
          isEdit,
        }
      : {
          name: '',
          estado: true,
          isEdit,
        },
  })

  const onSubmit = async (values: EmpresaForm) => {
    try {
      if (isEdit && currentRow?.id) {
        await apiEmpresaService.updateEmpresa(currentRow.id, {
          name: values.name,
          estado: values.estado
        })
        toast.success('Empresa actualizada exitosamente')
      } else {
        await apiEmpresaService.createEmpresa({
          name: values.name,
          estado: values.estado
        })
        toast.success('Empresa creada exitosamente')
      }
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving empresa:', error)
      toast.error(isEdit ? 'Error al actualizar la empresa' : 'Error al crear la empresa')
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
      <DialogContent
        resizable={true}
        minWidth={300}
        minHeight={200}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={512}
        defaultHeight={450}
        className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar empresa' : 'Crear nueva empresa'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la empresa.'
              : 'Completa los siguientes campos para crear una nueva empresa.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 my-3'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la empresa</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ingrese el nombre de la empresa' 
                      {...field} 
                      autoComplete='organization'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Estado activo</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      La empresa estará {field.value ? 'activa' : 'inactiva'} en el sistema
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
                {isEdit ? 'Actualizar' : 'Crear'} empresa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
