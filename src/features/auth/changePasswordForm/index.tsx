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
import { ChangePasswordForm } from './components/change-password-form'

export function ChangePassword() {
    return (
        <AuthLayout>
        <Card className='gap-4'>
            <CardHeader>
            <CardTitle className='text-lg tracking-tight'>
                Restablecer contraseña
            </CardTitle>
            <CardDescription>
                Ingresa tu nueva contraseña y confírmala para restablecer el acceso a tu cuenta.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ChangePasswordForm />
            </CardContent>
            <CardFooter>
            <p className='text-muted-foreground mx-auto px-8 text-center text-sm text-balance'>
                ¿Recuerdas tu contraseña?{' '}
                <Link
                to='/sign-in'
                className='hover:text-primary underline underline-offset-4'
                >
                Iniciar sesión
                </Link>
                .
            </p>
            </CardFooter>
        </Card>
        </AuthLayout>
    )
}