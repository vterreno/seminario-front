import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'

export interface Provincia { id: number, nombre: string }
export interface Ciudad { id: number, nombre: string, codigo_postal: string, provincia_id: number }

const apiUbicacionesService = {
  getProvincias: async () => (await axiosService.get<Provincia[]>(rutasBack.ubicaciones.provincias)).data,
  getCiudadesByProvincia: async (provinciaId: number) => (await axiosService.get<Ciudad[]>(`${rutasBack.ubicaciones.ciudadesByProvincia}/${provinciaId}`)).data,
}

export default apiUbicacionesService


