'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle2, Pencil } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { atribuirVendedor } from '@/app/actions/empresas'
import type { PerfilUsuario } from '@/lib/types'

interface Props {
  empresaId: string
  vendedorId: string | null
  vendedorNome: string | null
  vendedores: PerfilUsuario[]
  podeEditar: boolean
}

const LABEL_PERFIL: Record<string, string> = {
  vendedor: 'Vendedor',
  gestor: 'Gestor',
  admin: 'Admin',
}

export function VendedorSection({ empresaId, vendedorId, vendedorNome, vendedores, podeEditar }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [modalAberto, setModalAberto] = useState(false)
  const [selecionado, setSelecionado] = useState<string>(vendedorId ?? '')
  const [erro, setErro] = useState<string | null>(null)

  function handleSalvar() {
    setErro(null)
    startTransition(async () => {
      const result = await atribuirVendedor(empresaId, selecionado || null)
      if (result.error) { setErro(result.error); return }
      setModalAberto(false)
      router.refresh()
    })
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Responsável</h2>
          {podeEditar && (
            <Button variant="ghost" size="sm" onClick={() => { setErro(null); setSelecionado(vendedorId ?? ''); setModalAberto(true) }}>
              <Pencil size={13} />
              Alterar
            </Button>
          )}
        </div>

        <div className="bg-white border border-[#DDD9D2] rounded-xl p-4 flex items-center gap-3">
          <UserCircle2 size={20} className={vendedorNome ? 'text-[#3A5A78]' : 'text-[#DDD9D2]'} />
          {vendedorNome ? (
            <p className="text-sm font-semibold text-[#0B1929]">{vendedorNome}</p>
          ) : (
            <p className="text-sm text-[#A0AEC0]">
              {podeEditar ? 'Sem responsável — clique em Alterar' : 'Sem responsável definido'}
            </p>
          )}
        </div>
      </section>

      <Modal
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        title="Responsável pela empresa"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalAberto(false)} disabled={pending}>Cancelar</Button>
            <Button onClick={handleSalvar} loading={pending}>Salvar</Button>
          </div>
        }
      >
        <div className="space-y-3">
          {erro && (
            <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#3A5A78] uppercase tracking-wide">Vendedor responsável</label>
            <select
              value={selecionado}
              onChange={e => setSelecionado(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#DDD9D2] text-sm text-[#0B1929] bg-white
                         focus:outline-none focus:ring-2 focus:ring-[#F5B800]/50 focus:border-[#F5B800]"
            >
              <option value="">Sem responsável</option>
              {vendedores.map(v => (
                <option key={v.id} value={v.id}>
                  {v.nome} ({LABEL_PERFIL[v.perfil] ?? v.perfil})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </>
  )
}
