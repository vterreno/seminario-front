import { useState, useContext } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react'
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
import { AuthContext } from '@/context/auth-provider'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Route } from '@/routes/(auth)/change-password'

const formSchema = z
  .object({
    newPassword: z.string().min(7, 'La nueva contraseña debe tener al menos 7 caracteres'),
    confirmNewPassword: z.string().min(1, 'Confirme su nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmNewPassword'],
  })

export function ChangePasswordForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const search = useSearch({from: Route.id});
  const email = search.email;
  const { cambiarContrasena } = useContext(AuthContext);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    toast.promise(
      cambiarContrasena(email, data.newPassword)
        .then((response) => {
          // La función cambiarContrasena ya hace la petición al endpoint "me"
          // y actualiza la información del usuario en el contexto
          setIsLoading(false)
          form.reset()
          return response
        }),
      {
        loading: 'Cambiando contraseña...',
        success: () => {
          navigate({ to: '/', replace: true })
          return 'Contraseña cambiada correctamente'
        },
        error: (err) => {
          setIsLoading(false)
          return err?.message || 'Error al cambiar la contraseña'
        },
      }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-2', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nueva contraseña"
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmNewPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar nueva contraseña</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirmar nueva contraseña"
                    autoComplete="new-password"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="mt-2" disabled={isLoading}>
          Cambiar contraseña
          {isLoading ? <Loader2 className="animate-spin" /> : <Lock />}
        </Button>
      </form>
    </Form>
  )
}