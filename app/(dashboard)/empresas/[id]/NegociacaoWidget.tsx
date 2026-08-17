'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, Plus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { abrirNegociacao } from '@/app/actions/negociacoes'
import type { NegociacaoResumo } from '@/lib/types'

const ORIGENS = [
  { value: 'prospeccao', label: 'Prospecção' },
  { value: 'indicacao',  label: 'Indicação' },
  { value: 'retorno',    label: 'Retorno' },
  { value: 'rd_station', label: 'RD Station' },
  { value: 'outro',      label: 'Outro' },
]

function badgeStatus(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    aberta:  { variant: 'info',    label: 'Aberta' },
    ganha:   { variant: 'success', label: 'Ganha' },
    perdida: { variant: 'danger',  label: 'Perdida' },
    gaveta:  { variant: 'warning', label: 'Gaveta' },
  }
  return map[status] ?? { variant: 'default', label: status }
}

interface Props {
  empresaId: string
  negociacaoAtiva: NegociacaoResumo | null
}

export function NegociacaoWidget({ empresaId, negociacaoAtiva }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modalAberto, setModalAberto] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleAbrir(formData: FormData) {
    formData.set('empresa_id', empresaId)
    setErro(null)
    startTransition(async () => {
      const result = await abrirNegociacao(formData)
      if (result.error) { setErro(result.error); return }
      setModalAberto(false)
      router.push(`/negociacoes/${result.negociacao!.id}`)
    })
  }

  const status = negociacaoAtiva ? badgeStatus(negociacaoAtiva.status) : null

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Negociação</h2>
          {!negociacaoAtiva && (
            <Button variant="ghost" size="sm" onClick={() => { setErro(null); setModalAberto(true) }}>
              <Plus size={13} />
              Abrir
            </Button>
          )}
        </div>

        <div className="bg-white border border-[#DDD9D2] rounded-xl p-4">
          {negociacaoAtiva ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={status!.variant}>{status!.label}</Badge>
                <Badge variant={negociacaoAtiva.tipo === 'novo' ? 'info' : 'default'}>
                  {negociacaoAtiva.tipo === 'novo' ? 'REG 1' : 'REG 2'}
                </Badge>
              </div>
              {negociacaoAtiva.valor_estimado != null && (
                <p className="text-sm font-semibold text-[#0B1929]">
                  {Number(negociacaoAtiva.valor_estimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              )}
              {negociacaoAtiva.data_proxima_acao && (
                <p className="text-xs text-[#7A8FA6]">
                  Próxima ação: {new Date(negociacaoAtiva.data_proxima_acao).toLocaleDateString('pt-BR')}
                </p>
              )}
              <Link
                href={`/negociacoes/${negociacaoAtiva.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3A5A78] hover:text-[#0B1929] transition-colors mt-1"
              >
                <ExternalLink size={12} />
                Ver negociação
              </Link>
            </div>
          ) : (
            <button
              onClick={() => { setErro(null); setModalAberto(true) }}
              className="w-full flex flex-col items-center gap-1 py-4 text-[#A0AEC0] hover:text-[#7A8FA6] transition-colors"
            >
              <TrendingUp size={20} />
              <p className="text-sm">Nenhuma negociação aberta</p>
            </button>
          )}
        </div>
      </section>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Abrir negociação"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalAberto(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-abrir-neg" loading={pending}>Abrir negociação</Button>
          </div>
        }
      >
        <form id="form-abrir-neg" action={handleAbrir} className="space-y-4">
          {erro && (
            <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">{erro}</div>
          )}
          <Select
            name="tipo"
            label="Tipo"
            defaultValue="novo"
            options={[
              { value: 'novo',       label: 'REG 1 — Novo cliente' },
              { value: 'recorrente', label: 'REG 2 — Cliente recorrente' },
            ]}
          />
          <Select
            name="origem"
            label="Origem"
            options={ORIGENS}
            placeholder="Selecionar origem..."
          />
          <Input
            name="valor_estimado"
            label="Valor estimado (R$)"
            type="number"
            min="0"
            step="0.01"
            placeholder="Opcional"
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Próxima ação</label>
            <input
              name="data_proxima_acao"
              type="date"
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Observações iniciais</label>
            <textarea
              name="observacoes"
              rows={2}
              placeholder="Contexto, produto de interesse, referência..."
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800] placeholder:text-[#A0AEC0]"
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
