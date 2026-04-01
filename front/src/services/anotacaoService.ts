import api from './api';
import type { Anotacao, AnotacaoRequest } from '../types';

export const anotacaoService = {
    listarPorTarefa: async (tarefaId: number): Promise<Anotacao[]> => {
        const res = await api.get<Anotacao[]>(`/anotacoes/tarefa/${tarefaId}`);
        return res.data;
    },

    criar: async (dto: AnotacaoRequest): Promise<Anotacao> => {
        const res = await api.post<Anotacao>('/anotacoes', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: AnotacaoRequest): Promise<Anotacao> => {
        const res = await api.put<Anotacao>(`/anotacoes/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/anotacoes/${id}`);
    },
};
