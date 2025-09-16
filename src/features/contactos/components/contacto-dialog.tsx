import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Contacto } from '@/service/apiContactos.service'
import apiUbicacionesService, { Provincia, Ciudad } from '@/service/apiUbicaciones.service'
import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'

export function ContactoDialog({ open, onOpenChange, value, onSubmit, canVerClientes, canVerProveedores }: { open: boolean, onOpenChange: (o: boolean) => void, value: Partial<Contacto>, onSubmit: (c: Partial<Contacto>) => void, canVerClientes: boolean, canVerProveedores: boolean }) {
  const isEdit = !!value?.id
  const [provincias, setProvincias] = useState<Provincia[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [provinciaId, setProvinciaId] = useState<number | undefined>(value['provincia_id'] as any)
  const [ciudadId, setCiudadId] = useState<number | undefined>(value['ciudad_id'] as any)
  const [esEmpresa, setEsEmpresa] = useState<boolean>(!!value['es_empresa'])
  const [tipoContacto, setTipoContacto] = useState<'cliente' | 'proveedor'>((value as any)['tipo_contacto'] || 'cliente')

  useEffect(() => {
    if (open) {
      setProvinciaId(value['provincia_id'] as any)
      setCiudadId(value['ciudad_id'] as any)
      setEsEmpresa(!!value['es_empresa'])
      setTipoContacto((value as any)['tipo_contacto'] || 'cliente')
    }
  }, [open, value])

  useEffect(() => {
    (async () => {
      const provs = await apiUbicacionesService.getProvincias()
      setProvincias(provs)
      if (provinciaId) {
        const ciuds = await apiUbicacionesService.getCiudadesByProvincia(provinciaId)
        setCiudades(ciuds)
      }
    })()
  }, [open])
  useEffect(() => {
    if (!provinciaId) { setCiudades([]); setCiudadId(undefined); return }
    (async () => {
      const ciuds = await apiUbicacionesService.getCiudadesByProvincia(provinciaId)
      setCiudades(ciuds)
    })()
  }, [provinciaId])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Editar contacto` : `Nuevo contacto`}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <Label>Tipo de contacto *</Label>
            <Select value={tipoContacto} onValueChange={(v) => { setTipoContacto(v as any); (value as any).tipo_contacto = v }}>
              <SelectTrigger><SelectValue placeholder="Seleccionar tipo" /></SelectTrigger>
              <SelectContent>
                {canVerClientes && <SelectItem value="cliente">Cliente</SelectItem>}
                {canVerProveedores && <SelectItem value="proveedor">Proveedor</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="es_empresa" checked={esEmpresa} onCheckedChange={(v) => { const b = !!v; setEsEmpresa(b); (value as any).es_empresa = b }} />
            <Label htmlFor="es_empresa">Es empresa</Label>
          </div>
          <div className="grid gap-1">
            <Label>{esEmpresa ? 'Razón Social *' : 'Nombre completo *'}</Label>
            <Input defaultValue={value?.nombre_razon_social} onChange={(e) => (value.nombre_razon_social = e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Tipo Identificación</Label>
              <Select defaultValue={value?.tipo_identificacion || undefined} onValueChange={(v) => (value.tipo_identificacion = v as any)}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="LE">LE</SelectItem>
                  <SelectItem value="LC">LC</SelectItem>
                  <SelectItem value="PASAPORTE">PASAPORTE</SelectItem>
                  <SelectItem value="OTRO">OTRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Número Identificación</Label>
              <Input defaultValue={value?.numero_identificacion || ''} onChange={(e) => (value.numero_identificacion = e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Condición ante IVA</Label>
            <Select defaultValue={value?.condicion_iva || undefined} onValueChange={(v) => (value.condicion_iva = v as any)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
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
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {provincias.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Ciudad</Label>
              <Select value={ciudadId ? String(ciudadId) : undefined} onValueChange={(v) => { const id = Number(v); setCiudadId(id); (value as any).ciudad_id = id; const cz = ciudades.find(c => c.id === id); if (cz) (value.codigo_postal = cz.codigo_postal) }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {ciudades.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Código Postal</Label>
              <Input value={value?.codigo_postal || ''} onChange={(e) => (value.codigo_postal = e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => onSubmit({...value, tipo_contacto: tipoContacto})}>{isEdit ? 'Guardar' : 'Crear'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


