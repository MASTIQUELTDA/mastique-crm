-- ============================================================
-- MASTIQUE CRM — Fase 2b: Correção per especificação v1.6
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. Adicionar campos faltantes à tabela empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS regiao text NOT NULL DEFAULT 'reg1',
  ADD COLUMN IF NOT EXISTS funil text NOT NULL DEFAULT 'novos',
  ADD COLUMN IF NOT EXISTS tipo_venda_padrao text DEFAULT 'nf',
  ADD COLUMN IF NOT EXISTS inscricao_estadual text,
  ADD COLUMN IF NOT EXISTS constancia_cadastrada int,
  ADD COLUMN IF NOT EXISTS ultima_compra_valida date;

ALTER TABLE public.empresas
  DROP CONSTRAINT IF EXISTS empresas_regiao_check;
ALTER TABLE public.empresas
  ADD CONSTRAINT empresas_regiao_check CHECK (regiao IN ('reg1', 'reg2'));

ALTER TABLE public.empresas
  DROP CONSTRAINT IF EXISTS empresas_funil_check;
ALTER TABLE public.empresas
  ADD CONSTRAINT empresas_funil_check CHECK (funil IN ('novos', 'recorrentes', 'gaveta', 'rateio'));

ALTER TABLE public.empresas
  DROP CONSTRAINT IF EXISTS empresas_tipo_venda_padrao_check;
ALTER TABLE public.empresas
  ADD CONSTRAINT empresas_tipo_venda_padrao_check CHECK (tipo_venda_padrao IN ('nf', 'pedido_simples'));

-- 2. Corrigir tabela negociacoes
-- Remover índice antigo (usa WHERE status = 'aberta', precisa recriar depois)
DROP INDEX IF EXISTS public.negociacoes_empresa_aberta_idx;

-- Migrar dados existentes em estados que deixarão de existir
UPDATE public.negociacoes SET status = 'concluida'  WHERE status IN ('ganha', 'perdida');
UPDATE public.negociacoes SET status = 'aberta'     WHERE status = 'gaveta';

-- Dropar constraint antiga de status
ALTER TABLE public.negociacoes DROP CONSTRAINT IF EXISTS negociacoes_status_check;
ALTER TABLE public.negociacoes ADD CONSTRAINT negociacoes_status_check
  CHECK (status IN ('aberta', 'concluida', 'cancelada'));

-- Dropar view que depende da coluna tipo antes de removê-la
DROP VIEW IF EXISTS public.negociacoes_resumo;

-- Dropar constraint antiga de tipo e remover coluna
ALTER TABLE public.negociacoes DROP CONSTRAINT IF EXISTS negociacoes_tipo_check;
ALTER TABLE public.negociacoes DROP COLUMN IF EXISTS tipo;

-- Recriar índice único para negociação aberta
CREATE UNIQUE INDEX negociacoes_empresa_aberta_idx
  ON public.negociacoes(empresa_id)
  WHERE status = 'aberta';

-- 3. Reconstruir view empresas_resumo (com novos campos)
DROP VIEW IF EXISTS public.empresas_resumo;
CREATE VIEW public.empresas_resumo AS
SELECT
  e.id,
  e.cpf_cnpj,
  e.razao_social,
  e.nome_fantasia,
  e.tipo,
  e.segmento,
  e.ativo,
  e.vendedor_id,
  e.regiao,
  e.funil,
  e.tipo_venda_padrao,
  e.inscricao_estadual,
  e.constancia_cadastrada,
  e.ultima_compra_valida,
  e.criado_em,
  e.atualizado_em,
  c.nome         AS contato_nome,
  c.telefone     AS contato_telefone,
  c.whatsapp     AS contato_whatsapp,
  end_.cidade    AS cidade,
  end_.uf        AS uf,
  v.nome         AS vendedor_nome
FROM public.empresas e
LEFT JOIN public.contatos c    ON c.empresa_id = e.id AND c.principal = true AND c.ativo = true
LEFT JOIN public.enderecos end_ ON end_.empresa_id = e.id AND end_.tipo = 'principal'
LEFT JOIN public.perfis v      ON v.id = e.vendedor_id;

-- 4. Reconstruir view negociacoes_resumo (sem tipo, com campos de empresa)
DROP VIEW IF EXISTS public.negociacoes_resumo;
CREATE VIEW public.negociacoes_resumo AS
SELECT
  n.id,
  n.empresa_id,
  n.vendedor_id,
  n.status,
  n.valor_estimado,
  n.origem,
  n.motivo_fechamento,
  n.observacoes,
  n.data_proxima_acao,
  n.criado_em,
  n.atualizado_em,
  e.razao_social     AS empresa_nome,
  e.nome_fantasia    AS empresa_fantasia,
  e.segmento         AS empresa_segmento,
  e.regiao           AS empresa_regiao,
  e.funil            AS empresa_funil,
  v.nome             AS vendedor_nome
FROM public.negociacoes n
JOIN  public.empresas e  ON e.id = n.empresa_id
LEFT JOIN public.perfis v ON v.id = n.vendedor_id;
