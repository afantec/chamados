# Sustentacao API

API REST para gestao de demandas da area de sustentacao.

## Stack

- Java 17
- Spring Boot 3.2.3
- Spring Web
- Spring Data JPA
- Spring Validation
- PostgreSQL
- Maven

## Configuracao atual

Arquivo de configuracao: `src/main/resources/application.properties`

- Porta da aplicacao: `8080`
- URL do banco: `jdbc:postgresql://localhost:5432/db_certezza`
- Usuario do banco: `sustentacao`
- Senha do banco: `sustentacao`
- `spring.jpa.hibernate.ddl-auto=update`
- CORS liberado para `http://localhost:3000` em rotas `/api/**`

## Como subir o projeto

### 1) Pre-requisitos

- Java 17 instalado
- Maven instalado
- PostgreSQL rodando localmente

### 2) Iniciar o PostgreSQL

Escolha uma das opcoes abaixo.

Windows (servico):

```powershell
Get-Service *postgres*
Start-Service postgresql-x64-17
```

Docker:

```bash
docker run --name postgres-certezza \
  -e POSTGRES_USER=sustentacao \
  -e POSTGRES_PASSWORD=sustentacao \
  -e POSTGRES_DB=db_certezza \
  -p 5432:5432 -d postgres:16
```

### 3) Criar banco e usuario no PostgreSQL

Exemplo via `psql`:

```sql
CREATE DATABASE db_certezza;
CREATE USER sustentacao WITH PASSWORD 'sustentacao';
GRANT ALL PRIVILEGES ON DATABASE db_certezza TO sustentacao;
```

Se o banco ja existir e voce criou o usuario novo, rode apenas:

```sql
GRANT ALL PRIVILEGES ON DATABASE db_certezza TO sustentacao;
```

### 4) Rodar a aplicacao Spring

Na raiz do projeto:

Atualize o classpath de runtime (necessario apos alterar dependencias no `pom.xml`):

```bash
.\.tools\apache-maven-3.9.9\bin\mvn.cmd -q -DskipTests dependency:build-classpath "-Dmdep.outputFile=.tools/runtime-classpath.txt"
```

Execucao direta com Java:

```bash
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot'; $env:Path="$env:JAVA_HOME\bin;$env:Path"; $runtimeCp = Get-Content '.\.tools\runtime-classpath.txt' -Raw; $argFile = Join-Path $PWD '.tools\run-api.args'; Set-Content -Path $argFile -Value @('-cp', ((Resolve-Path '.\target\classes').Path + ';' + $runtimeCp.Trim()), 'com.sustentacao.SustentacaoApplication'); & "$env:JAVA_HOME\bin\java.exe" "@$argFile"
```

Ou via Spring Boot Maven Plugin:

```bash
mvn clean spring-boot:run
```

A API vai iniciar em:

- `http://localhost:8080`

Documentacao Swagger/OpenAPI:

- UI do Swagger: `http://localhost:8080/swagger-ui.html`
- JSON OpenAPI: `http://localhost:8080/api-docs`

### 5) Criacao das tabelas

As tabelas sao criadas/atualizadas automaticamente ao subir a aplicacao porque a configuracao atual usa:

- `spring.jpa.hibernate.ddl-auto=update`

Ou seja, depois do primeiro start do Spring, as tabelas das entidades devem existir no banco `db_certezza`.

Para validar via `psql`:

```sql
\dt
```

Se as tabelas nao aparecerem, normalmente o usuario da aplicacao nao tem permissao no schema `public`.
Conecte com um usuario administrador e execute:

```sql
GRANT USAGE, CREATE ON SCHEMA public TO sustentacao;
ALTER SCHEMA public OWNER TO sustentacao;
```

Depois, reinicie a aplicacao:

```bash
mvn clean spring-boot:run
```

### 6) (Opcional) Carga de dados iniciais

Existe o script:

- `src/main/resources/data-inicial.sql`

Ele possui inserts de `tipo` e `status`.
Se quiser executar manualmente:

```bash
psql -U sustentacao -d db_certezza -f src/main/resources/data-inicial.sql
```

## Estrutura da API

Base URL: `http://localhost:8080`

### Endpoints de tarefas

| Metodo | Rota                                                                   | Descricao                   |
| ------ | ---------------------------------------------------------------------- | --------------------------- |
| GET    | `/api/tarefas`                                                         | Lista tarefas               |
| GET    | `/api/tarefas?descricao=&statusId=&desenvolvedorId=&tipoId=&versaoId=` | Lista com filtros opcionais |
| GET    | `/api/tarefas/{id}`                                                    | Busca tarefa por id         |
| POST   | `/api/tarefas`                                                         | Cria tarefa                 |
| PUT    | `/api/tarefas/{id}`                                                    | Atualiza tarefa             |
| DELETE | `/api/tarefas/{id}`                                                    | Remove tarefa               |

Request body (`POST`/`PUT`):

```json
{
  "codigo": "SUP-123",
  "descricao": "Corrigir erro na importacao",
  "tipoId": 1,
  "desenvolvedorId": 1,
  "statusId": 2,
  "versaoId": 1,
  "prioridade": 5,
  "percentualCompleto": 40,
  "branchNome": "feature/sup-123",
  "dataEntrega": "2026-04-10",
  "dataFinalizacao": null,
  "ambiente": "HOMOLOG"
}
```

Campos com validacao:

- `codigo` obrigatorio
- `descricao` obrigatoria
- `tipoId` obrigatorio
- `statusId` obrigatorio
- `prioridade` obrigatoria (1 a 10)
- `percentualCompleto` opcional (0 a 100)

### Endpoints de anotacoes

| Metodo | Rota                               | Descricao                  |
| ------ | ---------------------------------- | -------------------------- |
| GET    | `/api/anotacoes/tarefa/{tarefaId}` | Lista anotacoes por tarefa |
| GET    | `/api/anotacoes/{id}`              | Busca anotacao por id      |
| POST   | `/api/anotacoes`                   | Cria anotacao              |
| PUT    | `/api/anotacoes/{id}`              | Atualiza anotacao          |
| DELETE | `/api/anotacoes/{id}`              | Remove anotacao            |

Request body (`POST`/`PUT`):

```json
{
  "descricao": "Erro reproduzido em homologacao",
  "tarefaId": 1
}
```

Campos com validacao:

- `descricao` obrigatoria
- `tarefaId` obrigatorio

### Endpoints de desenvolvedores

| Metodo | Rota                          | Descricao              |
| ------ | ----------------------------- | ---------------------- |
| GET    | `/api/desenvolvedores`        | Lista desenvolvedores  |
| GET    | `/api/desenvolvedores/ativos` | Lista somente ativos   |
| GET    | `/api/desenvolvedores/{id}`   | Busca por id           |
| POST   | `/api/desenvolvedores`        | Cria desenvolvedor     |
| PUT    | `/api/desenvolvedores/{id}`   | Atualiza desenvolvedor |
| DELETE | `/api/desenvolvedores/{id}`   | Remove desenvolvedor   |

Request body (`POST`/`PUT`):

```json
{
  "nome": "Maria Silva",
  "email": "maria.silva@empresa.com",
  "ativo": true
}
```

### Endpoints de status

| Metodo | Rota               | Descricao           |
| ------ | ------------------ | ------------------- |
| GET    | `/api/status`      | Lista status        |
| GET    | `/api/status/{id}` | Busca status por id |
| POST   | `/api/status`      | Cria status         |
| PUT    | `/api/status/{id}` | Atualiza status     |
| DELETE | `/api/status/{id}` | Remove status       |

Request body (`POST`/`PUT`):

```json
{
  "descricao": "Em validacao"
}
```

### Endpoints de tipos

| Metodo | Rota              | Descricao         |
| ------ | ----------------- | ----------------- |
| GET    | `/api/tipos`      | Lista tipos       |
| GET    | `/api/tipos/{id}` | Busca tipo por id |
| POST   | `/api/tipos`      | Cria tipo         |
| PUT    | `/api/tipos/{id}` | Atualiza tipo     |
| DELETE | `/api/tipos/{id}` | Remove tipo       |

Request body (`POST`/`PUT`):

```json
{
  "descricao": "Infra"
}
```

### Endpoints de versoes

| Metodo | Rota                | Descricao           |
| ------ | ------------------- | ------------------- |
| GET    | `/api/versoes`      | Lista versoes       |
| GET    | `/api/versoes/{id}` | Busca versao por id |
| POST   | `/api/versoes`      | Cria versao         |
| PUT    | `/api/versoes/{id}` | Atualiza versao     |
| DELETE | `/api/versoes/{id}` | Remove versao       |

Request body (`POST`/`PUT`):

```json
{
  "numeroVersao": "2026.04",
  "dataCadastro": "2026-03-31",
  "descricao": "Release mensal"
}
```

## Formato de erro da API

Erros sao retornados no formato:

```json
{
  "mensagem": "texto do erro"
}
```

Casos tratados globalmente:

- `RuntimeException` -> HTTP 404
- `IllegalArgumentException` -> HTTP 400
- `MethodArgumentNotValidException` -> HTTP 400

Exemplo de validacao:

```json
{
  "mensagem": "codigo: Codigo e obrigatorio; prioridade: Prioridade minima e 1"
}
```

## Teste rapido com curl

```bash
curl -X GET http://localhost:8080/api/status
```

```bash
curl -X POST http://localhost:8080/api/tarefas \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "SUP-999",
    "descricao": "Ajustar consulta",
    "tipoId": 1,
    "statusId": 1,
    "prioridade": 3
  }'
```
