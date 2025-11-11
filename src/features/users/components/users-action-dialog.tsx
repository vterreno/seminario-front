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
import apiSucursalesService from '@/service/apiSucursales.service'
import { useState, useEffect } from 'react'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { usePermissions } from '@/hooks/use-permissions'
import { MultiSelect } from '@/components/multi-select'

const formSchema = z
  .object({
    nombre: z.string().min(1, 'Nombre es obligatorio.'),
    apellido: z.string().min(1, 'Apellido es obligatorio.'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().optional(),
    role_id: z.number().optional(),
    empresa_id: z.number().optional(),
    sucursal_ids: z.array(z.number()).optional(),
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
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [empresasList, setEmpresasList] = useState<any[]>([])
  const [sucursalesList, setSucursalesList] = useState<any[]>([])
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<number | undefined>(undefined)
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
          sucursal_ids: currentRow.sucursales?.map((s) => s.id) || [],
          status: currentRow.status,
        }
      : {
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          role_id: undefined,
          empresa_id: undefined,
          sucursal_ids: [],
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
        
        setAllRoles(roles)
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

  // Cargar sucursales cuando cambia la empresa seleccionada
  useEffect(() => {
    const fetchSucursales = async () => {
      const empresaId = isSuperAdmin ? selectedEmpresaId : userEmpresaId
      
      if (empresaId) {
        try {
          const sucursales = await apiSucursalesService.getSucursalesByEmpresa(empresaId)
          setSucursalesList(sucursales)
        } catch (error) {
          console.error('Error fetching sucursales:', error)
          setSucursalesList([])
        }
      } else {
        setSucursalesList([])
      }
    }

    if (open) {
      fetchSucursales()
    }
  }, [open, selectedEmpresaId, isSuperAdmin, userEmpresaId])

  // Actualizar selectedEmpresaId cuando cambia empresa_id en el formulario
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'empresa_id') {
        setSelectedEmpresaId(value.empresa_id)
        // Limpiar sucursales seleccionadas cuando cambia la empresa
        form.setValue('sucursal_ids', [])
        // Limpiar rol seleccionado cuando cambia la empresa
        form.setValue('role_id', undefined)
        
        // Filtrar roles por empresa si es superadmin
        if (isSuperAdmin && value.empresa_id) {
          const filteredRoles = allRoles.filter(role => role.empresa_id === value.empresa_id)
          setRolesList(filteredRoles)
        } else if (isSuperAdmin && !value.empresa_id) {
          setRolesList(allRoles)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, isSuperAdmin, allRoles])

  // Inicializar selectedEmpresaId cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      let empresaId: number | undefined
      
      if (isEdit && currentRow?.empresa?.id) {
        empresaId = currentRow.empresa.id
        setSelectedEmpresaId(empresaId)
      } else if (!isSuperAdmin && userEmpresaId) {
        empresaId = userEmpresaId
        setSelectedEmpresaId(empresaId)
      }

      // Filtrar roles cuando se inicializa el diálogo en modo edición
      if (isSuperAdmin && empresaId && allRoles.length > 0) {
        const filteredRoles = allRoles.filter(role => role.empresa_id === empresaId)
        setRolesList(filteredRoles)
      }
    }
  }, [open, isEdit, currentRow, isSuperAdmin, userEmpresaId, allRoles])

  const onSubmit = async (values: UserForm) => {
    try {
      setLoading(true)
      
      // For non-superadmin users, automatically set empresa_id from user data
      const submitValues = { ...values }
      if (!isSuperAdmin && userEmpresaId) {
        submitValues.empresa_id = userEmpresaId
      }
      
      if (isEdit && currentRow) {
        // Solo enviar los campos que han cambiado
        const changedValues: Partial<UserForm> = {}
        
        if (values.nombre !== currentRow.nombre) changedValues.nombre = values.nombre
        if (values.apellido !== currentRow.apellido) changedValues.apellido = values.apellido
        if (values.email !== currentRow.email) changedValues.email = values.email
        if (values.password && values.password !== '') changedValues.password = values.password
        if (values.role_id !== currentRow.role?.id) changedValues.role_id = values.role_id
        if (submitValues.empresa_id !== currentRow.empresa?.id) changedValues.empresa_id = submitValues.empresa_id
        if (values.status !== currentRow.status) changedValues.status = values.status
        
        // Comparar sucursales
        const currentSucursalIds = (currentRow.sucursales?.map((s) => s.id) || []).sort()
        const newSucursalIds = (values.sucursal_ids || []).sort()
        if (JSON.stringify(currentSucursalIds) !== JSON.stringify(newSucursalIds)) {
          changedValues.sucursal_ids = values.sucursal_ids
        }
        
        await apiUsersService.updateUser(currentRow.id, changedValues)
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
      <DialogContent
        resizable={true}
        minWidth={300}
        minHeight={200}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={512}
        defaultHeight={450} 
        className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Agregar nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Actualice el usuario aquí ' : 'Crear nuevo usuario aquí. '}
            Haga clic en guardar cuando haya terminado.
          </DialogDescription>
        </DialogHeader>
        <div className='mb-5 overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 mt-4 px-0.5'
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
              {sucursalesList.length > 0 && (
                <FormField
                  control={form.control}
                  name='sucursal_ids'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>
                        {sucursalesList.length > 1 ? 'Sucursales' : 'Sucursal'}
                      </FormLabel>
                      <div className='col-span-4'>
                        {sucursalesList.length > 1 ? (
                          <MultiSelect
                            options={sucursalesList.map((sucursal) => ({
                              label: sucursal.nombre,
                              value: sucursal.id.toString(),
                            }))}
                            selected={(field.value || []).map(String)}
                            onChange={(values) => field.onChange(values.map(Number))}
                            placeholder='Selecciona sucursales'
                            emptyMessage='No se encontraron sucursales.'
                          />
                        ) : (
                          <SelectDropdown
                            defaultValue={field.value?.[0]?.toString()}
                            onValueChange={(value) => field.onChange(value ? [parseInt(value)] : [])}
                            placeholder='Selecciona una sucursal'
                            className='w-full'
                            items={sucursalesList.map((sucursal) => ({
                              label: sucursal.nombre,
                              value: sucursal.id.toString(),
                            }))}
                          />
                        )}
                      </div>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              )}
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
