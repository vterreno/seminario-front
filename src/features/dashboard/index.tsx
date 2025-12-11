import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'
import apiDashboardService from '@/service/apiDashboard.service'
import { Overview } from './components/overview'
import { RecentSales } from './components/recent-sales'
import { DashboardResponse, DashboardTopProduct } from './types'
import { Bienvenida } from '@/features/bienvenida'

type Trend = 'up' | 'down' | 'neutral'

const numberFormatter = new Intl.NumberFormat('es-AR')
const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const getVariation = (current?: number, previous?: number): { label: string; trend: Trend } => {
  const safeCurrent = current ?? 0
  const safePrevious = previous ?? 0

  if (safePrevious === 0) {
    if (safeCurrent === 0) {
      return { label: 'Sin cambios', trend: 'neutral' }
    }
    return { label: '+100%', trend: 'up' }
  }

  const delta = safeCurrent - safePrevious
  if (delta === 0) {
    return { label: 'Sin cambios', trend: 'neutral' }
  }

  const percentage = (delta / safePrevious) * 100
  const trend: Trend = delta > 0 ? 'up' : 'down'
  return {
    label: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
    trend,
  }
}

const formatDateLabel = (value?: string) => {
  if (!value) {
    return 'Actualización pendiente'
  }
  try {
    return dateTimeFormatter.format(new Date(value))
  } catch (error) {
    return 'Actualización pendiente'
  }
}

const TopProductsList = ({ items }: { items: DashboardTopProduct[] }) => {
  if (!items.length) {
    return <p className='text-sm text-muted-foreground'>Aún no hay ventas registradas.</p>
  }

  return (
    <div className='space-y-4'>
      {items.map((product) => (
        <div key={product.id} className='flex items-center justify-between text-sm'>
          <div>
            <p className='font-medium'>{product.nombre}</p>
            <p className='text-xs text-muted-foreground'>
              {numberFormatter.format(product.unidades)} unidades
            </p>
          </div>
          <p className='font-semibold'>{formatCurrency(product.ingresos)}</p>
        </div>
      ))}
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className='space-y-4'>
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`skeleton-card-${index}`}>
          <CardHeader>
            <Skeleton className='h-4 w-24' />
          </CardHeader>
          <CardContent className='space-y-2'>
            <Skeleton className='h-8 w-32' />
            <Skeleton className='h-3 w-20' />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className='grid gap-4 lg:grid-cols-3'>
      <Card className='lg:col-span-2'>
        <CardHeader>
          <Skeleton className='h-4 w-40' />
        </CardHeader>
        <CardContent>
          <Skeleton className='h-[300px] w-full' />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className='h-4 w-32' />
        </CardHeader>
        <CardContent className='space-y-4'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-stat-${index}`} className='space-y-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-5 w-20' />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
)

export function Dashboard() {
  const { canViewDashboard, userData } = usePermissions()

  const dashboardQuery = useQuery<DashboardResponse>({
    queryKey: ['dashboard-overview'],
    queryFn: () => apiDashboardService.getOverview(),
    enabled: canViewDashboard,
    staleTime: 60 * 1000,
  })

  if (!canViewDashboard) {
    return <Bienvenida />
  }

  const dashboard = dashboardQuery.data
  const cards = useMemo(() => {
    if (!dashboard) {
      return []
    }

    const { kpis, scope } = dashboard
    const salesVariation = getVariation(kpis.salesCurrentMonth, kpis.salesPreviousMonth)
    const purchasesVariation = getVariation(kpis.purchasesCurrentMonth, kpis.purchasesPreviousMonth)

    const baseCards = [
      {
        key: 'sales',
        title: 'Ingresos del mes',
        value: formatCurrency(kpis.salesCurrentMonth),
        helper: `${salesVariation.label} vs mes anterior`,
        trend: salesVariation.trend,
      },
      {
        key: 'purchases',
        title: 'Compras del mes',
        value: formatCurrency(kpis.purchasesCurrentMonth),
        helper: `${purchasesVariation.label} vs mes anterior`,
        trend: purchasesVariation.trend,
      },
      {
        key: 'users',
        title: 'Usuarios activos',
        value: numberFormatter.format(kpis.totalUsers),
        helper: 'Con acceso vigente',
        trend: 'neutral' as Trend,
      },
      {
        key: 'products',
        title: 'Productos habilitados',
        value: numberFormatter.format(kpis.totalProducts),
        helper: 'Disponibles para vender',
        trend: 'neutral' as Trend,
      },
    ]

    if (scope.type === 'global' && kpis.totalCompanies) {
      baseCards.push({
        key: 'companies',
        title: 'Empresas activas',
        value: numberFormatter.format(kpis.totalCompanies),
        helper: 'En el ecosistema',
        trend: 'neutral' as Trend,
      })
    }

    return baseCards
  }, [dashboard])

  const scopeLabel = (() => {
    if (!dashboard) {
      return 'Preparando dashboard'
    }
    if (dashboard.scope.type === 'global') {
      return 'Vista global de todas las empresas'
    }
    return `Dashboard de ${dashboard.scope.empresa.nombre}`
  })()

  return (
    <>
      <Header>
        <div className='flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              {scopeLabel}
            </p>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Hola, {userData?.name || 'equipo'} 👋
            </h1>
            <p className='text-sm text-muted-foreground'>
              Última actualización: {formatDateLabel(dashboard?.lastUpdated)}
            </p>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
          >
            <RefreshCcw
              className={`mr-2 h-4 w-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
        </div>

        {dashboardQuery.isError && (
          <Card className='mb-6 border-destructive/40 bg-destructive/5'>
            <CardHeader>
              <CardTitle>Ocurrió un error</CardTitle>
              <CardDescription>
                No pudimos cargar el dashboard. Intentalo nuevamente en unos segundos.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!dashboard && dashboardQuery.isLoading ? (
          <DashboardSkeleton />
        ) : dashboard ? (
          <Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
            <TabsContent value='overview' className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {cards.map((card) => (
                  <Card key={card.key}>
                    <CardHeader className='space-y-1'>
                      <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                      <p
                        className={`text-xs font-semibold ${
                          card.trend === 'up'
                            ? 'text-emerald-600'
                            : card.trend === 'down'
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        }`}
                      >
                        {card.helper}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className='text-3xl font-semibold'>{card.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className='grid gap-4 lg:grid-cols-3'>
                <Card className='lg:col-span-2'>
                  <CardHeader>
                    <CardTitle>Evolución de ingresos</CardTitle>
                    <CardDescription>Últimos 6 meses</CardDescription>
                  </CardHeader>
                  <CardContent className='ps-2'>
                    <Overview data={dashboard?.charts.monthlySales ?? []} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Salud del negocio</CardTitle>
                    <CardDescription>Indicadores del mes actual</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div>
                      <p className='text-xs text-muted-foreground'>Ingresos netos</p>
                      <p className='text-2xl font-semibold'>
                        {formatCurrency(dashboard?.kpis.netRevenue ?? 0)}
                      </p>
                    </div>
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>Contactos activos</span>
                        <span className='font-medium'>
                          {numberFormatter.format(dashboard?.kpis.totalContacts ?? 0)}
                        </span>
                      </div>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>Sucursales operativas</span>
                        <span className='font-medium'>
                          {numberFormatter.format(dashboard?.kpis.totalBranches ?? 0)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className='grid gap-4 lg:grid-cols-2'>
                <Card>
                  <CardHeader>
                    <CardTitle>Ventas recientes</CardTitle>
                    <CardDescription>Últimos comprobantes emitidos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales items={dashboard?.activity.recentSales ?? []} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Compras recientes</CardTitle>
                    <CardDescription>Controlá tus egresos más cercanos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentSales
                      items={dashboard?.activity.recentPurchases ?? []}
                      emptyMessage='Sin compras registradas'
                    />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Productos con mayor rotación</CardTitle>
                  <CardDescription>Basado en unidades vendidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProductsList items={dashboard?.activity.topProducts ?? []} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </Main>
    </>
  )
}
