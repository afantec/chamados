import api from './api';
import type { Desenvolvedor } from '../types';

export const desenvolvedorService = {
    listar: async (): Promise<Desenvolvedor[]> => {
        const res = await api.get<Desenvolvedor[]>('/desenvolvedores');
        return res.data;
    },

    listarAtivos: async (): Promise<Desenvolvedor[]> => {
        const res = await api.get<Desenvolvedor[]>('/desenvolvedores/ativos');
        return res.data;
    },

    buscarPorId: async (id: number): Promise<Desenvolvedor> => {
        const res = await api.get<Desenvolvedor>(`/desenvolvedores/${id}`);
        return res.data;
    },

    criar: async (dto: Omit<Desenvolvedor, 'id'>): Promise<Desenvolvedor> => {
        const res = await api.post<Desenvolvedor>('/desenvolvedores', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: Omit<Desenvolvedor, 'id'>): Promise<Desenvolvedor> => {
        const res = await api.put<Desenvolvedor>(`/desenvolvedores/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/desenvolvedores/${id}`);
    },
};
