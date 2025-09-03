import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Cuenta'
      desc='Actualiza la configuración de tu cuenta. Configura tu idioma y zona horaria preferidos..'
    >
      <AccountForm />
    </ContentSection>
  )
}
