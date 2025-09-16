import { UnidadMedida, CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from '@/interface/unidades-medida.interface'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'

export class UnidadesMedidaService {
  private baseUrl = `${API_BASE_URL}/unidad-medida`

  async getAll(): Promise<UnidadMedida[]> {
    const response = await fetch(`${this.baseUrl}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar las unidades de medida')
    }
    
    return response.json()
  }

  async getByEmpresa(empresaId?: number): Promise<UnidadMedida[]> {
    const url = empresaId ? `${this.baseUrl}/empresa/${empresaId}` : `${this.baseUrl}/empresa`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar las unidades de medida')
    }
    
    return response.json()
  }

  async getById(id: number): Promise<UnidadMedida> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al cargar la unidad de medida')
    }
    
    return response.json()
  }

  async create(data: CreateUnidadMedidaDto): Promise<UnidadMedida> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear la unidad de medida')
    }
    
    return response.json()
  }

  async update(id: number, data: UpdateUnidadMedidaDto): Promise<UnidadMedida> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar la unidad de medida')
    }
    
    return response.json()
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al eliminar la unidad de medida')
    }
  }

  async createDefaultUnits(empresaId?: number): Promise<UnidadMedida[]> {
    const url = empresaId ? `${this.baseUrl}/create-defaults/${empresaId}` : `${this.baseUrl}/create-defaults`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Error al crear las unidades de medida por defecto')
    }
    
    return response.json()
  }
}

export const unidadesMedidaService = new UnidadesMedidaService()