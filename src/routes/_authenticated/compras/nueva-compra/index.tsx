import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Main } from '@/components/layout/main'
import { NuevaCompra } from '@/features/nueva-compra'

function NuevaCompraPage() {
  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center gap-2'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        <NuevaCompra />
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/compras/nueva-compra/')({
  component: NuevaCompraPage,
})


