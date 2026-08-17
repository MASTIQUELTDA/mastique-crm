import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const nome = user?.user_metadata?.nome ?? user?.email?.split('@')[0] ?? 'Usuário'

  return (
    <div className="p-8">
      <div className="max-w-2xl">
        <p className="text-sm text-[#7A8FA6] font-medium mb-1">Bem-vinda de volta</p>
        <h1 className="text-3xl font-black text-[#0B1929] tracking-tight mb-2">
          Olá, {nome} 👋
        </h1>
        <p className="text-[#5E7A96]">
          O Mastique CRM está sendo construído. Em breve você terá sua rotina comercial completa aqui.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Empresas', value: '—', sub: 'cadastros' },
            { label: 'Negociações', value: '—', sub: 'em aberto' },
            { label: 'Ligações hoje', value: '—', sub: 'na fila' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-xl border border-[#DDD9D2] p-5">
              <p className="text-xs font-semibold text-[#7A8FA6] uppercase tracking-wide mb-1">{card.label}</p>
              <p className="text-3xl font-black text-[#0B1929]">{card.value}</p>
              <p className="text-xs text-[#7A8FA6] mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-[#FFF8D6] border border-[#F5B800]/30 rounded-xl p-5">
          <p className="text-sm font-bold text-[#6B4B00] mb-1">🚧 Fase 0 concluída</p>
          <p className="text-sm text-[#6B4B00]/80">
            A estrutura base está pronta. Próximo passo: conectar o Supabase e fazer o primeiro deploy.
          </p>
        </div>
      </div>
    </div>
  )
}
