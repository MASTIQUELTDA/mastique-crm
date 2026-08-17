'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EmpresaDetalhe } from '@/lib/types'

function normalizarCpfCnpj(valor: string): string {
  return valor.replace(/\D/g, '')
}

export async function listarEmpresas(busca?: string, segmento?: string, ativo?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('empresas_resumo')
    .select('*')
    .order('razao_social')

  if (busca) {
    query = query.or(
      `razao_social.ilike.%${busca}%,nome_fantasia.ilike.%${busca}%,cpf_cnpj.ilike.%${busca}%`
    )
  }

  if (segmento) {
    query = query.eq('segmento', segmento)
  }

  if (ativo !== undefined && ativo !== '') {
    query = query.eq('ativo', ativo === 'true')
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function buscarEmpresa(id: string): Promise<EmpresaDetalhe> {
  const supabase = await createClient()

  const [{ data: empresa, error: e1 }, { data: contatos, error: e2 }, { data: enderecos, error: e3 }, { data: condicoes, error: e4 }] =
    await Promise.all([
      supabase.from('empresas').select('*').eq('id', id).single(),
      supabase.from('contatos').select('*').eq('empresa_id', id).order('principal', { ascending: false }),
      supabase.from('enderecos').select('*').eq('empresa_id', id),
      supabase.from('condicoes_comerciais').select('*').eq('empresa_id', id).single(),
    ])

  if (e1) throw new Error(e1.message)

  return {
    ...empresa,
    contatos: contatos ?? [],
    enderecos: enderecos ?? [],
    condicoes_comerciais: condicoes ? [condicoes] : [],
  }
}

export async function criarEmpresa(formData: FormData) {
  const supabase = await createClient()

  const cpf_cnpj = normalizarCpfCnpj(formData.get('cpf_cnpj') as string)

  const { data: empresa, error } = await supabase
    .from('empresas')
    .insert({
      cpf_cnpj,
      razao_social: formData.get('razao_social') as string,
      nome_fantasia: formData.get('nome_fantasia') as string || null,
      tipo: formData.get('tipo') as string || 'pj',
      segmento: formData.get('segmento') as string || null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'CPF/CNPJ já cadastrado.' }
    return { error: error.message }
  }

  // Salva endereço principal se preenchido
  const cep = formData.get('cep') as string
  if (cep) {
    await supabase.from('enderecos').insert({
      empresa_id: empresa.id,
      tipo: 'principal',
      cep,
      logradouro: formData.get('logradouro') as string || null,
      numero: formData.get('numero') as string || null,
      complemento: formData.get('complemento') as string || null,
      bairro: formData.get('bairro') as string || null,
      cidade: formData.get('cidade') as string || null,
      uf: formData.get('uf') as string || null,
    })
  }

  // Salva contato principal se preenchido
  const contato_nome = formData.get('contato_nome') as string
  if (contato_nome) {
    await supabase.from('contatos').insert({
      empresa_id: empresa.id,
      nome: contato_nome,
      cargo: formData.get('contato_cargo') as string || null,
      telefone: formData.get('contato_telefone') as string || null,
      whatsapp: formData.get('contato_whatsapp') as string || null,
      email: formData.get('contato_email') as string || null,
      principal: true,
    })
  }

  revalidatePath('/empresas')
  return { empresa }
}

export async function editarEmpresa(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('empresas')
    .update({
      razao_social: formData.get('razao_social') as string,
      nome_fantasia: formData.get('nome_fantasia') as string || null,
      segmento: formData.get('segmento') as string || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/empresas')
  revalidatePath(`/empresas/${id}`)
  return { ok: true }
}

export async function inativarEmpresa(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('empresas').update({ ativo: false }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/empresas')
  return { ok: true }
}

export async function buscarCep(cep: string) {
  const raw = cep.replace(/\D/g, '')
  if (raw.length !== 8) return null

  try {
    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`)
    const data = await res.json()
    if (data.erro) return null
    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      uf: data.uf ?? '',
    }
  } catch {
    return null
  }
}
