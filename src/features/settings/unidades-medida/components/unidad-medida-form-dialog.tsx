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
import { Checkbox } from '@/components/ui/checkbox'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'

const formSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  abreviatura: z.string().min(1, 'La abreviatura es requerida'),
  aceptaDecimales: z.boolean(),
  empresa_id: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface UnidadMedida {
  id?: number
  nombre: string
  abreviatura: string
  aceptaDecimales: boolean
  empresa_id?: number
}

interface Empresa {
  id: number
  name: string
}

interface UnidadMedidaFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  unidadMedida?: UnidadMedida | null
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
}

export function UnidadMedidaFormDialog({
  open,
  onOpenChange,
  unidadMedida,
  onSubmit,
  isLoading = false,
}: UnidadMedidaFormDialogProps) {
  const { isSuperAdmin } = usePermissions()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: '',
      abreviatura: '',
      aceptaDecimales: false,
      empresa_id: undefined,
    },
  })

  // Cargar empresas solo si es superadmin
  useEffect(() => {
    if (isSuperAdmin && open) {
      const loadEmpresas = async () => {
        try {
          const empresasData = await apiUnidadesMedida.getEmpresas()
          setEmpresas(empresasData)
        } catch (error) {
          console.error('Error loading empresas:', error)
        }
      }
      loadEmpresas()
    }
  }, [isSuperAdmin, open])

  useEffect(() => {
    if (unidadMedida) {
      form.reset({
        nombre: unidadMedida.nombre,
        abreviatura: unidadMedida.abreviatura,
        aceptaDecimales: unidadMedida.aceptaDecimales,
        empresa_id: unidadMedida.empresa_id,
      })
    } else {
      form.reset({
        nombre: '',
        abreviatura: '',
        aceptaDecimales: false,
        empresa_id: undefined,
      })
    }
  }, [unidadMedida, form])

  const handleSubmit = (data: FormValues) => {
    onSubmit(data)
    form.reset()
  }

  const handleClose = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {unidadMedida ? 'Editar' : 'Crear'} Unidad de Medida
          </DialogTitle>
          <DialogDescription>
            {unidadMedida
              ? 'Modifica los datos de la unidad de medida.'
              : 'Agrega una nueva unidad de medida al sistema.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. Kilogramo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="abreviatura"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abreviatura</FormLabel>
                  <FormControl>
                    <Input placeholder="ej. Kg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aceptaDecimales"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Acepta decimales
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="empresa_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      value={field.value?.toString() || ''}
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
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : unidadMedida ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}