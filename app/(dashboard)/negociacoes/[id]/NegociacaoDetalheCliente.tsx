'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Archive, RotateCcw, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { fecharNegociacao, moverParaGaveta, reabrirNegociacao, editarNegociacao } from '@/app/actions/negociacoes'
import type { NegociacaoDetalhe } from '@/lib/types'

const ORIGENS = [
  { value: 'prospeccao', label: 'Prospecção' },
  { value: 'indicacao',  label: 'Indicação' },
  { value: 'retorno',    label: 'Retorno' },
  { value: 'rd_station', label: 'RD Station' },
  { value: 'outro',      label: 'Outro' },
]

interface Props { neg: NegociacaoDetalhe }

type ModalTipo = 'ganhar' | 'perder' | 'gaveta' | 'editar' | null

export default function NegociacaoDetalheCliente({ neg }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modal, setModal] = useState<ModalTipo>(null)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)

  function handleFechar(status: 'ganha' | 'perdida') {
    startTransition(async () => {
      const result = await fecharNegociacao(neg.id, status, motivo || undefined)
      if (result.error) { setErro(result.error); return }
      setModal(null)
      router.refresh()
    })
  }

  function handleGaveta() {
    startTransition(async () => {
      const result = await moverParaGaveta(neg.id, motivo || undefined)
      if (result.error) { setErro(result.error); return }
      setModal(null)
      router.refresh()
    })
  }

  function handleReabrir() {
    startTransition(async () => {
      const result = await reabrirNegociacao(neg.id, neg.empresa_id)
      if (result.error) { setErro(result.error); return }
      router.refresh()
    })
  }

  function handleEditar(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await editarNegociacao(neg.id, formData)
      if (result.error) { setErro(result.error); return }
      setModal(null)
      router.refresh()
    })
  }

  function abrirModal(tipo: ModalTipo) {
    setMotivo('')
    setErro(null)
    setModal(tipo)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {neg.status === 'aberta' && (
          <>
            <Button variant="ghost" size="sm" onClick={() => abrirModal('editar')}>
              <Pencil size={14} />
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => abrirModal('gaveta')}
              className="text-[#7A8FA6] hover:text-[#7A4F00] hover:bg-[#FFF3CD]">
              <Archive size={14} />
              Gaveta
            </Button>
            <Button variant="danger" size="sm" onClick={() => abrirModal('perder')}>
              <XCircle size={14} />
              Perdida
            </Button>
            <Button size="sm" onClick={() => abrirModal('ganhar')}>
              <CheckCircle size={14} />
              Ganha
            </Button>
          </>
        )}

        {neg.status === 'gaveta' && (
          <>
            <Button variant="ghost" size="sm" onClick={() => abrirModal('perder')}
              className="text-[#7A8FA6] hover:text-[#E53E3E] hover:bg-[#FDE8E8]">
              <XCircle size={14} />
              Marcar perdida
            </Button>
            <Button variant="secondary" size="sm" onClick={handleReabrir} loading={pending}>
              <RotateCcw size={14} />
              Reabrir
            </Button>
          </>
        )}

        {(neg.status === 'ganha' || neg.status === 'perdida') && (
          <Button variant="secondary" size="sm" onClick={handleReabrir} loading={pending}>
            <RotateCcw size={14} />
            Reabrir
          </Button>
        )}
      </div>

      {/* Modal: marcar ganha */}
      <Modal
        open={modal === 'ganhar'}
        onClose={() => setModal(null)}
        title="Negociação ganha"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} disabled={pending}>Cancelar</Button>
            <Button onClick={() => handleFechar('ganha')} loading={pending}>Confirmar ganho</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {erro && <p className="text-xs text-[#E53E3E]">{erro}</p>}
          <p className="text-sm text-[#3A5A78]">
            Registre um comentário sobre o fechamento (opcional).
          </p>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ex: Pedido de R$ 8.500 realizado, entrega em 5 dias..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800] placeholder:text-[#A0AEC0]"
          />
        </div>
      </Modal>

      {/* Modal: marcar perdida */}
      <Modal
        open={modal === 'perder'}
        onClose={() => setModal(null)}
        title="Negociação perdida"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} disabled={pending}>Cancelar</Button>
            <Button variant="danger" onClick={() => handleFechar('perdida')} loading={pending}>Confirmar perda</Button>
          </div>
        }
      >
        <div className="space-y-4">
          {erro && <p className="text-xs text-[#E53E3E]">{erro}</p>}
          <p className="text-sm text-[#3A5A78]">Qual o motivo da perda?</p>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ex: Preço, prazo, concorrente, sem interesse no momento..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800] placeholder:text-[#A0AEC0]"
          />
        </div>
      </Modal>

      {/* Modal: mover para gaveta */}
      <Modal
        open={modal === 'gaveta'}
        onClose={() => setModal(null)}
        title="Mover para a Gaveta"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} disabled={pending}>Cancelar</Button>
            <Button variant="ghost" onClick={handleGaveta} loading={pending}
              className="bg-[#FFF3CD] text-[#7A4F00] hover:bg-[#FFE88A]">
              Mover para Gaveta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {erro && <p className="text-xs text-[#E53E3E]">{erro}</p>}
          <p className="text-sm text-[#3A5A78]">
            A negociação vai para a Gaveta — pode ser retomada a qualquer momento. Qual o motivo?
          </p>
          <textarea
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Ex: Cliente pediu retorno em 60 dias, aguardando aprovação interna..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800] placeholder:text-[#A0AEC0]"
          />
        </div>
      </Modal>

      {/* Modal: editar */}
      <Modal
        open={modal === 'editar'}
        onClose={() => setModal(null)}
        title="Editar negociação"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModal(null)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-editar-neg" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <form id="form-editar-neg" action={handleEditar} className="space-y-4">
          {erro && <p className="text-xs text-[#E53E3E]">{erro}</p>}
          <Select
            name="tipo"
            label="Tipo"
            defaultValue={neg.tipo}
            options={[
              { value: 'novo', label: 'REG 1 — Novo' },
              { value: 'recorrente', label: 'REG 2 — Recorrente' },
            ]}
          />
          <Input
            name="valor_estimado"
            label="Valor estimado (R$)"
            type="number"
            min="0"
            step="0.01"
            defaultValue={neg.valor_estimado?.toString() ?? ''}
            placeholder="Ex: 5000"
          />
          <Select
            name="origem"
            label="Origem"
            options={ORIGENS}
            defaultValue={neg.origem ?? ''}
            placeholder="Selecionar origem..."
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Próxima ação</label>
            <input
              name="data_proxima_acao"
              type="date"
              defaultValue={neg.data_proxima_acao ?? ''}
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Observações</label>
            <textarea
              name="observacoes"
              rows={3}
              defaultValue={neg.observacoes ?? ''}
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
            />
          </div>
        </form>
      </Modal>
    </>
  )
}
