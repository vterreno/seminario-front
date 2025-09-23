import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { OtpForm } from './components/otp-form'
import { useSearch } from "@tanstack/react-router";
import { Route } from '@/routes/(auth)/otp'
import { useState } from 'react';
import apiCorreoService from '@/service/apiCorreo.service';
import { toast } from 'sonner';
export function Otp() {
  const [isResending, setIsResending] = useState(false)
  const search = useSearch({ from: Route.id })
  const email = search.email

  const handleResend = async () => {
    setIsResending(true)
    toast.promise(
      apiCorreoService.send(email),
      {
        loading: 'Enviando nuevo código...',
        success: 'Código reenviado correctamente',
        error: 'Error al reenviar el código',
      }
    )
    setIsResending(false)
  }
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-base tracking-tight'>
            Autenticación de dos factores
          </CardTitle>
          <CardDescription>
            Por favor, introduzca el código de autenticación. Hemos enviado el código de autenticación a su correo electrónico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OtpForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            ¿No lo has recibido?{' '}
            <button
              type="button"
              onClick={handleResend}
              className="hover:text-primary underline underline-offset-4 bg-transparent border-0 p-0 m-0 text-inherit"
              disabled={isResending}
            >
              {isResending ? 'Reenviando...' : 'Reenviar un nuevo código'}
            </button>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
