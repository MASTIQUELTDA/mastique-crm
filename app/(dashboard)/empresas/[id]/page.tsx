import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { buscarEmpresa } from '@/app/actions/empresas'
import { Badge } from '@/components/ui/Badge'
import { ContatosSection } from './ContatosSection'
import { EnderecosSection } from './EnderecosSection'
import { CondicoesSection } from './CondicoesSection'
import EmpresaDetalheCliente from './EmpresaDetalheCliente'

function formatarCpfCnpj(valor: string): string {
  const s = valor.replace(/\D/g, '')
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  return valor
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function EmpresaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let empresa
  try {
    empresa = await buscarEmpresa(id)
  } catch {
    notFound()
  }

  const condicao = empresa.condicoes_comerciais[0] ?? null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-5 border-b border-[#DDD9D2] bg-white">
        <Link href="/empresas" className="p-1.5 rounded-lg hover:bg-[#F4F2EE] text-[#7A8FA6] hover:text-[#0B1929] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-[#0B1929] tracking-tight">
              {empresa.nome_fantasia ?? empresa.razao_social}
            </h1>
            <Badge variant={empresa.ativo ? 'success' : 'inactive'}>
              {empresa.ativo ? 'Ativa' : 'Inativa'}
            </Badge>
            {empresa.segmento && <Badge variant="default">{empresa.segmento}</Badge>}
          </div>
          {empresa.nome_fantasia && (
            <p className="text-sm text-[#7A8FA6] mt-0.5">{empresa.razao_social}</p>
          )}
        </div>
        <EmpresaDetalheCliente empresa={empresa} />
      </div>

      {/* Corpo 65/35 */}
      <div className="flex flex-1 overflow-hidden">

        {/* Coluna principal (65%) */}
        <div className="flex-[65] overflow-y-auto px-8 py-6 space-y-6">
          <ContatosSection empresaId={empresa.id} contatos={empresa.contatos} />
          <EnderecosSection empresaId={empresa.id} enderecos={empresa.enderecos} />
        </div>

        {/* Coluna contexto (35%) */}
        <div className="flex-[35] border-l border-[#DDD9D2] overflow-y-auto px-6 py-6 space-y-6 bg-[#FAFAF8]">

          {/* Identificação */}
          <section>
            <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Identificação</h2>
            <div className="bg-white border border-[#DDD9D2] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-[#7A8FA6] mb-0.5">CPF / CNPJ</p>
                <p className="font-mono text-sm font-semibold text-[#0B1929]">{formatarCpfCnpj(empresa.cpf_cnpj)}</p>
              </div>
              <div>
                <p className="text-xs text-[#7A8FA6] mb-0.5">Tipo</p>
                <p className="text-sm text-[#0B1929]">{empresa.tipo === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
              </div>
              {empresa.segmento && (
                <div>
                  <p className="text-xs text-[#7A8FA6] mb-0.5">Segmento</p>
                  <p className="text-sm text-[#0B1929]">{empresa.segmento}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-[#7A8FA6] mb-0.5">Cadastrada em</p>
                <p className="text-sm text-[#0B1929]">{formatarData(empresa.criado_em)}</p>
              </div>
            </div>
          </section>

          <CondicoesSection empresaId={empresa.id} condicao={condicao} />

        </div>
      </div>
    </div>
  )
}
