'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Switch } from '@/components/ui/switch'
import { type User, type UserForm } from '../data/schema'
import apiUsersService from '@/service/apiUser.service'
import apiRolesService from '@/service/apiRoles.service'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { useState, useEffect } from 'react'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { usePermissions } from '@/hooks/use-permissions'

const formSchema = z
  .object({
    nombre: z.string().min(1, 'Nombre es obligatorio.'),
    apellido: z.string().min(1, 'Apellido es obligatorio.'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().optional(),
    role_id: z.number().optional(),
    empresa_id: z.number().optional(),
    status: z.boolean().optional(),
  })

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const [loading, setLoading] = useState(false)
  const [rolesList, setRolesList] = useState<any[]>([])
  const [empresasList, setEmpresasList] = useState<any[]>([])
  const { isSuperAdmin, userEmpresaId } = usePermissions()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          nombre: currentRow.nombre,
          apellido: currentRow.apellido,
          email: currentRow.email,
          password: '',
          role_id: currentRow.role?.id,
          empresa_id: currentRow.empresa?.id,
          status: currentRow.status,
        }
      : {
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          role_id: undefined,
          empresa_id: undefined,
          status: true,
        },
  })

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
        const userEmpresaId = userData?.empresa?.id
        const isSuperAdmin = !userEmpresaId

        let roles
        if (isSuperAdmin) {
          roles = await apiRolesService.getAllRoles()
        } else {
          roles = await apiRolesService.getRolesByEmpresa(userEmpresaId)
        }
        
        setRolesList(roles)
      } catch (error) {
        console.error('Error fetching roles:', error)
      }
    }
    if (open) {
      fetchRoles()
    }
  }, [open])

  useEffect(() => {
    const fetchEmpresas = async () => {
      if (isSuperAdmin) {
        try {
          const empresas = await apiEmpresaService.getAllEmpresas()
          setEmpresasList(empresas)
        } catch (error) {
          console.error('Error fetching empresas:', error)
        }
      }
    }
    if (open && isSuperAdmin) {
      fetchEmpresas()
    }
  }, [open, isSuperAdmin])

  const onSubmit = async (values: UserForm) => {
    try {
      setLoading(true)
      
      // For non-superadmin users, automatically set empresa_id from user data
      const submitValues = { ...values }
      if (!isSuperAdmin && userEmpresaId) {
        submitValues.empresa_id = userEmpresaId
      }
      
      if (isEdit && currentRow) {
        await apiUsersService.updateUser(currentRow.id, submitValues)
        toast.success('Usuario actualizado correctamente')
      } else {
        await apiUsersService.createUser(submitValues)
        toast.success('Usuario creado correctamente')
      }
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Error al guardar usuario')
    } finally {
      setLoading(false)
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Agregar nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Actualice el usuario aquí ' : 'Crear nuevo usuario aquí. '}
            Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='nombre'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Nombre
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='apellido'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      Apellido
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@gmail.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role_id'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Rol</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value?.toString()}
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      placeholder='Selecciona un rol'
                      className='col-span-4 w-full'
                      items={rolesList.map((role) => ({
                        label: role.nombre,
                        value: role.id.toString(),
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {isSuperAdmin && (
                <FormField
                  control={form.control}
                  name='empresa_id'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Empresa</FormLabel>
                      <SelectDropdown
                        defaultValue={field.value?.toString()}
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                        placeholder='Selecciona una empresa'
                        className='col-span-4 w-full'
                        items={empresasList.map((empresa) => ({
                          label: empresa.name,
                          value: empresa.id.toString(),
                        }))}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Estado</FormLabel>
                    <FormControl>
                      <div className='col-span-4 flex items-center space-x-2'>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <span className='text-sm text-muted-foreground'>
                          {field.value ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='e.g., S3cur3P@ssw0rd'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
