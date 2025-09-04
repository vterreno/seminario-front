import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  ShoppingCart,
  CreditCard,
  Briefcase,
  UserCheck,
  Key
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
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
  navGroups: [
    {
      title: 'Superadmin',
      items: [
        {
          title: 'Empresas',
          url: '/empresa',
          icon: Briefcase,
          backgroundColor: '#f7c33b',
          textColor: '#ffffff',
        },
      ],
    },
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          backgroundColor: '#f7c33b', // yellow
          textColor: '#ffffff', // white
        },
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
        {
          title: 'Productos',
          url: '/productos',
          icon: Package,
          backgroundColor: '#f7c33b', // violet-500 (color personalizado)
          textColor: '#ffffff',
        },
        {
          title: 'Contactos',
          url: '/contactos',
          icon: Users,
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
          backgroundColor: '#f7c33b', // blue-500
          textColor: '#ffffff',
          items: [
            {
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
            },
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
  ],
}
