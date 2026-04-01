import api from './api';
import type { Status } from '../types';

export const statusService = {
    listar: async (): Promise<Status[]> => {
        const res = await api.get<Status[]>('/status');
        return res.data;
    },

    buscarPorId: async (id: number): Promise<Status> => {
        const res = await api.get<Status>(`/status/${id}`);
        return res.data;
    },

    criar: async (dto: Omit<Status, 'id'>): Promise<Status> => {
        const res = await api.post<Status>('/status', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: Omit<Status, 'id'>): Promise<Status> => {
        const res = await api.put<Status>(`/status/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/status/${id}`);
    },
};
