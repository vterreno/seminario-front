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
    return this.request<UnidadMedida[]>('/unidades-medida')
  }

  async getById(id: number): Promise<UnidadMedida> {
    return this.request<UnidadMedida>(`/unidades-medida/${id}`)
  }

  async create(data: CreateUnidadMedidaData): Promise<UnidadMedida> {
    return this.request<UnidadMedida>('/unidades-medida', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: number, data: UpdateUnidadMedidaData): Promise<UnidadMedida> {
    return this.request<UnidadMedida>(`/unidades-medida/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(id: number): Promise<void> {
    await this.request<void>(`/unidades-medida/${id}`, {
      method: 'DELETE',
    })
  }

  async deleteMultiple(ids: number[]): Promise<{ message?: string }> {
    console.log('Deleting unidades with IDs:', ids);
    try {
      const result = await this.request<{ message?: string }>('/unidades-medida/bulk-delete', {
        method: 'DELETE',
        body: JSON.stringify({ ids }),
      });
      console.log('Delete result:', result);
      return result;
    } catch (error) {
      console.error('Error in deleteMultiple:', error);
      throw error;
    }
  }

  async canDelete(id: number): Promise<{ canDelete: boolean; message?: string }> {
    return this.request<{ canDelete: boolean; message?: string }>(
      `/unidades-medida/${id}/can-delete`
    )
  }
}

export const unidadesMedidaService = new UnidadesMedidaService()
export type { UnidadMedida, CreateUnidadMedidaData, UpdateUnidadMedidaData }