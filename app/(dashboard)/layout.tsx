import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const nome = user.user_metadata?.nome ?? user.email?.split('@')[0]

  return (
    <div className="flex min-h-screen bg-[#F4F2EE]">
      <Sidebar
        perfil={user.user_metadata?.perfil ?? 'vendedor'}
        nome={nome}
        email={user.email}
      />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}
