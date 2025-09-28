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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  formatIdentificationNumber, 
  cleanIdentificationNumber, 
  getIdentificationPlaceholder, 
  validateIdentificationNumber,
  IdentificationType 
} from '@/utils/identification-formatting'

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
  const [emailError, setEmailError] = useState<string>('')
  const [empresaError, setEmpresaError] = useState<string>('')
  const [nombreError, setNombreError] = useState<string>('')
  const [tipoDocError, setTipoDocError] = useState<string>('')
  const [numeroDocError, setNumeroDocError] = useState<string>('')
  const [formatError, setFormatError] = useState<string>('')
  
  // Estados para controlar los popovers
  const [openProvincia, setOpenProvincia] = useState(false)
  const [openCiudad, setOpenCiudad] = useState(false)
  
  // Estados controlados para los campos principales
  const [nombreRazonSocial, setNombreRazonSocial] = useState<string>('')
  const [tipoIdentificacion, setTipoIdentificacion] = useState<string>('')
  const [numeroIdentificacion, setNumeroIdentificacion] = useState<string>('')
  const [condicionIva, setCondicionIva] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [telefono, setTelefono] = useState<string>('')
  const [direccionCalle, setDireccionCalle] = useState<string>('')
  const [direccionNumero, setDireccionNumero] = useState<string>('')
  const [direccionPisoDpto, setDireccionPisoDpto] = useState<string>('')
  const [codigoPostal, setCodigoPostal] = useState<string>('')
  
  // Usar un nombre diferente para evitar conflictos
  const rolState = useState<'cliente' | 'proveedor'>((value.rol === 'ambos' ? 'cliente' : value.rol) || 'cliente')
  const rol = rolState[0]
  const setRol = rolState[1]

  // Función para validar email
  const validateEmail = (email: string): boolean => {
    if (!email) return true // Email vacío es válido (no es obligatorio)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Función para validar el formulario completo
  const validateForm = (): boolean => {
    let isValid = true
    
    // Validar email (solo formato, no obligatorio)
    if (email && !validateEmail(email)) {
      setEmailError('Ingrese un email válido')
      isValid = false
    } else {
      setEmailError('')
    }
    
    // Validar empresa (obligatorio si es superadmin)
    if (isSuperAdmin && !empresaId) {
      setEmpresaError('La empresa es obligatoria')
      isValid = false
    } else {
      setEmpresaError('')
    }

    // Validar nombre o razón social (obligatorio)
    if (!nombreRazonSocial || nombreRazonSocial.trim() === '') {
      setNombreError('El nombre o razón social es obligatorio')
      isValid = false
    } else {
      setNombreError('')
    }

    // Validar documentos: si hay tipo, número es obligatorio
    if (tipoIdentificacion && tipoIdentificacion !== 'NONE' && (!numeroIdentificacion || numeroIdentificacion.trim() === '')) {
      setNumeroDocError('El número de identificación es obligatorio cuando se selecciona un tipo')
      setFormatError('')
      isValid = false
    } else if (tipoIdentificacion && tipoIdentificacion !== 'NONE' && numeroIdentificacion) {
      // Validar formato del número de identificación
      const formatValidation = validateIdentificationNumber(numeroIdentificacion, tipoIdentificacion as IdentificationType)
      if (!formatValidation.isValid) {
        setFormatError(formatValidation.message || 'Formato inválido')
        setNumeroDocError('')
        isValid = false
      } else {
        setFormatError('')
        setNumeroDocError('')
      }
    } else {
      setNumeroDocError('')
      setFormatError('')
    }

    // Limpiar error de tipo si no hay tipo seleccionado
    if (!tipoIdentificacion || tipoIdentificacion === 'NONE') {
      setTipoDocError('')
      setFormatError('')
    }
    
    return isValid
  }

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
    setEmpresaId(value.empresa?.id || value.empresa_id || undefined)
    
    // Inicializar estados controlados
    setNombreRazonSocial(value.nombre_razon_social || '')
    setTipoIdentificacion(value.tipo_identificacion || 'NONE')
    
    // Aplicar formato al número de identificación existente si hay tipo
    const rawNumber = value.numero_identificacion || ''
    if (rawNumber && value.tipo_identificacion && value.tipo_identificacion !== 'NONE') {
      const formattedNumber = formatIdentificationNumber(rawNumber, value.tipo_identificacion as IdentificationType)
      setNumeroIdentificacion(formattedNumber)
    } else {
      setNumeroIdentificacion(rawNumber)
    }
    setCondicionIva(value.condicion_iva || '')
    setEmail(value.email || '')
    setTelefono(value.telefono_movil || '')
    setDireccionCalle(value.direccion_calle || '')
    setDireccionNumero(value.direccion_numero || '')
    setDireccionPisoDpto(value.direccion_piso_dpto || '')
    setCodigoPostal(value.codigo_postal || '')
    
    // Limpiar errores de validación al cambiar el valor
    setEmailError('')
    setEmpresaError('')
    setNombreError('')
    setTipoDocError('')
    setNumeroDocError('')
    setFormatError('')
    
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
      // Limpiar también el código postal
      setCodigoPostal('')
      return 
    }
    
    (async () => {
      const ciuds = await apiUbicacionesService.getCiudadesByProvincia(provinciaId)
      setCiudades(ciuds)
      
      // Si el provinciaId cambió por una acción del usuario (no por inicialización)
      // entonces limpiar la ciudad. Si la ciudad existe en las nuevas ciudades, mantenerla
      if (ciudadId && !ciuds.some(c => c.id === ciudadId)) {
        setCiudadId(undefined)
        setCodigoPostal('')
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
              <Select 
                value={empresaId ? String(empresaId) : undefined} 
                onValueChange={(v) => { 
                  const id = Number(v); 
                  setEmpresaId(id); 
                  // Limpiar error al seleccionar
                  setEmpresaError('')
                }}
              >
                <SelectTrigger className={`w-full ${empresaError ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(empresa => (
                    <SelectItem key={empresa.id} value={String(empresa.id)}>
                      {empresa.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {empresaError && <span className="text-sm text-red-500">{empresaError}</span>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox id="es_empresa" checked={esEmpresa} onCheckedChange={(v) => { const b = !!v; setEsEmpresa(b) }} />
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
              onCheckedChange={(v) => { setEstado(v) }}
            />
          </div>
          <div className="grid gap-1">
            <Label>{esEmpresa ? 'Razón social *' : 'Nombre completo *'}</Label>
            <Input 
              value={nombreRazonSocial} 
              onChange={(e) => {
                setNombreRazonSocial(e.target.value)
                if (e.target.value.trim() !== '') {
                  setNombreError('')
                }
              }} 
              className={`${nombreError ? 'border-red-500' : ''}`}  
            />
            {nombreError && <span className="text-sm text-red-500">{nombreError}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label>Tipo de identificación</Label>
              <Select 
                value={tipoIdentificacion} 
                onValueChange={(v) => {
                  setTipoIdentificacion(v);
                  // Limpiar errores al seleccionar
                  setTipoDocError('');
                  setFormatError('');
                  // Si se selecciona un tipo y no hay número, mostrar error
                  if (v && v !== 'NONE' && (!numeroIdentificacion || numeroIdentificacion.trim() === '')) {
                    setNumeroDocError('El número de identificación es obligatorio cuando se selecciona un tipo');
                  } else {
                    setNumeroDocError('');
                  }
                  // Si se deselecciona el tipo, limpiar también el número
                  if (!v || v === 'NONE') {
                    setNumeroIdentificacion('');
                    setNumeroDocError('');
                    setFormatError('');
                  }
                  // Si se selecciona un tipo y hay un número, aplicar formato
                  if (v && v !== 'NONE' && numeroIdentificacion) {
                    const formatted = formatIdentificationNumber(numeroIdentificacion, v as IdentificationType);
                    setNumeroIdentificacion(formatted);
                  }
                }}
              >
                <SelectTrigger className={`w-full ${tipoDocError ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">Sin tipo de identificación</SelectItem>
                  <SelectItem value="CUIT">CUIT</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="CUIL">CUIL</SelectItem>
                  <SelectItem value="PASAPORTE">PASAPORTE</SelectItem>
                  <SelectItem value="OTRO">OTRO</SelectItem>
                </SelectContent>
              </Select>
              {tipoDocError && <span className="text-sm text-red-500">{tipoDocError}</span>}
            </div>
            <div className="grid gap-1">
              <Label>Número de identificación {(tipoIdentificacion && tipoIdentificacion !== 'NONE') ? '*' : ''}</Label>
              <Input 
                value={numeroIdentificacion} 
                placeholder={tipoIdentificacion && tipoIdentificacion !== 'NONE' ? getIdentificationPlaceholder(tipoIdentificacion as IdentificationType) : ''}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  let formattedValue = rawValue;
                  
                  // Aplicar formato si hay un tipo seleccionado
                  if (tipoIdentificacion && tipoIdentificacion !== 'NONE') {
                    formattedValue = formatIdentificationNumber(rawValue, tipoIdentificacion as IdentificationType);
                  }
                  
                  setNumeroIdentificacion(formattedValue);
                  
                  // Validar en tiempo real
                  if (tipoIdentificacion && tipoIdentificacion !== 'NONE' && (!rawValue || rawValue.trim() === '')) {
                    setNumeroDocError('El número de identificación es obligatorio cuando se selecciona un tipo');
                    setFormatError('');
                  } else if (tipoIdentificacion && tipoIdentificacion !== 'NONE' && rawValue) {
                    // Validar formato
                    const formatValidation = validateIdentificationNumber(formattedValue, tipoIdentificacion as IdentificationType);
                    if (!formatValidation.isValid) {
                      setFormatError(formatValidation.message || 'Formato inválido');
                      setNumeroDocError('');
                    } else {
                      setFormatError('');
                      setNumeroDocError('');
                    }
                  } else {
                    setNumeroDocError('');
                    setFormatError('');
                  }
                }}
                className={`${numeroDocError || formatError ? 'border-red-500' : ''}`}
                disabled={!tipoIdentificacion || tipoIdentificacion === 'NONE'}
              />
              {numeroDocError && <span className="text-sm text-red-500">{numeroDocError}</span>}
              {formatError && <span className="text-sm text-red-500">{formatError}</span>}
            </div>
          </div>
          <div className="grid gap-1">
            <Label>Condición IVA</Label>
            <Select value={condicionIva} onValueChange={(v) => setCondicionIva(v)}>
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
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => {
                  setEmail(e.target.value);
                  // Validar en tiempo real
                  if (e.target.value && !validateEmail(e.target.value)) {
                    setEmailError('Ingrese un email válido')
                  } else {
                    setEmailError('')
                  }
                }}
                className={emailError ? 'border-red-500' : ''}
              />
              {emailError && <span className="text-sm text-red-500">{emailError}</span>}
            </div>
            <div className="grid gap-1">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label>Calle</Label>
              <Input value={direccionCalle} onChange={(e) => setDireccionCalle(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Número</Label>
              <Input value={direccionNumero} onChange={(e) => setDireccionNumero(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Piso/Dpto</Label>
              <Input value={direccionPisoDpto} onChange={(e) => setDireccionPisoDpto(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1">
              <Label>Provincia</Label>
              <Popover open={openProvincia} onOpenChange={setOpenProvincia}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProvincia}
                    className="w-full justify-between"
                  >
                    {provinciaId
                      ? provincias.find((provincia) => provincia.id === provinciaId)?.nombre
                      : "Seleccionar provincia..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar provincia..." />
                    <CommandEmpty>No se encontró provincia.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {provincias.map((provincia) => (
                          <CommandItem
                            key={provincia.id}
                            value={provincia.nombre}
                            onSelect={() => {
                              setProvinciaId(provincia.id)
                              setOpenProvincia(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                provinciaId === provincia.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {provincia.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-1">
              <Label>Ciudad</Label>
              <Popover open={openCiudad} onOpenChange={setOpenCiudad}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCiudad}
                    className="w-full justify-between"
                    disabled={!provinciaId}
                  >
                    {ciudadId
                      ? ciudades.find((ciudad) => ciudad.id === ciudadId)?.nombre
                      : "Seleccionar ciudad..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar ciudad..." />
                    <CommandEmpty>No se encontró ciudad.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {ciudades.map((ciudad) => (
                          <CommandItem
                            key={ciudad.id}
                            value={ciudad.nombre}
                            onSelect={() => {
                              setCiudadId(ciudad.id)
                              const cz = ciudades.find(c => c.id === ciudad.id)
                              if (cz) setCodigoPostal(cz.codigo_postal)
                              setOpenCiudad(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                ciudadId === ciudad.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {ciudad.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-1">
              <Label>Código postal</Label>
              <Input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => {
            // Validar formulario antes de enviar
            if (!validateForm()) {
              return
            }
            
            const finalData: any = {
              // Usar los estados controlados en lugar del objeto value
              nombre_razon_social: nombreRazonSocial,
              tipo_identificacion: (tipoIdentificacion && tipoIdentificacion !== 'NONE') ? tipoIdentificacion : undefined,
              numero_identificacion: (numeroIdentificacion && numeroIdentificacion !== '') ? cleanIdentificationNumber(numeroIdentificacion) : undefined,
              condicion_iva: condicionIva || undefined,
              email: email || undefined,
              telefono_movil: telefono || undefined,
              direccion_calle: direccionCalle || undefined,
              direccion_numero: direccionNumero || undefined,
              direccion_piso_dpto: direccionPisoDpto || undefined,
              codigo_postal: codigoPostal || undefined,
              rol, 
              estado, 
              empresa_id: empresaId,
              provincia_id: provinciaId,
              ciudad_id: ciudadId,
              es_empresa: esEmpresa
            };
            
            // Si estamos editando, incluir el ID
            if (isEdit && value.id) {
              finalData.id = value.id;
            }
            
            // Limpiar campos undefined/null para evitar problemas en el backend
            Object.keys(finalData).forEach(key => {
              if (finalData[key] === undefined || finalData[key] === null || finalData[key] === '') {
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


