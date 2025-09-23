import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection
      title='Perfil'
      desc='Así es como los demás te verán en el sitio.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
