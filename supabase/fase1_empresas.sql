-- ============================================================
-- MASTIQUE CRM — Fase 1: Empresas e Contatos
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- Tabela: empresas
-- Cadastro permanente, chave natural: cpf_cnpj (normalizado)
-- --------------------------------------------------------
create table if not exists public.empresas (
  id              uuid primary key default gen_random_uuid(),
  cpf_cnpj        text not null unique,           -- normalizado (só dígitos)
  razao_social    text not null,
  nome_fantasia   text,
  tipo            text not null default 'pj'
                    check (tipo in ('pf', 'pj')),
  segmento        text,                            -- ex: alimentício, farmácia, pet...
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

alter table public.empresas enable row level security;

-- Usuários autenticados podem ler todas as empresas
create policy "Autenticados leem empresas"
  on public.empresas for select
  using (auth.uid() is not null);

-- Vendedores e acima podem criar
create policy "Autenticados criam empresas"
  on public.empresas for insert
  with check (auth.uid() is not null);

-- Gestores e admin editam
create policy "Autenticados editam empresas"
  on public.empresas for update
  using (auth.uid() is not null);

create trigger empresas_atualizado_em
  before update on public.empresas
  for each row execute function public.set_atualizado_em();

-- --------------------------------------------------------
-- Tabela: enderecos
-- Uma empresa pode ter vários endereços (entrega, cobrança, sede)
-- --------------------------------------------------------
create table if not exists public.enderecos (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  tipo            text not null default 'principal'
                    check (tipo in ('principal', 'entrega', 'cobranca', 'outro')),
  cep             text,
  logradouro      text,
  numero          text,
  complemento     text,
  bairro          text,
  cidade          text,
  uf              text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

alter table public.enderecos enable row level security;

create policy "Autenticados gerenciam enderecos"
  on public.enderecos for all
  using (auth.uid() is not null);

create trigger enderecos_atualizado_em
  before update on public.enderecos
  for each row execute function public.set_atualizado_em();

-- --------------------------------------------------------
-- Tabela: contatos
-- Pessoas físicas ligadas a uma empresa
-- --------------------------------------------------------
create table if not exists public.contatos (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  nome            text not null,
  cargo           text,
  telefone        text,
  whatsapp        text,
  email           text,
  principal       boolean not null default false,  -- contato principal da empresa
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

alter table public.contatos enable row level security;

create policy "Autenticados gerenciam contatos"
  on public.contatos for all
  using (auth.uid() is not null);

create trigger contatos_atualizado_em
  before update on public.contatos
  for each row execute function public.set_atualizado_em();

-- --------------------------------------------------------
-- Tabela: condicoes_comerciais
-- Condições negociadas com a empresa (prazo, desconto, limite)
-- --------------------------------------------------------
create table if not exists public.condicoes_comerciais (
  id              uuid primary key default gen_random_uuid(),
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  prazo_padrao    int,            -- dias de pagamento padrão
  desconto_max    numeric(5,2),   -- % desconto máximo aprovado
  limite_credito  numeric(12,2),  -- R$
  observacoes     text,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

alter table public.condicoes_comerciais enable row level security;

create policy "Autenticados gerenciam condicoes"
  on public.condicoes_comerciais for all
  using (auth.uid() is not null);

create trigger condicoes_atualizado_em
  before update on public.condicoes_comerciais
  for each row execute function public.set_atualizado_em();

-- --------------------------------------------------------
-- View auxiliar: empresas com contato principal e endereço
-- --------------------------------------------------------
create or replace view public.empresas_resumo as
select
  e.id,
  e.cpf_cnpj,
  e.razao_social,
  e.nome_fantasia,
  e.tipo,
  e.segmento,
  e.ativo,
  e.criado_em,
  e.atualizado_em,
  c.nome       as contato_nome,
  c.telefone   as contato_telefone,
  c.whatsapp   as contato_whatsapp,
  en.cidade    as cidade,
  en.uf        as uf
from public.empresas e
left join public.contatos c on c.empresa_id = e.id and c.principal = true
left join public.enderecos en on en.empresa_id = e.id and en.tipo = 'principal';
