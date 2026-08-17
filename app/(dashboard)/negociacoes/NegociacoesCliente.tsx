'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Calendar, User, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { NegociacaoResumo } from '@/lib/types'

const ABAS = [
  { key: 'aberta', label: 'Abertas' },
  { key: 'reg1', label: 'REG 1 — Novos' },
  { key: 'reg2', label: 'REG 2 — Recorrentes' },
  { key: 'gaveta', label: 'Gaveta' },
  { key: 'historico', label: 'Histórico' },
]

function badgeStatus(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    aberta:    { variant: 'info',     label: 'Aberta' },
    ganha:     { variant: 'success',  label: 'Ganha' },
    perdida:   { variant: 'danger',   label: 'Perdida' },
    gaveta:    { variant: 'warning',  label: 'Gaveta' },
  }
  return map[status] ?? { variant: 'default', label: status }
}

function badgeTipo(tipo: string) {
  return tipo === 'novo'
    ? { variant: 'info' as const, label: 'REG 1 — Novo' }
    : { variant: 'default' as const, label: 'REG 2 — Recorrente' }
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
  tipoFiltro?: string
}

export default function NegociacoesCliente({ negociacoesIniciais, abaAtiva, tipoFiltro }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function navegar(aba: string, tipo?: string) {
    const sp = new URLSearchParams()
    if (aba !== 'aberta') sp.set('status', aba === 'reg1' || aba === 'reg2' ? 'aberta' : aba)
    if (aba === 'reg1') sp.set('tipo', 'novo')
    if (aba === 'reg2') sp.set('tipo', 'recorrente')
    router.replace(`${pathname}?${sp.toString()}`)
  }

  // Aba ativa resolvida para chave de exibição
  const abaChave = abaAtiva === 'aberta' && tipoFiltro === 'novo'
    ? 'reg1'
    : abaAtiva === 'aberta' && tipoFiltro === 'recorrente'
    ? 'reg2'
    : abaAtiva === 'aberta'
    ? 'aberta'
    : abaAtiva

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
                abaChave === aba.key
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
              {abaChave === 'gaveta'
                ? 'Nenhuma negociação na gaveta no momento.'
                : abaChave === 'historico'
                ? 'Nenhuma negociação finalizada ainda.'
                : 'Abra uma negociação a partir da tela de uma empresa.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#DDD9D2] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD9D2] bg-[#F4F2EE]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Responsável</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Próxima ação</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Valor est.</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {negociacoesIniciais.map((neg, i) => {
                  const tipo = badgeTipo(neg.tipo)
                  const status = badgeStatus(neg.status)
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
                        <Badge variant={tipo.variant}>{tipo.label}</Badge>
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
