import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            Has olvidado tu contraseña
          </CardTitle>
          <CardDescription>
            Introduce tu correo electrónico registrado y te enviaremos un enlace para restablecer tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
        <CardFooter>
          <p className='text-muted-foreground mx-auto px-8 text-center text-sm text-balance'>
            ¿Recuerdas tu contraseña?{' '}
            <Link to='/sign-in' className='hover:text-primary underline underline-offset-4'>
              Iniciar sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
