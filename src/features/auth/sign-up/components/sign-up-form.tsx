import { useContext, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { useNavigate, useRouter } from '@tanstack/react-router'

import { AuthContext } from '@/context/auth-provider'
import { toast } from 'sonner'

const formSchema = z.object({
    nombre: z
    .string()
        .min(1, { message: 'Por favor ingrese su nombre' })
        .max(50, { message: 'El nombre no puede superar los 50 caracteres' }),
    apellido: z
    .string()
        .min(1, { message: 'Por favor ingrese su apellido' })
        .max(50, { message: 'El apellido no puede superar los 50 caracteres' }),
    empresa: z
    .string()
        .min(1, { message: 'Por favor ingrese su empresa' })
        .max(100, { message: 'El nombre de la empresa no puede superar los 100 caracteres' }),
    email: z
    .string()
        .min(1, { message: 'Por favor ingrese su correo electrónico' })
        .email({ message: 'Correo electrónico inválido' }),    
    password: z
      .string()
      .min(1, 'Por favor ingrese su contraseña')
      .min(7, 'La contraseña debe tener al menos 7 caracteres.'),
    confirmPassword: z.string().min(1, 'Por favor confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ['confirmPassword'],
  })

export function SignUpForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const navigate = useNavigate()
  const { register } = useContext(AuthContext);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa: '',
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
  setIsLoading(true)
  try{
      await register(data.empresa, data.nombre, data.apellido, data.email, data.password);
      setIsLoading(false);
      navigate({ to: '/users', replace: true });
      toast.success(`Bienvenido de nuevo, ${data.email}!`);

  } catch (error) {
    console.error("Error al registrar", error)

  } finally {
    setIsLoading(false)
  }
}

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
      <FormField
          control={form.control}
          name='empresa'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl>
                <Input placeholder='EmpresaMatePymes' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='nombre'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder='Nombre' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='apellido'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido</FormLabel>
              <FormControl>
                <Input placeholder='Apellido' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='nombre@ejemplo.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          Crear Cuenta
        </Button>
      </form>
    </Form>
  )
}