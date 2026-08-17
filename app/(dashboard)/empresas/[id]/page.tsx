import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Phone, Mail, CreditCard, Pencil } from 'lucide-react'
import { buscarEmpresa } from '@/app/actions/empresas'
import { Badge } from '@/components/ui/Badge'
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

  const enderecoPrincipal = empresa.enderecos.find(e => e.tipo === 'principal') ?? empresa.enderecos[0]
  const contatoPrincipal = empresa.contatos.find(c => c.principal) ?? empresa.contatos[0]
  const condicao = empresa.condicoes_comerciais[0]

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

          {/* Contatos */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Contatos</h2>
            </div>
            {empresa.contatos.length === 0 ? (
              <p className="text-sm text-[#A0AEC0] py-4">Nenhum contato cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {empresa.contatos.map(c => (
                  <div key={c.id} className="bg-white border border-[#DDD9D2] rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-[#0B1929] text-sm">{c.nome}</p>
                        {c.cargo && <p className="text-xs text-[#7A8FA6] mt-0.5">{c.cargo}</p>}
                      </div>
                      {c.principal && <Badge variant="info">Principal</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3">
                      {c.telefone && (
                        <a href={`tel:${c.telefone}`} className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]">
                          <Phone size={13} />
                          {c.telefone}
                        </a>
                      )}
                      {c.whatsapp && (
                        <a
                          href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]"
                        >
                          <Phone size={13} className="text-green-500" />
                          {c.whatsapp}
                        </a>
                      )}
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]">
                          <Mail size={13} />
                          {c.email}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Endereços */}
          <section>
            <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Endereços</h2>
            {empresa.enderecos.length === 0 ? (
              <p className="text-sm text-[#A0AEC0] py-4">Nenhum endereço cadastrado.</p>
            ) : (
              <div className="space-y-3">
                {empresa.enderecos.map(e => (
                  <div key={e.id} className="bg-white border border-[#DDD9D2] rounded-xl p-4 flex items-start gap-3">
                    <MapPin size={16} className="text-[#7A8FA6] mt-0.5 shrink-0" />
                    <div>
                      <Badge variant="default" className="mb-1">
                        {{ principal: 'Principal', entrega: 'Entrega', cobranca: 'Cobrança', outro: 'Outro' }[e.tipo]}
                      </Badge>
                      <p className="text-sm text-[#0B1929]">
                        {[e.logradouro, e.numero, e.complemento].filter(Boolean).join(', ')}
                      </p>
                      {(e.bairro || e.cidade) && (
                        <p className="text-xs text-[#7A8FA6] mt-0.5">
                          {[e.bairro, e.cidade, e.uf].filter(Boolean).join(' — ')}
                          {e.cep && ` · CEP ${e.cep}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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

          {/* Condições comerciais */}
          <section>
            <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Condições comerciais</h2>
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
                <div className="flex items-center gap-2 text-[#A0AEC0] py-2">
                  <CreditCard size={16} />
                  <p className="text-sm">Sem condições definidas</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
