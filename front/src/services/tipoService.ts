import api from './api';
import type { Tipo } from '../types';

export const tipoService = {
    listar: async (): Promise<Tipo[]> => {
        const res = await api.get<Tipo[]>('/tipos');
        return res.data;
    },

    buscarPorId: async (id: number): Promise<Tipo> => {
        const res = await api.get<Tipo>(`/tipos/${id}`);
        return res.data;
    },

    criar: async (dto: Omit<Tipo, 'id'>): Promise<Tipo> => {
        const res = await api.post<Tipo>('/tipos', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: Omit<Tipo, 'id'>): Promise<Tipo> => {
        const res = await api.put<Tipo>(`/tipos/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/tipos/${id}`);
    },
};
