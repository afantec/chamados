export interface Tipo {
    id: number;
    descricao: string;
}

export interface Status {
    id: number;
    descricao: string;
}

export interface Desenvolvedor {
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
}

export interface Versao {
    id: number;
    numeroVersao: string;
    dataCadastro?: string;
    descricao?: string;
}

export interface Anotacao {
    id: number;
    descricao: string;
    dataAnotacao: string;
    tarefaId: number;
}

export interface AnotacaoRequest {
    descricao: string;
    tarefaId: number;
}

export interface ArquivoTarefa {
    id: number;
    tarefaId: number;
    nomeOriginal: string;
    tamanhoBytes: number;
    contentType?: string;
    extensao?: string;
    dataUpload: string;
}

export interface Tarefa {
    id: number;
    codigo: string;
    descricao: string;
    tipo: Tipo;
    desenvolvedor?: Desenvolvedor;
    status: Status;
    versao?: Versao;
    prioridade: number;
    percentualCompleto: number;
    branchNome?: string;
    dataCriacao: string;
    dataEntrega?: string;
    dataFinalizacao?: string;
    ambiente?: string;
    anotacoes?: Anotacao[];
}

export interface TarefaRequest {
    codigo: string;
    descricao: string;
    tipoId: number;
    desenvolvedorId?: number | null;
    statusId: number;
    versaoId?: number | null;
    prioridade: number;
    percentualCompleto: number;
    branchNome?: string;
    dataEntrega?: string | null;
    dataFinalizacao?: string | null;
    ambiente?: string;
}

export interface FiltrosTarefa {
    descricao?: string;
    statusId?: number | null;
    desenvolvedorId?: number | null;
    tipoId?: number | null;
    versaoId?: number | null;
    dataCriacaoInicio?: string | null;
    dataCriacaoFim?: string | null;
}
