import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface UserData {
    name: string
    email: string
    empresa: {
        id: number | null
        nombre: string | null
    }
    sucursales?: Array<{
        id: number
        nombre: string
    }>
}

export function Bienvenida() {
    const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null

    const obtenerSaludo = () => {
        const hora = new Date().getHours()
        if (hora < 12) return 'Buenos días'
        if (hora < 18) return 'Buenas tardes'
        return 'Buenas noches'
    }

    return (
        <>
        {/* ===== Top Heading ===== */}
        <Header>
            <div className='flex items-center space-x-4'>
            <Search />
            <ThemeSwitch />
            <ProfileDropdown />
            </div>
        </Header>

        {/* ===== Main ===== */}
        <Main>
            <div className="container mx-auto p-6">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">
                {obtenerSaludo()}, {userData?.name || 'Usuario'}! 👋
                </h1>
                <p className="text-xl text-muted-foreground">
                Bienvenido a tu panel de gestión
                </p>
                <p className="text-lg">
                Usa la barra lateral para navegar por las diferentes secciones disponibles.
                </p>
            </div>
            </div>
        </Main>
        </>
    )
}
