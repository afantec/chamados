import axios from 'axios'
import type { Chamado, Status } from '../types/chamado'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const chamadoService = {
  async getAll(): Promise<Chamado[]> {
    const response = await api.get<Chamado[]>('/chamados')
    return response.data
  },

  async getById(id: number): Promise<Chamado> {
    const response = await api.get<Chamado>(`/chamados/${id}`)
    return response.data
  },

  async getByStatus(status: Status): Promise<Chamado[]> {
    const response = await api.get<Chamado[]>(`/chamados/status/${status}`)
    return response.data
  },

  async create(chamado: Chamado): Promise<Chamado> {
    const response = await api.post<Chamado>('/chamados', chamado)
    return response.data
  },

  async update(id: number, chamado: Chamado): Promise<Chamado> {
    const response = await api.put<Chamado>(`/chamados/${id}`, chamado)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/chamados/${id}`)
  },
}
