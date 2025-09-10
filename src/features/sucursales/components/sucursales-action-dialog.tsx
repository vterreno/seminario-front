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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sucursal, SucursalForm, sucursalFormSchema } from '../data/schema'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Empresa } from '@/features/empresa/data/schema'
import apiSucursalesService from '@/service/apiSucursales.service'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

interface UserData {
  name: string
  email: string
  empresa: {
    id: number | null
    nombre: string | null
  }
  roles: Array<{
    id: number
    nombre: string
    permissions: Array<{
      id: number
      nombre: string
      codigo: string
    }>
  }>
}

type SucursalesActionDialogProps = {
  currentRow?: Sucursal
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SucursalesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: SucursalesActionDialogProps) {
  const isEdit = !!currentRow
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener datos del usuario desde localStorage
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
  const userEmpresaId = userData?.empresa?.id
  // Verificar si el usuario es superadmin (no tiene empresa asignada)
  const isSuperAdmin = !userEmpresaId

  const form = useForm<SucursalForm>({
    resolver: zodResolver(sucursalFormSchema),
    defaultValues: isEdit && currentRow
      ? {
          nombre: currentRow.nombre,
          codigo: currentRow.codigo,
          direccion: currentRow.direccion,
          empresa_id: currentRow.empresa_id,
          estado: currentRow.estado,
          isEdit,
        }
      : {
          nombre: '',
          codigo: '',
          direccion: '',
          empresa_id: isSuperAdmin ? undefined : userEmpresaId,
          estado: true,
          isEdit,
        },
  })

  // Cargar empresas si es superadmin
  useEffect(() => {
    if (isSuperAdmin && open) {
      fetchEmpresas()
    }
  }, [isSuperAdmin, open])

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

  const onSubmit = async (values: SucursalForm) => {
    try {
      // Si no es superadmin, usar la empresa del usuario
      if (!isSuperAdmin) {
        values.empresa_id = userEmpresaId
      }

      if (isEdit && currentRow?.id) {
        const updateData = { ...values, id: currentRow.id }
        await apiSucursalesService.updateSucursal(currentRow.id, updateData)
        toast.success('Sucursal actualizada exitosamente')
      } else {
        await apiSucursalesService.createSucursal(values)
        toast.success('Sucursal creada exitosamente')
      }
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving sucursal:', error)
      toast.error(isEdit ? 'Error al actualizar la sucursal' : 'Error al crear la sucursal')
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
        className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar sucursal' : 'Crear nueva sucursal'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos de la sucursal.'
              : 'Completa los siguientes campos para crear una nueva sucursal.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 mt-4'>
            <FormField
              control={form.control}
              name='nombre'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la sucursal</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ingrese el nombre de la sucursal' 
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
              name='codigo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ingrese el código de la sucursal' 
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
              name='direccion'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='Ingrese la dirección de la sucursal' 
                      {...field} 
                      autoComplete='off'
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
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                      disabled={loading}
                    >
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder="Seleccione una empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id!.toString()}>
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
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Estado activo</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      La sucursal estará {field.value ? 'activa' : 'inactiva'} en el sistema
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

            <DialogFooter className="gap-2">
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit'>
                {isEdit ? 'Actualizar' : 'Crear'} sucursal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
