import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { UnidadMedidaFormDialog } from './components/unidad-medida-form-dialog'
import {
  type UnidadMedida,
  type CreateUnidadMedidaData,
  type UpdateUnidadMedidaData,
} from '@/service/apiUnidadesMedida.service'
import apiUnidadesMedida from '@/service/apiUnidadesMedida.service'
import { toast } from 'sonner'

export function SettingsUnidadesMedida() {
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [loading, setLoading] = useState(true)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUnidad, setSelectedUnidad] = useState<UnidadMedida | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadUnidadesMedida()
  }, [])

  const loadUnidadesMedida = async () => {
    try {
      setLoading(true)
      const data = await apiUnidadesMedida.getAll()
      setUnidadesMedida(data)
    } catch (error) {
      toast.error('Error al cargar las unidades de medida')
      console.error('Error loading unidades de medida:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedUnidad(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (unidad: UnidadMedida) => {
    setSelectedUnidad(unidad)
    setFormDialogOpen(true)
  }

  const handleDelete = (unidad: UnidadMedida) => {
    setSelectedUnidad(unidad)
    setDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (data: CreateUnidadMedidaData | UpdateUnidadMedidaData) => {
    try {
      setSubmitting(true)
      
      if (selectedUnidad) {
        // Editar unidad existente
        await apiUnidadesMedida.update(selectedUnidad.id, data)
        toast.success('Unidad de medida actualizada exitosamente')
      } else {
        // Crear nueva unidad
        await apiUnidadesMedida.create(data as CreateUnidadMedidaData)
        toast.success('Unidad de medida creada exitosamente')
      }
      
      setFormDialogOpen(false)
      setSelectedUnidad(null)
      await loadUnidadesMedida()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      
      if (errorMessage.includes('unique') || errorMessage.includes('duplicad')) {
        toast.error('Ya existe una unidad de medida con ese nombre o abreviatura')
      } else {
        toast.error(`Error al ${selectedUnidad ? 'actualizar' : 'crear'} la unidad de medida: ${errorMessage}`)
      }
      console.error('Error submitting form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!selectedUnidad) return

    try {
      setSubmitting(true)
      
      // Verificar si se puede eliminar
      const { canDelete, message } = await apiUnidadesMedida.canDelete(selectedUnidad.id)
      
      if (!canDelete) {
        toast.error(message || 'No se puede eliminar esta unidad de medida porque está siendo utilizada')
        setDeleteDialogOpen(false)
        setSelectedUnidad(null)
        return
      }
      
      await apiUnidadesMedida.delete(selectedUnidad.id)
      toast.success('Unidad de medida eliminada exitosamente')
      
      setDeleteDialogOpen(false)
      setSelectedUnidad(null)
      await loadUnidadesMedida()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al eliminar la unidad de medida: ${errorMessage}`)
      console.error('Error deleting unidad de medida:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Cargando unidades de medida...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Unidades de Medida</h1>
          <p className="text-muted-foreground">
            Gestiona las unidades de medida para la cuantificación de productos
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Unidad
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unidades de Medida Configuradas</CardTitle>
          <CardDescription>
            Lista de todas las unidades de medida disponibles en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unidadesMedida.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No hay unidades de medida configuradas
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primera Unidad
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Abreviatura</TableHead>
                  <TableHead>Acepta Decimales</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidadesMedida.map((unidad) => (
                  <TableRow key={unidad.id}>
                    <TableCell className="font-medium">{unidad.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{unidad.abreviatura}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {unidad.aceptaDecimales ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-green-600">Sí</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-red-600">No</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(unidad)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(unidad)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <UnidadMedidaFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        unidadMedida={selectedUnidad}
        onSubmit={handleFormSubmit}
        isLoading={submitting}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              unidad de medida "{selectedUnidad?.nombre}" del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={submitting}>
              {submitting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}