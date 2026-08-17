'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Building2,
  TrendingUp,
  Phone,
  Package,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navVendedor = [
  { href: '/',             label: 'Início',           icon: Home },
  { href: '/empresas',     label: 'Empresas',         icon: Building2 },
  { href: '/negociacoes',  label: 'Negociações',      icon: TrendingUp },
  { href: '/rotina',       label: 'Rotina Comercial', icon: Phone },
  { href: '/relatorios',   label: 'Relatórios',       icon: BarChart2 },
]

const navAdmin = [
  ...navVendedor,
  { href: '/operacao',     label: 'Operação',         icon: Package },
  { href: '/configuracoes',label: 'Configurações',    icon: Settings },
]

interface SidebarProps {
  perfil?: string
  nome?: string
  email?: string
}

export default function Sidebar({ perfil = 'vendedor', nome, email }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const nav = perfil === 'admin' || perfil === 'gestor' ? navAdmin : navVendedor

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#0B1929] border-r border-white/10 shrink-0">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#F5B800] shrink-0">
          <span className="text-[#0B1929] font-black text-sm">M</span>
        </div>
        <span className="text-white font-bold text-sm tracking-tight leading-none">
          Mastique<br />
          <span className="text-white/40 font-normal text-xs">CRM</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const Icon = item.icon
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} className={cn(isActive ? 'text-[#F5B800]' : 'text-white/40 group-hover:text-white/70')} />
              {item.label}
              {isActive && <ChevronRight size={12} className="ml-auto text-white/30" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-1">
          <p className="text-white text-sm font-semibold truncate">{nome ?? 'Usuário'}</p>
          <p className="text-white/40 text-xs truncate">{email ?? ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-white/50
                     hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>

    </aside>
  )
}
