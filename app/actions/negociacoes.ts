'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { NegociacaoDetalhe } from '@/lib/types'

export async function listarNegociacoes(status?: string, funil?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('negociacoes_resumo')
    .select('*')
    .order('criado_em', { ascending: false })

  if (status) query = query.eq('status', status)
  if (funil)  query = query.eq('empresa_funil', funil)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function buscarNegociacaoAtiva(empresaId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('negociacoes_resumo')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('status', 'aberta')
    .single()
  return data ?? null
}

export async function buscarNegociacao(id: string): Promise<NegociacaoDetalhe> {
  const supabase = await createClient()

  const [{ data: neg, error }, { data: interacoes }] = await Promise.all([
    supabase
      .from('negociacoes_resumo')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('negociacao_interacoes')
      .select('*, perfis(nome)')
      .eq('negociacao_id', id)
      .order('criado_em', { ascending: true }),
  ])

  if (error) throw new Error(error.message)

  return {
    ...neg,
    interacoes: (interacoes ?? []).map((i: any) => ({
      ...i,
      autor_nome: i.perfis?.nome ?? null,
      perfis: undefined,
    })),
  }
}

export async function abrirNegociacao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const empresaId = formData.get('empresa_id') as string

  const { data: existente } = await supabase
    .from('negociacoes')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('status', 'aberta')
    .single()

  if (existente) return { error: 'Esta empresa já tem uma negociação aberta.' }

  const { data: negociacao, error } = await supabase
    .from('negociacoes')
    .insert({
      empresa_id: empresaId,
      vendedor_id: user?.id ?? null,
      valor_estimado: formData.get('valor_estimado') ? Number(formData.get('valor_estimado')) : null,
      origem: formData.get('origem') as string || null,
      observacoes: formData.get('observacoes') as string || null,
      data_proxima_acao: formData.get('data_proxima_acao') as string || null,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.from('negociacao_interacoes').insert({
    negociacao_id: negociacao.id,
    autor_id: user?.id ?? null,
    tipo: 'sistema',
    descricao: 'Venda aberta',
  })

  revalidatePath('/negociacoes')
  revalidatePath(`/empresas/${empresaId}`)
  return { negociacao }
}

export async function editarNegociacao(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('negociacoes')
    .update({
      valor_estimado: formData.get('valor_estimado') ? Number(formData.get('valor_estimado')) : null,
      origem: formData.get('origem') as string || null,
      observacoes: formData.get('observacoes') as string || null,
      data_proxima_acao: formData.get('data_proxima_acao') as string || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/negociacoes')
  revalidatePath(`/negociacoes/${id}`)
  return { ok: true }
}

export async function concluirNegociacao(id: string, empresaId: string, observacao?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('negociacoes')
    .update({ status: 'concluida', motivo_fechamento: observacao ?? null })
    .eq('id', id)

  if (error) return { error: error.message }

  // Atualiza empresa: funil passa para recorrentes e registra última compra
  await supabase.from('empresas').update({
    ultima_compra_valida: new Date().toISOString().split('T')[0],
  }).eq('id', empresaId)

  await supabase.from('negociacao_interacoes').insert({
    negociacao_id: id,
    autor_id: user?.id ?? null,
    tipo: 'sistema',
    descricao: `Venda concluída${observacao ? ` — ${observacao}` : ''}`,
  })

  revalidatePath('/negociacoes')
  revalidatePath(`/negociacoes/${id}`)
  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function cancelarNegociacao(id: string, empresaId: string, motivo?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('negociacoes')
    .update({ status: 'cancelada', motivo_fechamento: motivo ?? null })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('negociacao_interacoes').insert({
    negociacao_id: id,
    autor_id: user?.id ?? null,
    tipo: 'sistema',
    descricao: `Venda cancelada${motivo ? ` — Motivo: ${motivo}` : ''}`,
  })

  revalidatePath('/negociacoes')
  revalidatePath(`/negociacoes/${id}`)
  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function reabrirNegociacao(id: string, empresaId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: existente } = await supabase
    .from('negociacoes')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('status', 'aberta')
    .neq('id', id)
    .single()

  if (existente) return { error: 'Esta empresa já tem outra negociação aberta.' }

  const { error } = await supabase
    .from('negociacoes')
    .update({ status: 'aberta', motivo_fechamento: null })
    .eq('id', id)

  if (error) return { error: error.message }

  await supabase.from('negociacao_interacoes').insert({
    negociacao_id: id,
    autor_id: user?.id ?? null,
    tipo: 'sistema',
    descricao: 'Venda reaberta',
  })

  revalidatePath('/negociacoes')
  revalidatePath(`/negociacoes/${id}`)
  return { ok: true }
}

export async function adicionarInteracao(negociacaoId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('negociacao_interacoes').insert({
    negociacao_id: negociacaoId,
    autor_id: user?.id ?? null,
    tipo: formData.get('tipo') as string,
    descricao: formData.get('descricao') as string,
  })

  if (error) return { error: error.message }

  const proxima = formData.get('data_proxima_acao') as string
  if (proxima) {
    await supabase
      .from('negociacoes')
      .update({ data_proxima_acao: proxima })
      .eq('id', negociacaoId)
  }

  revalidatePath(`/negociacoes/${negociacaoId}`)
  return { ok: true }
}
