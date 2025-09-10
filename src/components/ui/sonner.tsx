import { Toaster as Sonner, ToasterProps } from 'sonner'
import { useTheme } from '@/context/theme-provider'

export function Toaster({ ...props }: ToasterProps) {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group [&_div[data-content]]:w-full'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': 'hsl(var(--success))',
          '--success-text': 'hsl(var(--success-foreground))',
          '--error-bg': 'hsl(var(--destructive))',
          '--error-text': 'hsl(var(--destructive-foreground))',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
