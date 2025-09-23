import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Contacto } from '@/service/apiContactos.service'
import apiUbicacionesService, { Provincia, Ciudad } from '@/service/apiUbicaciones.service'
import apiEmpresaService from '@/service/apiEmpresa.service'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { usePermissions } from '@/hooks/use-permissions'

export function ContactoDialog({ 
  open, 
  onOpenChange, 
  value, 
  onSubmit, 
  canVerClientes, 
  canVerProveedores 
}: { 
  open: boolean
  onOpenChange: (o: boolean) => void
  value: Partial<Contacto>
  onSubmit: (c: Partial<Contacto>) => void
  canVerClientes: boolean
  canVerProveedores: boolean 
}) {
  const { isSuperAdmin } = usePermissions()
  const isEdit = !!value?.id
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [empresas, setEmpresas] = useState<any[]>([])
  const [provinciaId, setProvinciaId] = useState<number | undefined>(value.provincia_id || undefined)
  const [ciudadId, setCiudadId] = useState<number | undefined>(value.ciudad_id || undefined)
  const [empresaId, setEmpresaId] = useState<number | undefined>(value.empresa?.id || undefined)
  const [esEmpresa, setEsEmpresa] = useState<boolean>(!!value.es_empresa)
  const [estado, setEstado] = useState<boolean>(value.estado !== false) // Por defecto true si no está definido
  
  // Usar un nombre diferente para evitar conflictos
  const rolState = useState<'cliente' | 'proveedor'>((value.rol === 'ambos' ? 'cliente' : value.rol) || 'cliente')
  const rol = rolState[0]
  const setRol = rolState[1]

  useEffect(() => {
    if (open) {
      // Cargar provincias
      (async () => {
        const provs = await apiUbicacionesService.getProvincias()
        setProvincias(provs)
      })()
      
      // Cargar empresas si es superadmin
      if (isSuperAdmin) {
        (async () => {
          const empresasData = await apiEmpresaService.getAllEmpresas()
          setEmpresas(empresasData)
        })()
      }
    }
  }, [open, isSuperAdmin])

  // useEffect separado para actualizar los estados cuando cambie el valor
  useEffect(() => {
    setProvinciaId(value.provincia_id || undefined)
    setEsEmpresa(!!value.es_empresa)
    setEstado(value.estado !== false) // Por defecto true si no está definido
    setRol((value.rol === 'ambos' ? 'cliente' : value.rol) || 'cliente')
    setEmpresaId(value.empresa?.id || undefined)
    
    // Si hay provincia, cargar sus ciudades y luego establecer la ciudad
    if (value.provincia_id) {
      (async () => {
        const ciuds = await apiUbicacionesService.getCiudadesByProvincia(value.provincia_id!)
        setCiudades(ciuds)
        // Establecer la ciudad después de cargar las ciudades
        setCiudadId(value.ciudad_id || undefined)
      })()
    } else {
      setCiudades([])
      setCiudadId(undefined)
    }
  }, [value])

  useEffect(() => {
    if (!provinciaId) { 
      setCiudades([])
      setCiudadId(undefined)
      // Limpiar también del objeto value
      delete (value as any).ciudad_id
      value.codigo_postal = ''
      return 
    }
    
    (async () => {
      const ciuds = await apiUbicacionesService.getCiudadesByProvincia(provinciaId)
      setCiudades(ciuds)
      
      // Si el provinciaId cambió por una acción del usuario (no por inicialización)
      // entonces limpiar la ciudad. Si la ciudad existe en las nuevas ciudades, mantenerla
      if (ciudadId && !ciuds.some(c => c.id === ciudadId)) {
        setCiudadId(undefined)
        delete (value as any).ciudad_id
        value.codigo_postal = ''
      }
    })()
  }, [provinciaId])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        resizable={true}
        minWidth={300}
        minHeight={200}
        maxWidth={window.innerWidth * 0.9}
        maxHeight={window.innerHeight * 0.9}
        defaultWidth={512}
        defaultHeight={450}
        className='sm:max-w-lg'
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar contacto` : `Nuevo contacto`}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 my-3">
          <div className="grid gap-1">
            <Label>Tipo de contacto *</Label>
            <Select value={rol} onValueChange={(v) => { 
              setRol(v as any); 
              (value as any).rol = v;
              // Asegurar que se actualice también el value
              value.codigo_postal = value.codigo_postal || '';
            }}>
              <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                {canVerClientes && <SelectItem value="cliente">Cliente</SelectItem>}
                {canVerProveedores && <SelectItem value="proveedor">Proveedor</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          {isSuperAdmin && (
            <div className="grid gap-1">
              <Label>Empresa *</Label>
              <Select value={empresaId ? String(empresaId) : undefined} onValueChange={(v) => { 
                const id = Number(v); 
                setEmpresaId(id); 
                (value as any).empresa_id = id;
              }}>
                <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar empresa" /></SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={String(empresa.id)}>
                      {empresa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox id="es_empresa" checked={esEmpresa} onCheckedChange={(v) => { const b = !!v; setEsEmpresa(b); (value as any).es_empresa = b }} />
            <Label htmlFor="es_empresa">Es empresa</Label>
          </div>
          <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
            <div className='space-y-0.5'>
              <Label className='text-base'>Estado activo</Label>
              <div className='text-sm text-muted-foreground'>
                El contacto estará {estado ? 'activo' : 'inactivo'} en el sistema
              </div>
            </div>
            <Switch
              checked={estado}
              onCheckedChange={(v) => { setEstado(v); (value as any).estado = v }}
            />
          </div>
          <div className="grid gap-1">
            <Label>{esEmpresa ? 'Razón social *' : 'Nombre completo *'}</Label>
            <Input defaultValue={value?.nombre_razon_social} onChange={(e) => (value.nombre_razon_social = e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Tipo de identificación</Label>
              <Select defaultValue={value?.tipo_identificacion || undefined} onValueChange={(v) => (value.tipo_identificacion = v as any)}>
                <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                  <SelectItem value="PASAPORTE">PASAPORTE</SelectItem>
                  <SelectItem value="OTRO">OTRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Número de identificación</Label>
              <Input defaultValue={value?.numero_identificacion || ''} onChange={(e) => (value.numero_identificacion = e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Condición IVA</Label>
            <Select defaultValue={value?.condicion_iva || undefined} onValueChange={(v) => (value.condicion_iva = v as any)}>
              <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Responsable Inscripto">Responsable Inscripto</SelectItem>
                <SelectItem value="Monotributista">Monotributista</SelectItem>
                <SelectItem value="Exento">Exento</SelectItem>
                <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Email</Label>
              <Input type="email" defaultValue={value?.email || ''} onChange={(e) => (value.email = e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Teléfono</Label>
              <Input defaultValue={value?.telefono_movil || ''} onChange={(e) => (value.telefono_movil = e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label>Calle</Label>
              <Input defaultValue={value?.direccion_calle || ''} onChange={(e) => (value.direccion_calle = e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Número</Label>
              <Input defaultValue={value?.direccion_numero || ''} onChange={(e) => (value.direccion_numero = e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Piso/Dpto</Label>
              <Input defaultValue={value?.direccion_piso_dpto || ''} onChange={(e) => (value.direccion_piso_dpto = e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label>Provincia</Label>
              <Select value={provinciaId ? String(provinciaId) : undefined} onValueChange={(v) => { const id = Number(v); setProvinciaId(id); (value as any).provincia_id = id }}>
                <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {provincias.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Ciudad</Label>
              <Select disabled={!provinciaId} value={ciudadId ? String(ciudadId) : undefined} onValueChange={(v) => { const id = Number(v); setCiudadId(id); (value as any).ciudad_id = id; const cz = ciudades.find(c => c.id === id); if (cz) (value.codigo_postal = cz.codigo_postal) }}>
                <SelectTrigger className='w-full'><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {ciudades.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1 my-3">
              <Label>Código postal</Label>
              <Input value={value?.codigo_postal || ''} onChange={(e) => (value.codigo_postal = e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => {
            const finalData: any = {
              ...value, 
              rol, 
              estado, 
              empresa_id: empresaId,
              provincia_id: provinciaId,
              ciudad_id: ciudadId,
              es_empresa: esEmpresa
            };
            // Limpiar campos undefined/null
            Object.keys(finalData).forEach(key => {
              if (finalData[key] === undefined || finalData[key] === null) {
                delete finalData[key];
              }
            });
            onSubmit(finalData);
          }}>{isEdit ? 'Guardar' : 'Crear'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


