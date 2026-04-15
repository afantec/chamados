import api from './api';
import type { TaskAlert, TaskAlertRequest } from '../types';

export const alertaService = {
    listarAtivos: async (): Promise<TaskAlert[]> => {
        const res = await api.get<TaskAlert[]>('/alertas/ativos');
        return res.data;
    },

    listarPorTarefa: async (tarefaId: number): Promise<TaskAlert[]> => {
        const res = await api.get<TaskAlert[]>(`/alertas/tarefa/${tarefaId}`);
        return res.data;
    },

    criar: async (dto: TaskAlertRequest): Promise<TaskAlert> => {
        const res = await api.post<TaskAlert>('/alertas', dto);
        return res.data;
    },

    desativar: async (id: number): Promise<TaskAlert> => {
        const res = await api.patch<TaskAlert>(`/alertas/${id}/desativar`);
        return res.data;
    },
};
