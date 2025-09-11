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
    permissions: Array<{
      id: number
      nombre: string
      codigo: string
    }>
  }>
}

export const getSidebarData = (): SidebarData => {
  // Get user data from localStorage
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as UserData | null
  
  // Check if user has a company assigned (if empresa.id exists and is not null)
  const hasCompany = userData?.empresa?.id !== null && userData?.empresa?.id !== undefined
  
  const baseNavGroups = [
    {
      title: 'Inicio',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          backgroundColor: '#f7c33b', // yellow
          textColor: '#ffffff', // white
        },
      ],
    },
    {
      title: 'Usuarios',
      items: [
        {
          title: 'Usuarios',
          url: '/users',
          icon: Users,
          backgroundColor: '#f7c33b', // emerald-500 (color personalizado)
          textColor: '#ffffff',
        },
        {
          title: 'Roles',
          url: '/roles',
          icon: UserCheck,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
      ],
    },
    {
      title: 'General',
      items: [
        // {
        //   title: 'Tasks',
        //   url: '/tasks',
        //   icon: ListTodo,
        // },
        // {
        //   title: 'Apps',
        //   url: '/apps',
        //   icon: Package,
        // },
        // {
        //   title: 'Chats',
        //   url: '/chats',
        //   badge: '3',
        //   icon: MessagesSquare,
        // },
        {
          title: 'Contactos',
          url: '/contactos',
          icon: Users,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
        {
          title: 'Productos',
          url: '/productos',
          icon: Package,
          backgroundColor: '#f7c33b', // violet-500 (color personalizado)
          textColor: '#ffffff',
        },
        {
          title: 'Ventas',
          url: '/ventas',
          icon: ShoppingCart,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
        {
          title: 'Compras',
          url: '/compras',
          icon: CreditCard,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
        // {
        //   title: 'Secured by Clerk',
        //   icon: ClerkLogo,
        //   items: [
        //     {
        //       title: 'Sign In',
        //       url: '/clerk/sign-in',
        //     },
        //     {
        //       title: 'Sign Up',
        //       url: '/clerk/sign-up',
        //     },
        //     {
        //       title: 'User Management',
        //       url: '/clerk/user-management',
        //     },
        //   ],
        // },
      ],
    },
    /* {
      title: 'Paginas',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    }, */
    {
      title: 'Otros',
      items: [
        {
          title: 'Ajustes',
          icon: Settings,
          backgroundColor: '#40ba22', // blue-500
          textColor: '#ffffff',
          items: [
           /*  {
              title: 'Pefil',
              url: '/settings',
              icon: UserCog,
              backgroundColor: '#f7c33b', // blue-500 (para configuración)
              textColor: '#ffffff',
            },
            {
              title: 'Cuenta',
              url: '/settings/account',
              icon: Wrench,
              backgroundColor: '#f7c33b', // blue-600
              textColor: '#ffffff',
            },
            {
              title: 'Apariencia',
              url: '/settings/appearance',
              icon: Palette,
              backgroundColor: '#f7c33b', // blue-700
              textColor: '#ffffff',
            }, */
            {
              title: 'Sucursales',
              url: '/settings/sucursales',
              icon: MapPin,
              backgroundColor: '#40ba22', // blue-800
              textColor: '#ffffff',
            },
            ...(hasPermission('configuracion_empresa') ? [{
              title: 'Configuración de empresa',
              url: '/settings/company',
              icon: Building2,
              backgroundColor: '#40ba22',
              textColor: '#ffffff',
            }] : [])
            // {
            //   title: 'Notifications',
            //   url: '/settings/notifications',
            //   icon: Bell,
            // },
            // {
            //   title: 'Display',
            //   url: '/settings/display',
            //   icon: Monitor,
            // },
          ],
        },
        // {
        //   title: 'Help Center',
        //   url: '/help-center',
        //   icon: HelpCircle,
        // },
      ],
    },
  ]

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
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
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
