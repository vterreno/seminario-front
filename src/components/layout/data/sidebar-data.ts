import {
  LayoutDashboard,
  Package,
  Settings,
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  ShoppingCart,
  CreditCard,
  Briefcase,
  UserCheck,
  MapPin,
  Building2
} from 'lucide-react'
import { type SidebarData } from '../types'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'
import { hasPermission } from '@/lib/auth-utils'

interface UserData {
  name: string
  email: string
  empresa: {
    id: number | null
    nombre: string | null
  }
  roles: Array<{
    id: number
    nombre: string
    permissions?: Array<{
      id: number
      nombre: string
      codigo: string
    }>
    permisos?: Record<string, boolean> // Soporte para permisos en formato objeto { permiso: true/false }
  }>
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
const hasPermission = (userData: UserData | null, permission: string): boolean => {
  if (!userData?.roles || userData.roles.length === 0) {
    return false
  }
  
  // Si es superadmin (sin empresa), tiene acceso a todo
  const isSuperAdmin = !userData?.empresa?.id
  if (isSuperAdmin) {
    return true // Superadmin tiene todos los permisos
  }
  
  // Revisar todos los roles del usuario
  for (const role of userData.roles) {
    // Verificar permisos en formato Record<string, boolean>
    if (role.permisos && role.permisos[permission] === true) {
      return true
    }
    
    // Verificar permisos en formato Array
    if (role.permissions && Array.isArray(role.permissions)) {
      const hasPermissionInArray = role.permissions.some(p => p.codigo === permission)
      if (hasPermissionInArray) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Obtiene la primera ruta disponible para el usuario
 */
export const getFirstAvailableRoute = (userData: UserData | null): string => {
  // Si tiene permisos de dashboard, ir al dashboard
  if (hasPermission(userData, 'dashboard_ver')) {
    return '/dashboard'
  }
  
  // Buscar la primera opción disponible en orden de prioridad
  const rutasDisponibles = [
    { permiso: 'usuario_ver', ruta: '/users' },
    { permiso: 'producto_ver', ruta: '/productos' },
    { permiso: 'ventas_ver', ruta: '/ventas' },
    { permiso: 'compras_ver', ruta: '/compras' },
    { permiso: 'cliente_ver', ruta: '/contactos' },
    { permiso: 'roles_ver', ruta: '/roles' },
    { permiso: 'sucursal_ver', ruta: '/settings/sucursales' },
  ]
  
  for (const opcion of rutasDisponibles) {
    if (hasPermission(userData, opcion.permiso)) {
      return opcion.ruta
    }
  }
  
  // Si no tiene ningún permiso específico, quedarse en bienvenida
  return '/bienvenida'
}

export const getSidebarData = (): SidebarData => {
  // Get user data from localStorage
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
  
  // Check if user has a company assigned (if empresa.id exists and is not null)
  const hasCompany = userData?.empresa?.id !== null && userData?.empresa?.id !== undefined
  
  const baseNavGroups = []

  // Sección de Inicio - siempre visible
  if (hasPermission(userData, 'dashboard_ver')) {
    // Si tiene permisos para dashboard, mostrar Dashboard
    baseNavGroups.push({
      title: 'Inicio',
      items: [
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
      ],
    })
  } else {
    baseNavGroups.push({
      title: 'Inicio',
      items: [
        {
          title: 'Bienvenida',
          url: '/bienvenida',
          icon: LayoutDashboard,
          backgroundColor: '#40ba22',
          textColor: '#ffffff', 
        },
      ],
    })
  }

  // Sección de Usuarios - solo si tiene permisos para ver usuarios o roles
  const usuariosItems = []
  
  if (hasPermission(userData, 'usuario_ver')) {
    usuariosItems.push({
      title: 'Usuarios',
      url: '/users',
      icon: Users,
      backgroundColor: '#40ba22',
      textColor: '#ffffff',
    })
  }
  
  if (hasPermission(userData, 'roles_ver')) {
    usuariosItems.push({
      title: 'Roles',
      url: '/roles',
      icon: UserCheck,
      backgroundColor: '#40ba22',
      textColor: '#ffffff',
    })
  }

  if (usuariosItems.length > 0) {
    baseNavGroups.push({
      title: 'Usuarios',
      items: usuariosItems,
    })
  }

  // Sección General - basada en permisos específicos
  const generalItems = []

  // Solo agregar si tiene permisos para ver clientes
  if (hasPermission(userData, 'cliente_ver')) {
    generalItems.push({
      title: 'Contactos',
      url: '/contactos',
      icon: Users,
      backgroundColor: '#f7c33b',
      textColor: '#ffffff',
    })
  }
  
  const productosSubItems: SidebarItem[] = []
  
  // Solo agregar si tiene permisos para ver productos
  if (hasPermission(userData, 'producto_ver')) {
    
    if (hasPermission(userData, 'producto_ver')) {
      productosSubItems.push({
        title: 'Productos',
        url: '/productos/productos/',
        icon: Package,
        backgroundColor: '#f7c33b',
        textColor: '#ffffff',
      })
    }
    if (hasPermission(userData, 'marca_ver')) {
      productosSubItems.push({
        title: 'Marcas',
        url: '/productos/marcas/',
        icon: Package,
        backgroundColor: '#f7c33b',
        textColor: '#ffffff',
      })
    }

    if (hasPermission(userData, 'categoria_ver')) {
      productosSubItems.push({
        title: 'Categorías',
        url: '/productos/categorias',
        icon: Package,
        backgroundColor: '#f7c33b',
        textColor: '#ffffff',
      })
    }

    generalItems.push({
      title: 'Productos',
      icon: Package,
      backgroundColor: '#f7c33b',
      textColor: '#ffffff',
      items: productosSubItems,
    })
  }

  // Solo agregar si tiene permisos para ver ventas
  if (hasPermission(userData, 'ventas_ver')) {
    generalItems.push({
      title: 'Ventas',
      url: '/ventas',
      icon: ShoppingCart,
      backgroundColor: '#f7c33b',
      textColor: '#ffffff',
    })
  }

  // Solo agregar si tiene permisos para ver compras
  if (hasPermission(userData, 'compras_ver')) {
    generalItems.push({
      title: 'Compras',
      url: '/compras',
      icon: CreditCard,
      backgroundColor: '#f7c33b',
      textColor: '#ffffff',
    })
  }

  if (generalItems.length > 0) {
    baseNavGroups.push({
      title: 'General',
      items: generalItems,
    })
  }

  // Sección de Configuración
  const configuracionItems = []

  // Solo agregar sucursales si tiene permisos para verlas
  if (hasPermission(userData, 'sucursal_ver')) {
    configuracionItems.push({
      title: 'Sucursales',
      url: '/settings/sucursales',
      icon: MapPin,
      backgroundColor: '#40ba22',
      textColor: '#ffffff',
    })
  }

  if (hasPermission(userData, 'configuracion_empresa')) {
    configuracionItems.push({
      title: 'Configuración de empresa',
      url: '/settings/company',
      icon: Building2,
      backgroundColor: '#40ba22',
      textColor: '#ffffff',
    })
  }

  // Solo mostrar configuración si hay items disponibles
  if (configuracionItems.length > 0) {
    baseNavGroups.push({
      title: 'Otros',
      items: [
        {
          title: 'Ajustes',
          icon: Settings,
          backgroundColor: '#40ba22',
          textColor: '#ffffff',
          items: configuracionItems,
        },
      ],
    })
  }

  // Only add Superadmin section if user doesn't have a company (empresa.id is null)
  const navGroups = !hasCompany ? [
    {
      title: 'Superadmin',
      items: [
        {
          title: 'Empresas',
          url: '/empresa',
          icon: Briefcase,
          backgroundColor: '#40ba22',
          textColor: '#ffffff',
        },
      ],
    },
    ...baseNavGroups
  ] : baseNavGroups

  return {
    user: {
      name: userData?.name || 'Usuario',
      email: userData?.email || 'usuario@ejemplo.com',
      avatar: '/avatars/shadcn.jpg',
    },
    teams: [
      {
        name: 'Shadcn Admin',
        logo: Command,
        plan: 'Vite + ShadcnUI',
      },
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
    ],
    navGroups,
  }
}

// Keep the old export for backwards compatibility (deprecated)
export const sidebarData: SidebarData = getSidebarData()
