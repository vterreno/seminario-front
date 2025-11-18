import { Switch } from '@/components/ui/switch'

interface FilterSectionProps {
    title: string
    children: React.ReactNode
    isActive: boolean
    onToggle: () => void
}

export function FilterSection({ title, children, isActive, onToggle }: FilterSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    {title}
                </h4>
                <div className="flex items-center space-x-2">
                    <span className={`text-xs ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <Switch
                        checked={isActive}
                        onCheckedChange={onToggle}
                    />
                </div>
            </div>
            <div className={`space-y-3 transition-opacity duration-200 ${
                isActive ? 'opacity-100' : 'opacity-40'
            }`}>
                <div className={!isActive ? 'pointer-events-none' : ''}>
                    {children}
                </div>
            </div>
        </div>
    )
}
