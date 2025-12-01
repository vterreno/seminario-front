import { createFileRoute } from '@tanstack/react-router'
import { NuevaVenta } from '@/features/nueva-venta'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Main } from '@/components/layout/main'

function NuevaVentaPage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <NuevaVenta />
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/ventas/nueva-venta/')({
  component: NuevaVentaPage,
})


