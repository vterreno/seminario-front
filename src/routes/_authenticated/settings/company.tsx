import { createFileRoute } from '@tanstack/react-router'
import { SettingsCompany } from '@/features/settings/company'

export const Route = createFileRoute('/_authenticated/settings/company')({
  component: SettingsCompany,
})
