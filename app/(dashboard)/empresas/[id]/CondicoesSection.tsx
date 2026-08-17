'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, CreditCard } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { salvarCondicoes } from '@/app/actions/condicoes'
import type { CondicaoComercial } from '@/lib/types'

interface Props {
  empresaId: string
  condicao: CondicaoComercial | null
}

export function CondicoesSection({ empresaId, condicao }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [modalAberto, setModalAberto] = useState(false)

  function handleSubmit(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await salvarCondicoes(empresaId, condicao?.id ?? null, formData)
      if (result.error) { setErro(result.error); return }
      setModalAberto(false)
      router.refresh()
    })
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Condições comerciais</h2>
          <Button variant="ghost" size="sm" onClick={() => { setErro(null); setModalAberto(true) }}>
            <Pencil size={13} />
            {condicao ? 'Editar' : 'Definir'}
          </Button>
        </div>

        <div className="bg-white border border-[#DDD9D2] rounded-xl p-4">
          {condicao ? (
            <div className="space-y-3">
              {condicao.prazo_padrao != null && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Prazo padrão</p>
                  <p className="text-sm font-semibold text-[#0B1929]">{condicao.prazo_padrao} dias</p>
                </div>
              )}
              {condicao.desconto_max != null && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Desconto máximo</p>
                  <p className="text-sm font-semibold text-[#0B1929]">{Number(condicao.desconto_max).toFixed(1)}%</p>
                </div>
              )}
              {condicao.limite_credito != null && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Limite de crédito</p>
                  <p className="text-sm font-semibold text-[#0B1929]">
                    {Number(condicao.limite_credito).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}
              {condicao.observacoes && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Observações</p>
                  <p className="text-xs text-[#5E7A96]">{condicao.observacoes}</p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => { setErro(null); setModalAberto(true) }}
              className="w-full flex flex-col items-center gap-1 py-4 text-[#A0AEC0] hover:text-[#7A8FA6] transition-colors"
            >
              <CreditCard size={20} />
              <p className="text-sm">Definir condições</p>
            </button>
          )}
        </div>
      </section>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Condições comerciais"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalAberto(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-condicoes" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <form id="form-condicoes" action={handleSubmit} className="space-y-4">
          {erro && (
            <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}
          <Input
            name="prazo_padrao"
            label="Prazo padrão (dias)"
            type="number"
            min="0"
            defaultValue={condicao?.prazo_padrao?.toString() ?? ''}
            placeholder="Ex: 30"
          />
          <Input
            name="desconto_max"
            label="Desconto máximo (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={condicao?.desconto_max?.toString() ?? ''}
            placeholder="Ex: 5"
          />
          <Input
            name="limite_credito"
            label="Limite de crédito (R$)"
            type="number"
            min="0"
            step="0.01"
            defaultValue={condicao?.limite_credito?.toString() ?? ''}
            placeholder="Ex: 10000"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Observações</label>
            <textarea
              name="observacoes"
              rows={3}
              defaultValue={condicao?.observacoes ?? ''}
              placeholder="Notas sobre as condições negociadas..."
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
