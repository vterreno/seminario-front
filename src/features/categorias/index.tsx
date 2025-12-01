import { Header } from "@/components/layout/header"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Search } from "@/components/search"
import { ThemeSwitch } from "@/components/theme-switch"
import { getRouteApi } from "@tanstack/react-router"
import { Main } from '@/components/layout/main'
import { CategoriasPrimaryButtons } from "./components/categorias-primary-buttons"
import { CategoriasTable } from "./components/categorias-table"
import { usePermissions } from "@/hooks/use-permissions"
import { useEffect, useState } from "react"
import { getStorageItem } from "@/hooks/use-local-storage"
import { toast } from "sonner"
import { STORAGE_KEYS } from "@/lib/constants"
import apiCategoriasService from "@/service/apiCategorias.service"
import type { Categoria } from "./data/schema"
import { CategoriasProvider } from "./components/categorias-provider"
import { CategoriasDialogs } from "./components/categorias-dialogs"

interface UserData {
    id: number
    nombre: string
    apellido: string
    email: string
    role: {
        id: number
        nombre: string
        permisos?: {
            [key: string]: boolean
        }
    }
    empresa?: {
        id: number
        name: string
    } | null
    sucursales?: Array<{
        id: number
        nombre: string
    }>
}

const route = getRouteApi('/_authenticated/productos/categorias/')

export function Categorias() {
    return (
        <CategoriasProvider>
            <CategoriasContent />
        </CategoriasProvider>
    )
}

function CategoriasContent() {
    const { hasPermission } = usePermissions()
    const search = route.useSearch()
    const navigate = route.useNavigate()
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)

    const canEdit = hasPermission('categoria_modificar')
    const canDelete = hasPermission('categoria_eliminar')
    const canBulkAction = canEdit || canDelete
    // Verificar si el usuario tiene permiso para ver categorías
    if (!hasPermission('categoria_ver')) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">
                        Sin permisos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        No tienes permisos para ver las categorías.
                    </p>
                </div>
            </div>
        )
    }

    const fetchCategorias = async () => {
        try {
            setLoading(true)

            // Obtener datos del usuario desde localStorage
            const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
            const userEmpresaId = userData?.empresa?.id

            let data: Categoria[]

            // Si el usuario tiene empresa asignada, filtrar por esa empresa
            if (userEmpresaId) {
                data = await apiCategoriasService.getCategoriasByEmpresa(userEmpresaId)
            } else {
                // Si no tiene empresa (superadmin), mostrar todas las categorías
                data = await apiCategoriasService.getAllCategorias()
            }

            setCategorias(data)
        } catch (error) {
            console.error('Error fetching categorias:', error)
            toast.error('Error al cargar las categorías')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategorias()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Cargando categorías...</div>
            </div>
        )
    }

    return (
        <>
            <Header fixed>
                <Search />
                <div className='flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Lista de categorías</h2>
                        <p className='text-muted-foreground'>
                            Administre aquí las categorías del sistema.
                        </p>
                    </div>
                    <CategoriasPrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <CategoriasTable
                        data={categorias}
                        search={search}
                        navigate={navigate as any}
                        onSuccess={fetchCategorias}
                        canBulkAction={canBulkAction} // Pasar la propiedad canBulkAction
                    />
                </div>

                {/* Añadir los diálogos de categorías */}
                <CategoriasDialogs onSuccess={fetchCategorias} />
            </Main>
        </>
    )
}
