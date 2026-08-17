'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, Building2, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmpresaDrawer } from './EmpresaDrawer'
import type { EmpresaResumo } from '@/lib/types'

const SEGMENTOS = [
  'Alimentício', 'Farmácia', 'Pet Shop', 'Padaria', 'Supermercado',
  'Distribuidora', 'Açougue', 'Restaurante', 'Outro',
]

const FUNIL_LABEL: Record<string, string> = {
  novos: 'Novos',
  recorrentes: 'Recorrentes',
  gaveta: 'Gaveta',
  rateio: 'Rateio',
}

const FUNIL_BADGE: Record<string, string> = {
  novos:       'bg-[#E0EDFF] text-[#1A3E7A]',
  recorrentes: 'bg-[#E6F4EC] text-[#1A6B35]',
  gaveta:      'bg-[#FFF3CD] text-[#7A4F00]',
  rateio:      'bg-[#FDE8E8] text-[#8B1A1A]',
}

interface EmpresasClienteProps {
  empresasIniciais: EmpresaResumo[]
  filtros: { q?: string; segmento?: string; ativo?: string; funil?: string; regiao?: string }
}

function formatarCpfCnpj(valor: string): string {
  const s = valor.replace(/\D/g, '')
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return valor
}

export default function EmpresasCliente({ empresasIniciais, filtros }: EmpresasClienteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  const [busca, setBusca] = useState(filtros.q ?? '')
  const [drawerAberto, setDrawerAberto] = useState(false)

  const aplicarFiltros = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams()
    Object.entries({ q: busca, ...filtros, ...params }).forEach(([k, v]) => {
      if (v) sp.set(k, v)
    })
    startTransition(() => router.replace(`${pathname}?${sp.toString()}`))
  }, [busca, filtros, pathname, router])

  function handleBusca(e: React.FormEvent) {
    e.preventDefault()
    aplicarFiltros({ q: busca })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-[#DDD9D2] bg-white">
        <div>
          <h1 className="text-2xl font-black text-[#0B1929] tracking-tight">Empresas</h1>
          <p className="text-sm text-[#7A8FA6] mt-0.5">
            {empresasIniciais.length} {empresasIniciais.length === 1 ? 'empresa' : 'empresas'} encontrada{empresasIniciais.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setDrawerAberto(true)} size="md">
          <Plus size={16} />
          Nova empresa
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-[#DDD9D2] bg-white">
        <form onSubmit={handleBusca} className="flex-1 max-w-sm relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0AEC0]" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, fantasia ou CNPJ..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[#DDD9D2] rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]
                       bg-white placeholder:text-[#A0AEC0] text-[#0B1929]"
          />
        </form>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-[#7A8FA6]" />
          <select
            value={filtros.segmento ?? ''}
            onChange={e => aplicarFiltros({ segmento: e.target.value })}
            className="text-sm border border-[#DDD9D2] rounded-lg px-3 py-2 bg-white text-[#0B1929]
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50"
          >
            <option value="">Todos os segmentos</option>
            {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={filtros.regiao ?? ''}
            onChange={e => aplicarFiltros({ regiao: e.target.value })}
            className="text-sm border border-[#DDD9D2] rounded-lg px-3 py-2 bg-white text-[#0B1929]
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50"
          >
            <option value="">Todas as regiões</option>
            <option value="reg1">REG 1</option>
            <option value="reg2">REG 2</option>
          </select>

          <select
            value={filtros.funil ?? ''}
            onChange={e => aplicarFiltros({ funil: e.target.value })}
            className="text-sm border border-[#DDD9D2] rounded-lg px-3 py-2 bg-white text-[#0B1929]
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50"
          >
            <option value="">Todos os funis</option>
            <option value="novos">Novos</option>
            <option value="recorrentes">Recorrentes</option>
            <option value="gaveta">Gaveta</option>
            <option value="rateio">Rateio</option>
          </select>

          <select
            value={filtros.ativo ?? ''}
            onChange={e => aplicarFiltros({ ativo: e.target.value })}
            className="text-sm border border-[#DDD9D2] rounded-lg px-3 py-2 bg-white text-[#0B1929]
                       focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50"
          >
            <option value="">Ativas e inativas</option>
            <option value="true">Apenas ativas</option>
            <option value="false">Apenas inativas</option>
          </select>
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {empresasIniciais.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Building2 size={40} className="text-[#DDD9D2] mb-4" />
            <p className="text-[#7A8FA6] font-medium">Nenhuma empresa encontrada</p>
            <p className="text-sm text-[#A0AEC0] mt-1">Tente ajustar os filtros ou cadastre uma nova empresa.</p>
            <Button onClick={() => setDrawerAberto(true)} size="sm" className="mt-4">
              <Plus size={14} />
              Cadastrar empresa
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#DDD9D2] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD9D2] bg-[#F4F2EE]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Empresa</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">CPF/CNPJ</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Região</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Funil</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Responsável</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Última compra</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {empresasIniciais.map((empresa, i) => (
                  <tr
                    key={empresa.id}
                    className={`border-b border-[#F4F2EE] last:border-0 hover:bg-[#FAFAF8] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFAF8]/50'}`}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-[#0B1929] leading-tight">
                          {empresa.nome_fantasia ?? empresa.razao_social}
                        </p>
                        {empresa.nome_fantasia && (
                          <p className="text-xs text-[#7A8FA6] mt-0.5">{empresa.razao_social}</p>
                        )}
                        {empresa.segmento && (
                          <Badge variant="default" className="mt-1">{empresa.segmento}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#5E7A96] font-mono text-xs">
                      {formatarCpfCnpj(empresa.cpf_cnpj)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-[#3A5A78] bg-[#E8EDF2] px-2 py-0.5 rounded">
                        {empresa.regiao === 'reg1' ? 'REG 1' : 'REG 2'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${FUNIL_BADGE[empresa.funil] ?? 'bg-[#F4F2EE] text-[#7A8FA6]'}`}>
                        {FUNIL_LABEL[empresa.funil] ?? empresa.funil}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {empresa.vendedor_nome ? (
                        <p className="text-sm text-[#0B1929]">{empresa.vendedor_nome}</p>
                      ) : (
                        <span className="text-[#DDD9D2] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-[#5E7A96]">
                      {empresa.ultima_compra_valida
                        ? new Date(empresa.ultima_compra_valida).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-[#DDD9D2] text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={empresa.ativo ? 'success' : 'inactive'}>
                        {empresa.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/empresas/${empresa.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#3A5A78] hover:text-[#0B1929] transition-colors"
                      >
                        Ver
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer de nova empresa */}
      <EmpresaDrawer
        open={drawerAberto}
        onClose={() => setDrawerAberto(false)}
      />
    </div>
  )
}
