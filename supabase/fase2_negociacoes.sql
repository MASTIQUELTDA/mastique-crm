-- ============================================================
-- MASTIQUE CRM — Fase 2: Negociações
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- Tabela: negociacoes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.negociacoes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id          uuid NOT NULL REFERENCES public.empresas(id),
  vendedor_id         uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  tipo                text NOT NULL DEFAULT 'novo'
                        CHECK (tipo IN ('novo', 'recorrente')),
  status              text NOT NULL DEFAULT 'aberta'
                        CHECK (status IN ('aberta', 'ganha', 'perdida', 'gaveta')),
  valor_estimado      numeric(12,2),
  origem              text CHECK (origem IN ('prospeccao', 'indicacao', 'retorno', 'rd_station', 'outro')),
  motivo_fechamento   text,
  observacoes         text,
  data_proxima_acao   date,
  criado_em           timestamptz NOT NULL DEFAULT now(),
  atualizado_em       timestamptz NOT NULL DEFAULT now()
);

-- Regra central: apenas uma negociação aberta por empresa
CREATE UNIQUE INDEX IF NOT EXISTS negociacoes_empresa_aberta_idx
  ON public.negociacoes(empresa_id)
  WHERE status = 'aberta';

ALTER TABLE public.negociacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam negociacoes"
  ON public.negociacoes FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE TRIGGER negociacoes_atualizado_em
  BEFORE UPDATE ON public.negociacoes
  FOR EACH ROW EXECUTE FUNCTION public.set_atualizado_em();

-- --------------------------------------------------------
-- Tabela: negociacao_interacoes
-- Timeline de eventos de cada negociação
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.negociacao_interacoes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negociacao_id   uuid NOT NULL REFERENCES public.negociacoes(id) ON DELETE CASCADE,
  autor_id        uuid REFERENCES public.perfis(id) ON DELETE SET NULL,
  tipo            text NOT NULL
                    CHECK (tipo IN ('nota', 'ligacao', 'email', 'reuniao', 'proposta', 'pedido', 'sistema')),
  descricao       text NOT NULL,
  criado_em       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.negociacao_interacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Autenticados gerenciam interacoes"
  ON public.negociacao_interacoes FOR ALL
  USING (auth.uid() IS NOT NULL);

-- --------------------------------------------------------
-- View: negociacoes_resumo
-- --------------------------------------------------------
CREATE OR REPLACE VIEW public.negociacoes_resumo AS
SELECT
  n.id,
  n.empresa_id,
  n.vendedor_id,
  n.tipo,
  n.status,
  n.valor_estimado,
  n.origem,
  n.motivo_fechamento,
  n.data_proxima_acao,
  n.criado_em,
  n.atualizado_em,
  e.razao_social     AS empresa_nome,
  e.nome_fantasia    AS empresa_fantasia,
  e.segmento         AS empresa_segmento,
  v.nome             AS vendedor_nome
FROM public.negociacoes n
JOIN  public.empresas e ON e.id = n.empresa_id
LEFT JOIN public.perfis v ON v.id = n.vendedor_id;
