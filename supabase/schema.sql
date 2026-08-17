-- ============================================================
-- MASTIQUE CRM — Schema inicial (Fase 0)
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- Tabela de perfis de usuário (complementa auth.users do Supabase)
create table if not exists public.perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text not null,
  perfil      text not null default 'vendedor'
                check (perfil in ('admin', 'gestor', 'vendedor', 'estoquista')),
  ativo       boolean not null default true,
  criado_em   timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Row Level Security: cada usuário só vê/edita seu próprio perfil
alter table public.perfis enable row level security;

create policy "Usuário vê próprio perfil"
  on public.perfis for select
  using (auth.uid() = id);

create policy "Usuário edita próprio perfil"
  on public.perfis for update
  using (auth.uid() = id);

-- Admin vê todos os perfis
create policy "Admin vê todos os perfis"
  on public.perfis for all
  using (
    exists (
      select 1 from public.perfis p
      where p.id = auth.uid() and p.perfil = 'admin'
    )
  );

-- Trigger: atualiza atualizado_em automaticamente
create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger perfis_atualizado_em
  before update on public.perfis
  for each row execute function public.set_atualizado_em();

-- Trigger: cria perfil automaticamente ao criar usuário no Supabase Auth
create or replace function public.handle_novo_usuario()
returns trigger language plpgsql security definer as $$
begin
  insert into public.perfis (id, nome, perfil)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'perfil', 'vendedor')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_novo_usuario();
