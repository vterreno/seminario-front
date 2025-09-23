import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth-store'
import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'

const companyFormSchema = z.object({
  name: z
    .string('Por favor ingrese el nombre de la empresa.')
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede tener más de 100 caracteres.'),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

export function CompanyForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { auth } = useAuthStore()
  
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: auth.user?.empresa?.nombre || '',
    },
    mode: 'onChange',
  })

  // Actualizar el formulario cuando cambie el usuario
  useEffect(() => {
    if (auth.user?.empresa?.nombre) {
      form.setValue('name', auth.user.empresa.nombre)
    }
  }, [auth.user, form])

  async function onSubmit(data: CompanyFormValues) {
    if (!auth.user?.empresa?.id) {
      toast.error('No se pudo encontrar la empresa asociada')
      return
    }

    setIsLoading(true)
    try {
      await axiosService.patch(rutasBack.empresas.updateMyCompany, data)
      
      // Actualizar el estado local del usuario
      if (auth.user) {
        auth.setUser({
          ...auth.user,
          empresa: {
            ...auth.user.empresa,
            nombre: data.name
          }
        })
      }
      
      toast.success('Empresa actualizada correctamente')
    } catch (error: any) {
      console.error('Error al actualizar empresa:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar la empresa')
    } finally {
      setIsLoading(false)
    }
  }

  // Si el usuario no tiene empresa asignada, mostrar mensaje
  if (!auth.user?.empresa?.id) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">
          No tienes una empresa asignada. Contacta al administrador del sistema.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la empresa</FormLabel>
              <FormControl>
                <Input 
                  placeholder='Nombre de tu empresa' 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Este es el nombre oficial de tu empresa. Se mostrará en reportes y documentos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Actualizar empresa'}
        </Button>
      </form>
    </Form>
  )
}