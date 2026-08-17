import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buscarNegociacao } from '@/app/actions/negociacoes'
import { Badge } from '@/components/ui/Badge'
import NegociacaoDetalheCliente from './NegociacaoDetalheCliente'
import TimelineInteracoes from './TimelineInteracoes'

function badgeStatus(status: string) {
  const map: Record<string, { variant: any; label: string }> = {
    aberta:    { variant: 'info',    label: 'Aberta' },
    concluida: { variant: 'success', label: 'Concluída' },
    cancelada: { variant: 'danger',  label: 'Cancelada' },
  }
  return map[status] ?? { variant: 'default', label: status }
}

function badgeFunil(funil: string) {
  const map: Record<string, string> = {
    novos: 'bg-[#E0EDFF] text-[#1A3E7A]',
    recorrentes: 'bg-[#E6F4EC] text-[#1A6B35]',
    gaveta: 'bg-[#FFF3CD] text-[#7A4F00]',
    rateio: 'bg-[#FDE8E8] text-[#8B1A1A]',
  }
  const labels: Record<string, string> = {
    novos: 'Novos', recorrentes: 'Recorrentes', gaveta: 'Gaveta', rateio: 'Rateio'
  }
  return { cls: map[funil] ?? 'bg-[#F4F2EE] text-[#7A8FA6]', label: labels[funil] ?? funil }
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function NegociacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let neg
  try {
    neg = await buscarNegociacao(id)
  } catch {
    notFound()
  }

  const status = badgeStatus(neg.status)
  const funil = badgeFunil(neg.empresa_funil)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-[#DDD9D2] bg-white">
        <Link href="/negociacoes" className="p-1.5 rounded-lg hover:bg-[#F4F2EE] text-[#7A8FA6] hover:text-[#0B1929] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-[#0B1929] tracking-tight">
              {neg.empresa_fantasia ?? neg.empresa_nome}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            <span className="text-xs font-semibold text-[#3A5A78] bg-[#E8EDF2] px-2 py-0.5 rounded">
              {neg.empresa_regiao === 'reg1' ? 'REG 1' : 'REG 2'}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${funil.cls}`}>
              {funil.label}
            </span>
          </div>
          {neg.empresa_fantasia && (
            <p className="text-sm text-[#7A8FA6] mt-0.5">{neg.empresa_nome}</p>
          )}
        </div>
        <NegociacaoDetalheCliente neg={neg} />
      </div>

      {/* Corpo 65/35 */}
      <div className="flex flex-1 overflow-hidden">

        {/* Timeline (65%) */}
        <div className="flex-[65] overflow-y-auto px-8 py-6">
          <TimelineInteracoes
            negociacaoId={neg.id}
            interacoes={neg.interacoes as any}
            aberta={neg.status === 'aberta'}
          />
        </div>

        {/* Contexto (35%) */}
        <div className="flex-[35] border-l border-[#DDD9D2] overflow-y-auto px-6 py-6 space-y-6 bg-[#FAFAF8]">

          {/* Dados da negociação */}
          <section>
            <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Negociação</h2>
            <div className="bg-white border border-[#DDD9D2] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-[#7A8FA6] mb-0.5">Aberta em</p>
                <p className="text-sm text-[#0B1929]">{formatarData(neg.criado_em)}</p>
              </div>
              {neg.vendedor_nome && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Responsável</p>
                  <p className="text-sm text-[#0B1929]">{neg.vendedor_nome}</p>
                </div>
              )}
              {neg.valor_estimado != null && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Valor estimado</p>
                  <p className="text-sm font-semibold text-[#0B1929]">
                    {Number(neg.valor_estimado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}
              {neg.origem && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Origem</p>
                  <p className="text-sm text-[#0B1929] capitalize">{neg.origem.replace('_', ' ')}</p>
                </div>
              )}
              {neg.data_proxima_acao && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Próxima ação</p>
                  <p className={`text-sm font-semibold ${
                    new Date(neg.data_proxima_acao) < new Date() && neg.status === 'aberta'
                      ? 'text-[#E53E3E]'
                      : 'text-[#0B1929]'
                  }`}>
                    {formatarData(neg.data_proxima_acao)}
                  </p>
                </div>
              )}
              {neg.observacoes && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Observações</p>
                  <p className="text-xs text-[#5E7A96] whitespace-pre-wrap">{neg.observacoes}</p>
                </div>
              )}
              {neg.motivo_fechamento && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">
                    {neg.status === 'cancelada' ? 'Motivo do cancelamento' : 'Observação de fechamento'}
                  </p>
                  <p className="text-xs text-[#5E7A96]">{neg.motivo_fechamento}</p>
                </div>
              )}
            </div>
          </section>

          {/* Link para a empresa */}
          <section>
            <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Empresa</h2>
            <Link
              href={`/empresas/${neg.empresa_id}`}
              className="flex items-center justify-between bg-white border border-[#DDD9D2] rounded-xl p-4 hover:border-[#F5B800] transition-colors group"
            >
              <div>
                <p className="font-semibold text-sm text-[#0B1929]">{neg.empresa_fantasia ?? neg.empresa_nome}</p>
                {neg.empresa_segmento && <p className="text-xs text-[#7A8FA6] mt-0.5">{neg.empresa_segmento}</p>}
              </div>
              <ArrowLeft size={14} className="text-[#7A8FA6] group-hover:text-[#0B1929] rotate-180" />
            </Link>
          </section>

        </div>
      </div>
    </div>
  )
}
