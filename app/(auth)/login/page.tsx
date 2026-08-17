'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0B1929] mb-4">
            <span className="text-[#F5B800] font-black text-lg">M</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B1929] tracking-tight">Mastique CRM</h1>
          <p className="text-sm text-[#7A8FA6] mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-[#DDD9D2] p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0B1929] mb-1.5">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-lg border border-[#DDD9D2] text-[#0B1929] text-sm
                           placeholder:text-[#B0BFCC] focus:outline-none focus:ring-2 focus:ring-[#0B1929]
                           focus:border-transparent transition"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#0B1929] mb-1.5">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2.5 rounded-lg border border-[#DDD9D2] text-[#0B1929] text-sm
                           placeholder:text-[#B0BFCC] focus:outline-none focus:ring-2 focus:ring-[#0B1929]
                           focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0B1929] text-white font-bold text-sm py-2.5 rounded-lg
                         hover:bg-[#132B4A] active:bg-[#0B1929] transition
                         disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                         focus:ring-2 focus:ring-[#F5B800] focus:ring-offset-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
