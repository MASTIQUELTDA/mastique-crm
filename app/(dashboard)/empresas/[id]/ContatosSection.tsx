'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Phone, Mail, Star } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adicionarContato, editarContato, removerContato } from '@/app/actions/contatos'
import type { Contato } from '@/lib/types'

interface Props {
  empresaId: string
  contatos: Contato[]
}

interface FormContatoProps {
  onSubmit: (formData: FormData) => void
  pending: boolean
  erro: string | null
  inicial?: Partial<Contato>
  formId: string
}

function FormContato({ onSubmit, pending, erro, inicial, formId }: FormContatoProps) {
  return (
    <form id={formId} action={onSubmit} className="space-y-4">
      {erro && (
        <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
          {erro}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input name="nome" label="Nome" defaultValue={inicial?.nome} required />
        <Input name="cargo" label="Cargo" defaultValue={inicial?.cargo ?? ''} placeholder="Ex: Gerente de compras" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input name="telefone" label="Telefone" defaultValue={inicial?.telefone ?? ''} placeholder="(00) 0000-0000" />
        <Input name="whatsapp" label="WhatsApp" defaultValue={inicial?.whatsapp ?? ''} placeholder="(00) 9 0000-0000" />
      </div>
      <Input name="email" label="E-mail" type="email" defaultValue={inicial?.email ?? ''} placeholder="contato@empresa.com" />
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          name="principal"
          value="true"
          defaultChecked={inicial?.principal}
          className="w-4 h-4 rounded border-[#DDD9D2] accent-[#F5B800]"
        />
        <span className="text-sm text-[#3A5A78] font-medium">Contato principal da empresa</span>
      </label>
    </form>
  )
}

export function ContatosSection({ empresaId, contatos }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [contatoEditando, setContatoEditando] = useState<Contato | null>(null)
  const [contatoRemovendo, setContatoRemovendo] = useState<Contato | null>(null)

  function handleAdicionar(formData: FormData) {
    // checkbox não enviado = false
    if (!formData.get('principal')) formData.set('principal', 'false')
    setErro(null)
    startTransition(async () => {
      const result = await adicionarContato(empresaId, formData)
      if (result.error) { setErro(result.error); return }
      setModalAdicionar(false)
      router.refresh()
    })
  }

  function handleEditar(formData: FormData) {
    if (!contatoEditando) return
    if (!formData.get('principal')) formData.set('principal', 'false')
    setErro(null)
    startTransition(async () => {
      const result = await editarContato(contatoEditando.id, empresaId, formData)
      if (result.error) { setErro(result.error); return }
      setContatoEditando(null)
      router.refresh()
    })
  }

  function handleRemover() {
    if (!contatoRemovendo) return
    startTransition(async () => {
      await removerContato(contatoRemovendo.id, empresaId)
      setContatoRemovendo(null)
      router.refresh()
    })
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Contatos</h2>
          <Button variant="ghost" size="sm" onClick={() => { setErro(null); setModalAdicionar(true) }}>
            <Plus size={13} />
            Adicionar
          </Button>
        </div>

        {contatos.length === 0 ? (
          <button
            onClick={() => { setErro(null); setModalAdicionar(true) }}
            className="w-full py-6 border-2 border-dashed border-[#DDD9D2] rounded-xl text-sm text-[#A0AEC0] hover:border-[#F5B800] hover:text-[#7A8FA6] transition-colors"
          >
            <Plus size={16} className="mx-auto mb-1" />
            Adicionar contato
          </button>
        ) : (
          <div className="space-y-3">
            {contatos.map(c => (
              <div key={c.id} className="bg-white border border-[#DDD9D2] rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#0B1929] text-sm truncate">{c.nome}</p>
                      {c.principal && (
                        <Badge variant="info" className="shrink-0">
                          <Star size={9} className="mr-0.5" />
                          Principal
                        </Badge>
                      )}
                    </div>
                    {c.cargo && <p className="text-xs text-[#7A8FA6] mt-0.5">{c.cargo}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setErro(null); setContatoEditando(c) }}
                      className="p-1.5 rounded-lg hover:bg-[#F4F2EE] text-[#7A8FA6] hover:text-[#0B1929] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setContatoRemovendo(c)}
                      className="p-1.5 rounded-lg hover:bg-[#FDE8E8] text-[#7A8FA6] hover:text-[#E53E3E] transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {c.telefone && (
                    <a href={`tel:${c.telefone}`} className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]">
                      <Phone size={12} />{c.telefone}
                    </a>
                  )}
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/55${c.whatsapp.replace(/\D/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]"
                    >
                      <Phone size={12} className="text-green-500" />{c.whatsapp}
                    </a>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-[#3A5A78] hover:text-[#0B1929]">
                      <Mail size={12} />{c.email}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal: adicionar */}
      <Modal
        open={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        title="Novo contato"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalAdicionar(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-add-contato" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <FormContato formId="form-add-contato" onSubmit={handleAdicionar} pending={pending} erro={erro} />
      </Modal>

      {/* Modal: editar */}
      <Modal
        open={!!contatoEditando}
        onClose={() => setContatoEditando(null)}
        title="Editar contato"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setContatoEditando(null)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-edit-contato" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <FormContato
          formId="form-edit-contato"
          onSubmit={handleEditar}
          pending={pending}
          erro={erro}
          inicial={contatoEditando ?? undefined}
        />
      </Modal>

      {/* Modal: confirmar remoção */}
      <Modal
        open={!!contatoRemovendo}
        onClose={() => setContatoRemovendo(null)}
        title="Remover contato"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setContatoRemovendo(null)} disabled={pending}>Cancelar</Button>
            <Button variant="danger" onClick={handleRemover} loading={pending}>Remover</Button>
          </div>
        }
      >
        <p className="text-sm text-[#3A5A78]">
          Tem certeza que deseja remover <strong>{contatoRemovendo?.nome}</strong>? Esta ação não pode ser desfeita.
        </p>
      </Modal>
    </>
  )
}
