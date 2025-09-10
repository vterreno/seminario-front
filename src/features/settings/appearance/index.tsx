import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Apariencia'
      desc='Personaliza la apariencia de la app. Cambia automáticamente entre los temas claros y nocturno.'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
