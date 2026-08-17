'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function salvarCondicoes(empresaId: string, condicaoId: string | null, formData: FormData) {
  const supabase = await createClient()

  const dados = {
    empresa_id: empresaId,
    prazo_padrao: formData.get('prazo_padrao') ? Number(formData.get('prazo_padrao')) : null,
    desconto_max: formData.get('desconto_max') ? Number(formData.get('desconto_max')) : null,
    limite_credito: formData.get('limite_credito') ? Number(formData.get('limite_credito')) : null,
    observacoes: formData.get('observacoes') as string || null,
  }

  let error
  if (condicaoId) {
    ;({ error } = await supabase.from('condicoes_comerciais').update(dados).eq('id', condicaoId))
  } else {
    ;({ error } = await supabase.from('condicoes_comerciais').insert(dados))
  }

  if (error) return { error: error.message }

  revalidatePath(`/empresas/${empresaId}`)
  return { ok: true }
}
