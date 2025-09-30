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
import { Categoria } from '../data/schema'
import apiCategoriasService from '@/service/apiCategorias.service'
import { toast } from 'sonner'
import { getStorageItem } from '@/hooks/use-local-storage'
import { STORAGE_KEYS } from '@/lib/constants'

type CategoriasSelectorProps = {
  value?: number
  onSelect: (value: number) => void
  disabled?: boolean
  placeholder?: string
}

export function CategoriasSelector({ 
  value, 
  onSelect,
  disabled = false,
  placeholder = "Seleccionar categoría..." 
}: CategoriasSelectorProps) {
  const [open, setOpen] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)

  // Obtener datos del usuario desde localStorage
  const userData = getStorageItem(STORAGE_KEYS.USER_DATA, null) as any
  const userEmpresaId = userData?.empresa?.id

  useEffect(() => {
    fetchCategorias()
  }, [])

  const fetchCategorias = async () => {
    try {
      setLoading(true)
      let data: Categoria[]
      
      if (userEmpresaId) {
        data = await apiCategoriasService.getCategoriasByEmpresa(userEmpresaId)
      } else {
        data = await apiCategoriasService.getAllCategorias()
      }
      
      setCategorias(data)
    } catch (error) {
      console.error('Error fetching categorias:', error)
      toast.error('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategoria = categorias.find(categoria => categoria.id === value)

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
          {value && selectedCategoria
            ? selectedCategoria.nombre
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar categoría..." />
          <CommandEmpty>No se encontraron categorías.</CommandEmpty>
          <CommandGroup>
            {categorias.map((categoria) => (
              <CommandItem
                key={categoria.id}
                value={categoria.nombre}
                onSelect={() => {
                  onSelect(categoria.id!)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === categoria.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {categoria.nombre}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
