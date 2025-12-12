import { useContext, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
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
import { AuthContext } from '@/context/auth-provider';
const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Por favor ingrese su correo electrónico' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Por favor, introduzca su contraseña')
    .min(7, 'La contraseña debe tener al menos 7 caracteres.'),
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      setIsLoading(false);

      navigate({ to: '/', replace: true });
      toast.success(`Bienvenido de nuevo, ${data.email}!`);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || "Usuario o contraseña incorrectos");
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
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
            <FormItem className='relative'>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                ¿Has olvidado tu contraseña?
              </Link>
            </FormItem>
          )}
        />
        <Button type="submit" className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Iniciar sesion
        </Button>

      </form>
    </Form>
  )
}

