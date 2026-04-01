import api from './api';
import type { Versao } from '../types';

export const versaoService = {
    listar: async (): Promise<Versao[]> => {
        const res = await api.get<Versao[]>('/versoes');
        return res.data;
    },

    buscarPorId: async (id: number): Promise<Versao> => {
        const res = await api.get<Versao>(`/versoes/${id}`);
        return res.data;
    },

    criar: async (dto: Omit<Versao, 'id'>): Promise<Versao> => {
        const res = await api.post<Versao>('/versoes', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: Omit<Versao, 'id'>): Promise<Versao> => {
        const res = await api.put<Versao>(`/versoes/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/versoes/${id}`);
    },
};
