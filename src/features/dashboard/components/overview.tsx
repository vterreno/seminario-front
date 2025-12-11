import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { DashboardMonthlySalesPoint } from '../types'

interface OverviewProps {
  data: DashboardMonthlySalesPoint[]
}

export function Overview({ data }: OverviewProps) {
  const fallback = [{ label: 'Sin datos', total: 0, isoMonth: 'N/A' }]
  const chartData = (data.length ? data : fallback).map((item) => ({
    name: item.label,
    total: item.total,
  }))

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
