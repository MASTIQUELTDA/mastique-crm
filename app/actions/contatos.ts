'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarContato(empresaId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('contatos').insert({
    empresa_id: empresaId,
    nome: formData.get('nome') as string,
    cargo: formData.get('cargo') as string || null,
    telefone: formData.get('telefone') as string || null,
    whatsapp: formData.get('whatsapp') as string || null,
    email: formData.get('email') as string || null,
    principal: formData.get('principal') === 'true',
  })

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function editarContato(contatoId: string, empresaId: string, formData: FormData) {
  const supabase = await createClient()

  const isPrincipal = formData.get('principal') === 'true'

  // Se vai setar como principal, remove o principal atual
  if (isPrincipal) {
    await supabase
      .from('contatos')
      .update({ principal: false })
      .eq('empresa_id', empresaId)
      .neq('id', contatoId)
  }

  const { error } = await supabase.from('contatos').update({
    nome: formData.get('nome') as string,
    cargo: formData.get('cargo') as string || null,
    telefone: formData.get('telefone') as string || null,
    whatsapp: formData.get('whatsapp') as string || null,
    email: formData.get('email') as string || null,
    principal: isPrincipal,
  }).eq('id', contatoId)

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function removerContato(contatoId: string, empresaId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('contatos').delete().eq('id', contatoId)

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}
