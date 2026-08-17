import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Building2, TrendingUp, Phone, ChevronRight } from 'lucide-react'

function saudacao(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nome = user?.user_metadata?.nome ?? user?.email?.split('@')[0] ?? 'Usuário'
  const perfil: string = user?.user_metadata?.perfil ?? 'vendedor'

  const { count: totalEmpresas } = await supabase
    .from('empresas')
    .select('*', { count: 'exact', head: true })
    .eq('ativo', true)

  const empresasAtivas = totalEmpresas ?? 0

  return (
    <div className="p-8 max-w-3xl">

      {/* Saudação */}
      <p className="text-sm text-[#7A8FA6] font-medium mb-1">{saudacao()}</p>
      <h1 className="text-3xl font-black text-[#0B1929] tracking-tight mb-6">
        {nome}
      </h1>

      {/* CTA principal — varia por perfil */}
      {perfil === 'vendedor' && (
        <CtaVendedor empresasAtivas={empresasAtivas} />
      )}
      {(perfil === 'gestor' || perfil === 'admin') && (
        <CtaGestor empresasAtivas={empresasAtivas} />
      )}
      {perfil === 'estoquista' && (
        <CtaEstoquista />
      )}

      {/* Cards de métricas */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <MetricCard
          label="Empresas ativas"
          value={empresasAtivas > 0 ? String(empresasAtivas) : '0'}
          sub="no cadastro"
          href="/empresas"
          ativa={empresasAtivas > 0}
        />
        <MetricCard
          label="Negociações"
          value="—"
          sub="em breve"
          href={null}
          ativa={false}
        />
        <MetricCard
          label="Ligações hoje"
          value="—"
          sub="em breve"
          href={null}
          ativa={false}
        />
      </div>

      {/* Roadmap / status */}
      <div className="mt-6 space-y-3">
        <StatusItem done label="Alicerce" desc="Login, perfis, estrutura e deploy" />
        <StatusItem done label="Empresas e Contatos" desc="Cadastro, busca, endereços, condições comerciais" />
        <StatusItem label="Negociações" desc="Funil de vendas, abertura, histórico por empresa" next />
        <StatusItem label="Rotina Comercial" desc="Tarefas, ligações diárias, missão do mês" />
        <StatusItem label="Relatórios e Operação" desc="BI comercial, rotas, estoque, fornecedores" />
      </div>

    </div>
  )
}

function CtaVendedor({ empresasAtivas }: { empresasAtivas: number }) {
  if (empresasAtivas === 0) {
    return (
      <div className="bg-[#0B1929] rounded-2xl p-6 text-white">
        <p className="text-white/50 text-sm mb-1">Por onde começar</p>
        <p className="text-xl font-bold mb-4">Cadastre sua carteira de clientes</p>
        <Link
          href="/empresas"
          className="inline-flex items-center gap-2 bg-[#F5B800] text-[#0B1929] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E0A900] transition-colors"
        >
          <Building2 size={16} />
          Ir para Empresas
          <ChevronRight size={14} />
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#0B1929] rounded-2xl p-6 text-white">
      <p className="text-white/50 text-sm mb-1">Sua carteira</p>
      <p className="text-xl font-bold mb-1">
        {empresasAtivas} empresa{empresasAtivas !== 1 ? 's' : ''} ativa{empresasAtivas !== 1 ? 's' : ''}
      </p>
      <p className="text-white/40 text-sm mb-4">A rotina de ligações chega na Fase 3.</p>
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 bg-[#F5B800] text-[#0B1929] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E0A900] transition-colors"
      >
        <Building2 size={16} />
        Ver empresas
        <ChevronRight size={14} />
      </Link>
    </div>
  )
}

function CtaGestor({ empresasAtivas }: { empresasAtivas: number }) {
  return (
    <div className="bg-[#0B1929] rounded-2xl p-6 text-white">
      <p className="text-white/50 text-sm mb-1">Visão geral</p>
      <p className="text-xl font-bold mb-1">
        {empresasAtivas} empresa{empresasAtivas !== 1 ? 's' : ''} ativa{empresasAtivas !== 1 ? 's' : ''} na base
      </p>
      <p className="text-white/40 text-sm mb-4">Alertas e exceções da equipe chegam na Fase 2.</p>
      <Link
        href="/empresas"
        className="inline-flex items-center gap-2 bg-[#F5B800] text-[#0B1929] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#E0A900] transition-colors"
      >
        <Building2 size={16} />
        Ver empresas
        <ChevronRight size={14} />
      </Link>
    </div>
  )
}

function CtaEstoquista() {
  return (
    <div className="bg-[#0B1929] rounded-2xl p-6 text-white">
      <p className="text-white/50 text-sm mb-1">Operação</p>
      <p className="text-xl font-bold mb-1">Módulo de estoque em construção</p>
      <p className="text-white/40 text-sm">Rotas, estoque e recebimentos chegam na Fase 4.</p>
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string
  sub: string
  href: string | null
  ativa: boolean
}

function MetricCard({ label, value, sub, href, ativa }: MetricCardProps) {
  const content = (
    <div className={`bg-white rounded-xl border border-[#DDD9D2] p-5 h-full transition-colors ${href ? 'hover:border-[#F5B800] hover:shadow-sm cursor-pointer' : ''}`}>
      <p className="text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-3xl font-black ${ativa ? 'text-[#0B1929]' : 'text-[#DDD9D2]'}`}>{value}</p>
      <p className="text-xs text-[#A0AEC0] mt-0.5">{sub}</p>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return <div>{content}</div>
}

interface StatusItemProps {
  done?: boolean
  next?: boolean
  label: string
  desc: string
}

function StatusItem({ done, next, label, desc }: StatusItemProps) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${
      done ? 'border-[#D4EDDA] bg-[#F0FAF3]' :
      next ? 'border-[#F5B800]/40 bg-[#FFF8D6]' :
      'border-[#DDD9D2] bg-white opacity-60'
    }`}>
      <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
        done ? 'bg-[#1A6B35]' :
        next ? 'bg-[#F5B800]' :
        'bg-[#DDD9D2]'
      }`}>
        {done && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <p className={`text-sm font-semibold ${done ? 'text-[#1A6B35]' : next ? 'text-[#6B4B00]' : 'text-[#7A8FA6]'}`}>
          {label}
          {next && <span className="ml-2 text-xs font-normal">← próximo</span>}
        </p>
        <p className={`text-xs mt-0.5 ${done ? 'text-[#2D8B4E]' : next ? 'text-[#7A5200]' : 'text-[#A0AEC0]'}`}>{desc}</p>
      </div>
    </div>
  )
}
