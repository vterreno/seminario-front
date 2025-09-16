interface UnidadMedida {
  id: number
  nombre: string
  abreviatura: string
  aceptaDecimales: boolean
  empresa_id?: number
}

interface CreateUnidadMedidaData {
  nombre: string
  abreviatura: string
  aceptaDecimales?: boolean
}

interface UpdateUnidadMedidaData {
  nombre?: string
  abreviatura?: string
  aceptaDecimales?: boolean
}

// Note: Replace with your actual API base URL
const API_BASE_URL = 'http://localhost:3001'

class UnidadesMedidaService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error en la petición')
    }

    return response.json()
  }

  async getAll(): Promise<UnidadMedida[]> {
    return this.request<UnidadMedida[]>('/unidad-medida/all')
  }

  async getById(id: number): Promise<UnidadMedida> {
    return this.request<UnidadMedida>(`/unidad-medida/${id}`)
  }

  async create(data: CreateUnidadMedidaData): Promise<UnidadMedida> {
    return this.request<UnidadMedida>('/unidad-medida', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: number, data: UpdateUnidadMedidaData): Promise<UnidadMedida> {
    return this.request<UnidadMedida>(`/unidad-medida/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(id: number): Promise<void> {
    await this.request<void>(`/unidad-medida/${id}`, {
      method: 'DELETE',
    })
  }

  async canDelete(id: number): Promise<{ canDelete: boolean; message?: string }> {
    return this.request<{ canDelete: boolean; message?: string }>(
      `/unidad-medida/${id}/can-delete`
    )
  }
}

export const unidadesMedidaService = new UnidadesMedidaService()
export type { UnidadMedida, CreateUnidadMedidaData, UpdateUnidadMedidaData }