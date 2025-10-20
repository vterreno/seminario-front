import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import apiContactosService, { type Contacto } from '@/service/apiContactos.service'
import { toast } from 'sonner'

type ContactosSelectorProps = {
  value?: number
  onSelect: (value: number) => void
  disabled?: boolean
  placeholder?: string
}

export function ContactosSelector({ 
  value, 
  onSelect,
  disabled = false,
  placeholder = "Seleccionar cliente..." 
}: ContactosSelectorProps) {
  const [open, setOpen] = useState(false)
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchContactos()
  }, [])

  const fetchContactos = async () => {
    try {
      setLoading(true)
      const data = await apiContactosService.getClientesAll()
      setContactos(data)
    } catch (error) {
      console.error('Error fetching contactos:', error)
      toast.error('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  const selectedContacto = contactos.find(contacto => contacto.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {value && selectedContacto
            ? selectedContacto.nombre_razon_social
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar cliente..." />
          <CommandEmpty>No se encontraron clientes.</CommandEmpty>
          <CommandGroup>
            {contactos.map((contacto) => (
              <CommandItem
                key={contacto.id}
                value={contacto.nombre_razon_social}
                onSelect={() => {
                  onSelect(contacto.id!)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === contacto.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {contacto.nombre_razon_social}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
