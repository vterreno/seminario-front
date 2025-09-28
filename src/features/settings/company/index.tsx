import { ContentSection } from '../components/content-section'
import { CompanyForm } from './company-form'

export function SettingsCompany() {
  return (
    <ContentSection
      title='Configuración de empresa'
      desc='Gestiona la información básica de tu empresa.'
    >
      <CompanyForm />
    </ContentSection>
  )
}
