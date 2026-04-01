export type Status = 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO' | 'FECHADO'
export type Prioridade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'

export interface Chamado {
  id?: number
  titulo: string
  descricao: string
  status: Status
  prioridade: Prioridade
  categoria?: string
  solicitante: string
  responsavel?: string
  dataAbertura?: string
  dataFechamento?: string
}

export const STATUS_LABELS: Record<Status, string> = {
  ABERTO: 'Aberto',
  EM_ANDAMENTO: 'Em Andamento',
  RESOLVIDO: 'Resolvido',
  FECHADO: 'Fechado',
}

export const PRIORIDADE_LABELS: Record<Prioridade, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
}

export const STATUS_COLORS: Record<Status, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  ABERTO: 'info',
  EM_ANDAMENTO: 'warning',
  RESOLVIDO: 'success',
  FECHADO: 'default',
}

export const PRIORIDADE_COLORS: Record<Prioridade, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  BAIXA: 'success',
  MEDIA: 'info',
  ALTA: 'warning',
  CRITICA: 'error',
}
