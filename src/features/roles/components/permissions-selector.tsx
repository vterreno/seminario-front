import { useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { permissionGroups, PermissionKey, Permissions } from '../data/schema'
import { RoleForm } from '../data/schema'

type PermissionsSelectorProps = {
  disabled?: boolean
}

export function PermissionsSelector({ disabled = false }: PermissionsSelectorProps) {
  const { watch, setValue } = useFormContext<RoleForm>()
  const permisos = watch('permisos')

  const handleSelectAll = (groupId: string, checked: boolean) => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return

    const updates: Partial<Permissions> = {}
    group.permissions.forEach(permission => {
      updates[permission.key as PermissionKey] = checked
    })
    
    setValue('permisos', { ...permisos, ...updates }, { shouldValidate: true })
  }

  const handlePermissionChange = (permissionKey: PermissionKey, checked: boolean) => {
    setValue(`permisos.${permissionKey}`, checked, { shouldValidate: true })
  }

  const isGroupFullySelected = (groupId: string): boolean => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    return group.permissions.every(permission => 
      permisos[permission.key as PermissionKey] === true
    )
  }

  const isGroupPartiallySelected = (groupId: string): boolean => {
    const group = permissionGroups.find(g => g.id === groupId)
    if (!group) return false
    
    const selectedCount = group.permissions.filter(permission => 
      permisos[permission.key as PermissionKey] === true
    ).length
    
    return selectedCount > 0 && selectedCount < group.permissions.length
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Permisos del rol</Label>
        <p className="text-sm text-muted-foreground">
          Seleccione los permisos que tendrá este rol
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {permissionGroups.map((group) => {
          const isFullySelected = isGroupFullySelected(group.id)
          const isPartiallySelected = isGroupPartiallySelected(group.id)
          
          return (
            <Card key={group.id} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Checkbox
                    checked={isFullySelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected && !isFullySelected
                    }}
                    onCheckedChange={(checked) => 
                      handleSelectAll(group.id, checked as boolean)
                    }
                    disabled={disabled}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className="font-medium">{group.name}</span>
                </CardTitle>
                <button
                  type="button"
                  onClick={() => handleSelectAll(group.id, !isFullySelected)}
                  disabled={disabled}
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                >
                  Seleccionar todo
                </button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div key={permission.key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={permisos[permission.key as PermissionKey] || false}
                        onCheckedChange={(checked) =>
                          handlePermissionChange(permission.key as PermissionKey, checked as boolean)
                        }
                        disabled={disabled}
                        id={permission.key}
                      />
                      <Label
                        htmlFor={permission.key}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
