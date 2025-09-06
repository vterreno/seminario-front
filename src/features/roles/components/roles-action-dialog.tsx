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
import { Role, RoleForm, roleFormSchema, permissionsSchema } from '../data/schema'
import { PermissionsSelector } from './permissions-selector'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Empresa } from '@/features/empresa/data/schema'
import apiEmpresaService from '@/service/apiEmpresa.service'

type RolesActionDialogProps = {
  currentRow?: Role
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RolesActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: RolesActionDialogProps) {
  const isEdit = !!currentRow
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener datos del usuario desde localStorage
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
  const userEmpresaId = userData.empresa_id
  const isSuperAdmin = userData.role === 'superadmin' || userData.is_superadmin

  const defaultPermissions = permissionsSchema.parse({})

  const form = useForm<RoleForm>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: isEdit && currentRow
      ? {
          nombre: currentRow.nombre,
          empresa_id: currentRow.empresa_id,
          permisos: currentRow.permisos || defaultPermissions,
          estado: currentRow.estado,
          isEdit,
        }
      : {
          nombre: '',
          empresa_id: isSuperAdmin ? 0 : userEmpresaId || 0,
          permisos: defaultPermissions,
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

  const onSubmit = async (values: RoleForm) => {
    try {
      // Aquí iría la llamada al servicio de roles
      console.log('Datos del rol:', values)
      
      if (isEdit && currentRow?.id) {
        // await apiRoleService.updateRole(currentRow.id, values)
        toast.success('Rol actualizado exitosamente')
      } else {
        // await apiRoleService.createRole(values)
        toast.success('Rol creado exitosamente')
      }
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving role:', error)
      toast.error(isEdit ? 'Error al actualizar el rol' : 'Error al crear el rol')
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
        minWidth={400}
        minHeight={300}
        maxWidth={window.innerWidth * 0.95}
        maxHeight={window.innerHeight * 0.95}
        defaultWidth={900}
        defaultHeight={700}
        className='sm:max-w-4xl overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar rol' : 'Crear nuevo rol'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los datos del rol y sus permisos.'
              : 'Completa los siguientes campos para crear un nuevo rol.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 my-4'>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name='nombre'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del rol</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder='Ingrese el nombre del rol' 
                        {...field} 
                        autoComplete='off'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSuperAdmin ? (
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
                          <SelectTrigger>
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
              ) : (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <FormControl>
                    <Input 
                      value={userData.empresa_name || 'Empresa actual'}
                      disabled 
                      className="bg-muted"
                    />
                  </FormControl>
                </FormItem>
              )}
            </div>

            <FormField
              control={form.control}
              name='estado'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-base'>Estado activo</FormLabel>
                    <div className='text-sm text-muted-foreground'>
                      El rol estará {field.value ? 'activo' : 'inactivo'} en el sistema
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

            <div className="border-t pt-4">
              <PermissionsSelector />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type='submit'>
                {isEdit ? 'Actualizar' : 'Crear'} rol
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
