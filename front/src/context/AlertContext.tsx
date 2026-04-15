import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { alertaService } from '../services/alertaService';
import type { TaskAlert, TaskAlertRequest } from '../types';

type AlertContextValue = {
  alerts: TaskAlert[];
  loading: boolean;
  refreshAlerts: () => Promise<void>;
  createAlert: (payload: TaskAlertRequest) => Promise<TaskAlert>;
  deactivateAlert: (id: number) => Promise<void>;
};

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<TaskAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAlerts = useCallback(async () => {
    try {
      const data = await alertaService.listarAtivos();
      setAlerts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshAlerts();
  }, [refreshAlerts]);

  const createAlert = useCallback(async (payload: TaskAlertRequest) => {
    const created = await alertaService.criar(payload);
    setAlerts((prev) => [created, ...prev.filter((item) => item.id !== created.id)]);
    return created;
  }, []);

  const deactivateAlert = useCallback(async (id: number) => {
    await alertaService.desativar(id);
    setAlerts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const value = useMemo(
    () => ({ alerts, loading, refreshAlerts, createAlert, deactivateAlert }),
    [alerts, loading, refreshAlerts, createAlert, deactivateAlert],
  );

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
};

export const useAlerts = (): AlertContextValue => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts deve ser usado dentro de AlertProvider');
  }
  return context;
};
