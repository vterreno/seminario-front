export interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  aceptaDecimales: boolean
  empresa_id?: number
  deletedAt?: Date | null
}

export interface CreateUnidadMedidaDto {
  nombre: string
  abreviatura: string
  aceptaDecimales?: boolean
  empresa_id?: number
}

export interface UpdateUnidadMedidaDto {
  nombre?: string
  abreviatura?: string
  aceptaDecimales?: boolean
}