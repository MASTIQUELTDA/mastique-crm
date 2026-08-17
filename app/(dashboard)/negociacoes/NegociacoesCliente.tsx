'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { NegociacaoResumo } from '@/lib/types'

const ABAS = [
  { key: 'abertas',     label: 'Abertas' },
  { key: 'novos',       label: 'Novos' },
  { key: 'recorrentes', label: 'Recorrentes' },
  { key: 'gaveta',      label: 'Gaveta' },
  { key: 'historico',   label: 'Histórico' },
]

const FUNIL_BADGE: Record<string, { cls: string; label: string }> = {
  novos:       { cls: 'bg-[#E0EDFF] text-[#1A3E7A]',   label: 'Novos' },
  recorrentes: { cls: 'bg-[#E6F4EC] text-[#1A6B35]',   label: 'Recorrentes' },
  gaveta:      { cls: 'bg-[#FFF3CD] text-[#7A4F00]',   label: 'Gaveta' },
  rateio:      { cls: 'bg-[#FDE8E8] text-[#8B1A1A]',   label: 'Rateio' },
}

function statusBadge(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    aberta:    { variant: 'info',    label: 'Aberta' },
    concluida: { variant: 'success', label: 'Concluída' },
    cancelada: { variant: 'danger',  label: 'Cancelada' },
  }
  return map[status] ?? { variant: 'default', label: status }
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatarMoeda(v: number | null) {
  if (v == null) return null
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface Props {
  negociacoesIniciais: NegociacaoResumo[]
  abaAtiva: string
}

export default function NegociacoesCliente({ negociacoesIniciais, abaAtiva }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function navegar(aba: string) {
    const sp = new URLSearchParams()
    if (aba !== 'abertas') sp.set('aba', aba)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  const nome = negociacoesIniciais.length === 1 ? 'negociação' : 'negociações'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#DDD9D2] bg-white">
        <h1 className="text-2xl font-black text-[#0B1929] tracking-tight">Negociações</h1>
        <p className="text-sm text-[#7A8FA6] mt-0.5">
          {negociacoesIniciais.length} {nome} encontrada{negociacoesIniciais.length !== 1 ? 's' : ''}
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 border-b border-[#DDD9D2] -mb-[1px]">
          {ABAS.map(aba => (
            <button
              key={aba.key}
              onClick={() => navegar(aba.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                abaAtiva === aba.key
                  ? 'border-[#F5B800] text-[#0B1929]'
                  : 'border-transparent text-[#7A8FA6] hover:text-[#0B1929]'
              }`}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {negociacoesIniciais.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp size={40} className="text-[#DDD9D2] mb-4" />
            <p className="text-[#7A8FA6] font-medium">Nenhuma negociação aqui</p>
            <p className="text-sm text-[#A0AEC0] mt-1">
              {abaAtiva === 'gaveta'
                ? 'Nenhuma empresa na Gaveta no momento.'
                : abaAtiva === 'historico'
                ? 'Nenhuma venda concluída ou cancelada ainda.'
                : 'Abra uma negociação a partir da tela de uma empresa.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#DDD9D2] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD9D2] bg-[#F4F2EE]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Região / Funil</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Responsável</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Próxima ação</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Valor est.</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {negociacoesIniciais.map((neg, i) => {
                  const funil = FUNIL_BADGE[neg.empresa_funil]
                  const status = statusBadge(neg.status)
                  const atrasada = neg.data_proxima_acao && new Date(neg.data_proxima_acao) < new Date() && neg.status === 'aberta'

                  return (
                    <tr
                      key={neg.id}
                      className={`border-b border-[#F4F2EE] last:border-0 hover:bg-[#FAFAF8] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFAF8]/50'}`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0B1929] leading-tight">
                          {neg.empresa_fantasia ?? neg.empresa_nome}
                        </p>
                        {neg.empresa_fantasia && (
                          <p className="text-xs text-[#7A8FA6] mt-0.5">{neg.empresa_nome}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-semibold text-[#3A5A78] bg-[#E8EDF2] px-2 py-0.5 rounded w-fit">
                            {neg.empresa_regiao === 'reg1' ? 'REG 1' : 'REG 2'}
                          </span>
                          {funil && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded w-fit ${funil.cls}`}>
                              {funil.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {neg.vendedor_nome
                          ? <p className="text-sm text-[#0B1929]">{neg.vendedor_nome}</p>
                          : <span className="text-[#DDD9D2] text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        {neg.data_proxima_acao ? (
                          <p className={`text-sm flex items-center gap-1 ${atrasada ? 'text-[#E53E3E] font-semibold' : 'text-[#5E7A96]'}`}>
                            <Calendar size={12} />
                            {formatarData(neg.data_proxima_acao)}
                            {atrasada && ' ⚠'}
                          </p>
                        ) : (
                          <span className="text-[#DDD9D2] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[#5E7A96]">
                        {formatarMoeda(neg.valor_estimado) ?? <span className="text-[#DDD9D2] text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/negociacoes/${neg.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#3A5A78] hover:text-[#0B1929] transition-colors"
                        >
                          Ver
                          <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
