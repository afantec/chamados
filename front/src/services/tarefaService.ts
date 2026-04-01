import api from './api';
import type { Tarefa, TarefaRequest, FiltrosTarefa } from '../types';

export const tarefaService = {
    listar: async (filtros?: FiltrosTarefa): Promise<Tarefa[]> => {
        const params: Record<string, unknown> = {};
        if (filtros?.descricao) params.descricao = filtros.descricao;
        if (filtros?.statusId) params.statusId = filtros.statusId;
        if (filtros?.desenvolvedorId) params.desenvolvedorId = filtros.desenvolvedorId;
        if (filtros?.tipoId) params.tipoId = filtros.tipoId;
        if (filtros?.versaoId) params.versaoId = filtros.versaoId;
        const res = await api.get<Tarefa[]>('/tarefas', { params });
        return res.data;
    },

    buscarPorId: async (id: number): Promise<Tarefa> => {
        const res = await api.get<Tarefa>(`/tarefas/${id}`);
        return res.data;
    },

    criar: async (dto: TarefaRequest): Promise<Tarefa> => {
        const res = await api.post<Tarefa>('/tarefas', dto);
        return res.data;
    },

    atualizar: async (id: number, dto: TarefaRequest): Promise<Tarefa> => {
        const res = await api.put<Tarefa>(`/tarefas/${id}`, dto);
        return res.data;
    },

    deletar: async (id: number): Promise<void> => {
        await api.delete(`/tarefas/${id}`);
    },
};
