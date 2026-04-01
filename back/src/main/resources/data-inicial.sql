-- Script de dados iniciais para o sistema de Sustentação
-- Execute após a criação do banco via Spring (ddl-auto=update)
-- Tipos de demanda
INSERT INTO
    tipo (descricao)
VALUES
    ('Bug') ON CONFLICT DO NOTHING;

INSERT INTO
    tipo (descricao)
VALUES
    ('Melhoria') ON CONFLICT DO NOTHING;

INSERT INTO
    tipo (descricao)
VALUES
    ('Suporte Técnico') ON CONFLICT DO NOTHING;

INSERT INTO
    tipo (descricao)
VALUES
    ('Evolução de Versão') ON CONFLICT DO NOTHING;

-- Status
INSERT INTO
    status (descricao)
VALUES
    ('Aberto') ON CONFLICT DO NOTHING;

INSERT INTO
    status (descricao)
VALUES
    ('Em Andamento') ON CONFLICT DO NOTHING;

INSERT INTO
    status (descricao)
VALUES
    ('Em Revisão') ON CONFLICT DO NOTHING;

INSERT INTO
    status (descricao)
VALUES
    ('Aguardando Aprovação') ON CONFLICT DO NOTHING;

INSERT INTO
    status (descricao)
VALUES
    ('Finalizado') ON CONFLICT DO NOTHING;

INSERT INTO
    status (descricao)
VALUES
    ('Cancelado') ON CONFLICT DO NOTHING;