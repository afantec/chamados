# Sustentacao Front

Aplicacao frontend para gerenciamento de demandas da area de sustentacao.

O projeto foi desenvolvido com React, TypeScript, Vite e Material UI, consumindo uma API backend exposta em `http://localhost:8080/api` via proxy local do Vite.

## Objetivo

Centralizar o controle de tarefas de sustentacao, permitindo:

- acompanhamento visual por dashboard
- cadastro e manutencao de tarefas
- detalhamento individual de tarefas
- gerenciamento de desenvolvedores
- manutencao de cadastros auxiliares como tipos, status e versoes

## Stack

- React 18
- TypeScript
- Vite
- Material UI
- MUI X Data Grid
- MUI X Date Pickers
- React Router DOM
- Axios
- Dayjs

## Funcionalidades

### Dashboard

- resumo total de tarefas
- indicadores por status
- contagem de tarefas em andamento
- contagem de tarefas finalizadas
- contagem de bugs
- lista de tarefas recentes

### Tarefas

- listagem em grade com colunas de codigo, descricao, tipo, status, desenvolvedor, data de criacao, prioridade e progresso
- criacao de novas tarefas
- edicao de tarefas existentes
- exclusao de tarefas
- navegacao para tela de detalhe
- filtros por descricao, status, tipo, desenvolvedor, versao e periodo de data de criacao
- validacao de ambiente obrigatorio quando a tarefa estiver finalizada
- associacao de versao somente na edicao
- atualizacao automatica das notas da versao ao editar uma tarefa com versao selecionada

### Detalhe da Tarefa

- exibicao detalhada das informacoes da tarefa
- visualizacao complementar do registro selecionado

### Desenvolvedores

- cadastro e manutencao de desenvolvedores

### Cadastros

- CRUD de tipos
- CRUD de status
- CRUD de versoes
- exibicao das notas da versao com quebra de linha por item
- area ampliada para edicao da descricao da versao

## Rotas da Aplicacao

- `/` Dashboard
- `/tarefas` Listagem de tarefas
- `/tarefas/:id` Detalhe da tarefa
- `/desenvolvedores` Cadastro de desenvolvedores
- `/cadastros` Cadastros auxiliares

## Estrutura do Projeto

```text
src/
  components/
    ConfirmDialog.tsx
    Layout.tsx
  pages/
    Dashboard.tsx
    Desenvolvedores.tsx
    TarefaDetalhe.tsx
    Tarefas.tsx
    Cadastros.tsx
  services/
    anotacaoService.ts
    api.ts
    desenvolvedorService.ts
    statusService.ts
    tarefaService.ts
    tipoService.ts
    versaoService.ts
  types/
    index.ts
  App.tsx
  main.tsx
  theme.ts
```

## Requisitos

- Node.js 18 ou superior
- npm
- backend da aplicacao em execucao na porta `8080`

## Instalacao

```bash
npm install
```

## Execucao em Desenvolvimento

```bash
npm run dev
```

Por padrao, o frontend tenta subir na porta `3000`.
Se a porta estiver ocupada, o Vite usa a proxima porta disponivel.

## Build de Producao

```bash
npm run build
```

## Preview da Build

```bash
npm run preview
```

## Integracao com Backend

O projeto utiliza proxy do Vite para encaminhar chamadas iniciadas com `/api` para o backend local:

- frontend: `http://localhost:3000`
- backend alvo: `http://localhost:8080`
- proxy configurado para `/api`

O proxy remove o header `origin` antes do encaminhamento para evitar problemas de CORS em ambiente local.

## Padrao de Organizacao

- `pages`: telas da aplicacao
- `components`: componentes reutilizaveis
- `services`: comunicacao HTTP com a API
- `types`: contratos TypeScript da aplicacao

## Observacoes

- o frontend depende da disponibilidade da API para carga e persistencia dos dados
- parte dos filtros de tarefas e regras de exibicao sao aplicados localmente no frontend
- o build pode emitir aviso de tamanho de bundle do Vite, mas isso nao impede a compilacao