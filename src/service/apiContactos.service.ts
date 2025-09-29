export interface Contacto {
  id?: number
  nombre_razon_social: string
  tipo_identificacion?: string | null
  numero_identificacion?: string | null
  condicion_iva?: string | null
  email?: string | null
  telefono_movil?: string | null
  direccion_calle?: string | null
  direccion_numero?: string | null
  direccion_piso_dpto?: string | null
  ciudad?: string | null
  provincia?: string | null
  codigo_postal?: string | null
  estado?: boolean
  rol?: 'cliente' | 'proveedor' | 'ambos'
  es_consumidor_final?: boolean
  es_empresa?: boolean
  provincia_id?: number | null
  ciudad_id?: number | null
  empresa_id?: number | null
  empresa?: {
    id: number
    name: string
  } | null
}

import axiosService from '@/api/apiClient'
import { rutasBack } from '@/config/env'

const apiContactosService = {
  // Clientes
  getClientesAll: async () => (await axiosService.get(rutasBack.contactos.clientes.getAll)).data as Contacto[],
  createCliente: async (data: Contacto) => (await axiosService.post(rutasBack.contactos.clientes.post, data)).data as Contacto,
  updateCliente: async (id: number, data: Partial<Contacto>) => (await axiosService.put(`${rutasBack.contactos.clientes.put}/${id}`, data)).data as Contacto,
  updateClientePartial: async (id: number, data: Partial<Contacto>) => (await axiosService.patch(`${rutasBack.contactos.clientes.patch}/${id}`, data)).data,
  bulkEstadoClientes: async (ids: number[], estado: boolean) => (await axiosService.post(rutasBack.contactos.clientes.bulkStatus, { ids, estado })).data,
  deleteCliente: async (id: number) => (await axiosService.delete(`${rutasBack.contactos.clientes.put}/${id}`)).data,

  // Proveedores
  getProveedoresAll: async () => (await axiosService.get(rutasBack.contactos.proveedores.getAll)).data as Contacto[],
  createProveedor: async (data: Contacto) => (await axiosService.post(rutasBack.contactos.proveedores.post, data)).data as Contacto,
  updateProveedor: async (id: number, data: Partial<Contacto>) => (await axiosService.put(`${rutasBack.contactos.proveedores.put}/${id}`, data)).data as Contacto,
  updateProveedorPartial: async (id: number, data: Partial<Contacto>) => (await axiosService.patch(`${rutasBack.contactos.proveedores.patch}/${id}`, data)).data,
  bulkEstadoProveedores: async (ids: number[], estado: boolean) => (await axiosService.post(rutasBack.contactos.proveedores.bulkStatus, { ids, estado })).data,
  deleteProveedor: async (id: number) => (await axiosService.delete(`${rutasBack.contactos.proveedores.put}/${id}`)).data,
}

export default apiContactosService
