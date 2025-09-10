import { createFileRoute } from '@tanstack/react-router'
import { ChangePassword } from '@/features/auth/changePasswordForm'

export const Route = createFileRoute('/(auth)/change-password')({
  component: ChangePasswordPage,
})

function ChangePasswordPage() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <ChangePassword />
    </div>
  )
}