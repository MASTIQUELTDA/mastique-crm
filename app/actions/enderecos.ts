'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function adicionarEndereco(empresaId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('enderecos').insert({
    empresa_id: empresaId,
    tipo: formData.get('tipo') as string || 'principal',
    cep: formData.get('cep') as string || null,
    logradouro: formData.get('logradouro') as string || null,
    numero: formData.get('numero') as string || null,
    complemento: formData.get('complemento') as string || null,
    bairro: formData.get('bairro') as string || null,
    cidade: formData.get('cidade') as string || null,
    uf: formData.get('uf') as string || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function editarEndereco(enderecoId: string, empresaId: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('enderecos').update({
    tipo: formData.get('tipo') as string || 'principal',
    cep: formData.get('cep') as string || null,
    logradouro: formData.get('logradouro') as string || null,
    numero: formData.get('numero') as string || null,
    complemento: formData.get('complemento') as string || null,
    bairro: formData.get('bairro') as string || null,
    cidade: formData.get('cidade') as string || null,
    uf: formData.get('uf') as string || null,
  }).eq('id', enderecoId)

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}

export async function removerEndereco(enderecoId: string, empresaId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('enderecos').delete().eq('id', enderecoId)

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}
