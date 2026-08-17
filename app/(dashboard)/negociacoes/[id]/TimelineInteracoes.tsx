'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Phone, Mail, Users, FileText, ShoppingCart, Settings, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { adicionarInteracao } from '@/app/actions/negociacoes'
import type { InteracaoTipo } from '@/lib/types'

const TIPOS_INTERACAO = [
  { value: 'nota',     label: 'Anotação' },
  { value: 'ligacao',  label: 'Ligação' },
  { value: 'email',    label: 'E-mail' },
  { value: 'reuniao',  label: 'Reunião' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'pedido',   label: 'Pedido' },
]

const ICON_TIPO: Record<InteracaoTipo, React.ElementType> = {
  nota:     MessageSquare,
  ligacao:  Phone,
  email:    Mail,
  reuniao:  Users,
  proposta: FileText,
  pedido:   ShoppingCart,
  sistema:  Settings,
}

const COR_TIPO: Record<InteracaoTipo, string> = {
  nota:     'bg-[#E8EDF2] text-[#3A5A78]',
  ligacao:  'bg-[#E0EDFF] text-[#1A3E7A]',
  email:    'bg-[#E0EDFF] text-[#1A3E7A]',
  reuniao:  'bg-[#FFF3CD] text-[#7A4F00]',
  proposta: 'bg-[#E6F4EC] text-[#1A6B35]',
  pedido:   'bg-[#E6F4EC] text-[#1A6B35]',
  sistema:  'bg-[#F4F2EE] text-[#7A8FA6]',
}

function formatarDataHora(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

interface Interacao {
  id: string
  tipo: InteracaoTipo
  descricao: string
  autor_nome?: string | null
  criado_em: string
}

interface Props {
  negociacaoId: string
  interacoes: Interacao[]
  aberta: boolean
}

export default function TimelineInteracoes({ negociacaoId, interacoes, aberta }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [tipo, setTipo] = useState<string>('nota')
  const [descricao, setDescricao] = useState('')
  const [proxima, setProxima] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!descricao.trim()) return
    setErro(null)

    const fd = new FormData()
    fd.set('tipo', tipo)
    fd.set('descricao', descricao.trim())
    if (proxima) fd.set('data_proxima_acao', proxima)

    startTransition(async () => {
      const result = await adicionarInteracao(negociacaoId, fd)
      if (result.error) { setErro(result.error); return }
      setDescricao('')
      setProxima('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Histórico</h2>

      {/* Formulário de nova interação */}
      {aberta && (
        <form onSubmit={handleSubmit} className="bg-white border border-[#DDD9D2] rounded-xl p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-40 shrink-0">
              <Select
                name="tipo"
                options={TIPOS_INTERACAO}
                value={tipo}
                onChange={e => setTipo(e.target.value)}
              />
            </div>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="O que aconteceu? Descreva o contato, proposta ou decisão..."
              rows={2}
              className="flex-1 px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800] placeholder:text-[#A0AEC0]"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#7A8FA6] font-medium whitespace-nowrap">Próxima ação em:</label>
              <input
                type="date"
                value={proxima}
                onChange={e => setProxima(e.target.value)}
                className="text-sm border border-[#DDD9D2] rounded-lg px-2 py-1 text-[#0B1929] bg-white
                           focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
              />
            </div>
            <Button type="submit" size="sm" loading={pending} disabled={!descricao.trim()}>
              <Plus size={13} />
              Registrar
            </Button>
          </div>
          {erro && <p className="text-xs text-[#E53E3E]">{erro}</p>}
        </form>
      )}

      {/* Timeline */}
      {interacoes.length === 0 ? (
        <p className="text-sm text-[#A0AEC0] py-4">Nenhum registro ainda.</p>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-[#DDD9D2]" />

          <div className="space-y-4">
            {[...interacoes].reverse().map(i => {
              const Icon = ICON_TIPO[i.tipo] ?? MessageSquare
              const cor = COR_TIPO[i.tipo] ?? COR_TIPO.nota

              return (
                <div key={i.id} className="flex gap-4 relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${cor}`}>
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 bg-white border border-[#DDD9D2] rounded-xl p-4 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {i.autor_nome && (
                        <span className="text-xs font-semibold text-[#0B1929]">{i.autor_nome}</span>
                      )}
                      <span className="text-xs text-[#A0AEC0]">{formatarDataHora(i.criado_em)}</span>
                    </div>
                    <p className="text-sm text-[#3A5A78] whitespace-pre-wrap">{i.descricao}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
