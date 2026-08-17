-- ============================================================
-- MASTIQUE CRM — Fase 1b: Vendedor responsável na empresa
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Adiciona coluna vendedor_id na tabela empresas
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS vendedor_id uuid REFERENCES public.perfis(id) ON DELETE SET NULL;

-- Recria a view empresas_resumo incluindo vendedor
CREATE OR REPLACE VIEW public.empresas_resumo AS
SELECT
  e.id,
  e.cpf_cnpj,
  e.razao_social,
  e.nome_fantasia,
  e.tipo,
  e.segmento,
  e.ativo,
  e.vendedor_id,
  e.criado_em,
  e.atualizado_em,
  c.nome       AS contato_nome,
  c.telefone   AS contato_telefone,
  c.whatsapp   AS contato_whatsapp,
  en.cidade    AS cidade,
  en.uf        AS uf,
  p.nome       AS vendedor_nome
FROM public.empresas e
LEFT JOIN public.contatos c  ON c.empresa_id = e.id AND c.principal = true
LEFT JOIN public.enderecos en ON en.empresa_id = e.id AND en.tipo = 'principal'
LEFT JOIN public.perfis p    ON p.id = e.vendedor_id;
