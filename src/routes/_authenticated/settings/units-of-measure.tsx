import { createFileRoute } from '@tanstack/react-router'
import { SettingsUnidadesMedida } from '@/features/settings/unidades-medida'

export const Route = createFileRoute('/_authenticated/settings/units-of-measure')({
  component: SettingsUnidadesMedida,
})