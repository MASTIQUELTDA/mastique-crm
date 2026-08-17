'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { adicionarEndereco, editarEndereco, removerEndereco } from '@/app/actions/enderecos'
import { buscarCep } from '@/app/actions/empresas'
import type { Endereco } from '@/lib/types'

const TIPOS = [
  { value: 'principal', label: 'Principal' },
  { value: 'entrega', label: 'Entrega' },
  { value: 'cobranca', label: 'Cobrança' },
  { value: 'outro', label: 'Outro' },
]

const LABEL_TIPO: Record<string, string> = {
  principal: 'Principal', entrega: 'Entrega', cobranca: 'Cobrança', outro: 'Outro',
}

interface Props {
  empresaId: string
  enderecos: Endereco[]
}

interface FormEnderecoProps {
  formId: string
  onSubmit: (formData: FormData) => void
  pending: boolean
  erro: string | null
  inicial?: Partial<Endereco>
}

function FormEndereco({ formId, onSubmit, pending, erro, inicial }: FormEnderecoProps) {
  const [cepCarregando, setCepCarregando] = useState(false)
  const [end, setEnd] = useState({
    logradouro: inicial?.logradouro ?? '',
    bairro: inicial?.bairro ?? '',
    cidade: inicial?.cidade ?? '',
    uf: inicial?.uf ?? '',
  })

  async function handleCep(e: React.ChangeEvent<HTMLInputElement>) {
    const cep = e.target.value
    if (cep.replace(/\D/g, '').length === 8) {
      setCepCarregando(true)
      const dados = await buscarCep(cep)
      if (dados) setEnd(dados)
      setCepCarregando(false)
    }
  }

  return (
    <form id={formId} action={onSubmit} className="space-y-4">
      {erro && (
        <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
          {erro}
        </div>
      )}
      <Select name="tipo" label="Tipo" options={TIPOS} defaultValue={inicial?.tipo ?? 'principal'} />
      <div className="grid grid-cols-3 gap-3">
        <Input
          name="cep"
          label={cepCarregando ? 'CEP (buscando...)' : 'CEP'}
          defaultValue={inicial?.cep ?? ''}
          onChange={handleCep}
        />
        <div className="col-span-2">
          <Input
            name="logradouro"
            label="Logradouro"
            value={end.logradouro}
            onChange={e => setEnd(p => ({ ...p, logradouro: e.target.value }))}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Input name="numero" label="Número" defaultValue={inicial?.numero ?? ''} />
        <Input name="complemento" label="Complemento" defaultValue={inicial?.complemento ?? ''} />
        <Input
          name="bairro"
          label="Bairro"
          value={end.bairro}
          onChange={e => setEnd(p => ({ ...p, bairro: e.target.value }))}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Input
            name="cidade"
            label="Cidade"
            value={end.cidade}
            onChange={e => setEnd(p => ({ ...p, cidade: e.target.value }))}
          />
        </div>
        <Input
          name="uf"
          label="UF"
          maxLength={2}
          value={end.uf}
          onChange={e => setEnd(p => ({ ...p, uf: e.target.value.toUpperCase() }))}
        />
      </div>
    </form>
  )
}

export function EnderecosSection({ empresaId, enderecos }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [modalAdicionar, setModalAdicionar] = useState(false)
  const [enderecoEditando, setEnderecoEditando] = useState<Endereco | null>(null)
  const [enderecoRemovendo, setEnderecoRemovendo] = useState<Endereco | null>(null)

  function handleAdicionar(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await adicionarEndereco(empresaId, formData)
      if (result.error) { setErro(result.error); return }
      setModalAdicionar(false)
      router.refresh()
    })
  }

  function handleEditar(formData: FormData) {
    if (!enderecoEditando) return
    setErro(null)
    startTransition(async () => {
      const result = await editarEndereco(enderecoEditando.id, empresaId, formData)
      if (result.error) { setErro(result.error); return }
      setEnderecoEditando(null)
      router.refresh()
    })
  }

  function handleRemover() {
    if (!enderecoRemovendo) return
    startTransition(async () => {
      await removerEndereco(enderecoRemovendo.id, empresaId)
      setEnderecoRemovendo(null)
      router.refresh()
    })
  }

  return (
    <>
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest">Endereços</h2>
          <Button variant="ghost" size="sm" onClick={() => { setErro(null); setModalAdicionar(true) }}>
            <Plus size={13} />
            Adicionar
          </Button>
        </div>

        {enderecos.length === 0 ? (
          <button
            onClick={() => { setErro(null); setModalAdicionar(true) }}
            className="w-full py-6 border-2 border-dashed border-[#DDD9D2] rounded-xl text-sm text-[#A0AEC0] hover:border-[#F5B800] hover:text-[#7A8FA6] transition-colors"
          >
            <Plus size={16} className="mx-auto mb-1" />
            Adicionar endereço
          </button>
        ) : (
          <div className="space-y-3">
            {enderecos.map(e => (
              <div key={e.id} className="bg-white border border-[#DDD9D2] rounded-xl p-4 flex items-start gap-3">
                <MapPin size={15} className="text-[#7A8FA6] mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="default">{LABEL_TIPO[e.tipo] ?? e.tipo}</Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { setErro(null); setEnderecoEditando(e) }}
                        className="p-1.5 rounded-lg hover:bg-[#F4F2EE] text-[#7A8FA6] hover:text-[#0B1929] transition-colors"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => setEnderecoRemovendo(e)}
                        className="p-1.5 rounded-lg hover:bg-[#FDE8E8] text-[#7A8FA6] hover:text-[#E53E3E] transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {(e.logradouro || e.numero) && (
                    <p className="text-sm text-[#0B1929] mt-1">
                      {[e.logradouro, e.numero, e.complemento].filter(Boolean).join(', ')}
                    </p>
                  )}
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

      <Modal
        open={modalAdicionar}
        onClose={() => setModalAdicionar(false)}
        title="Novo endereço"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalAdicionar(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-add-end" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <FormEndereco formId="form-add-end" onSubmit={handleAdicionar} pending={pending} erro={erro} />
      </Modal>

      <Modal
        open={!!enderecoEditando}
        onClose={() => setEnderecoEditando(null)}
        title="Editar endereço"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEnderecoEditando(null)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-edit-end" loading={pending}>Salvar</Button>
          </div>
        }
      >
        {enderecoEditando && (
          <FormEndereco formId="form-edit-end" onSubmit={handleEditar} pending={pending} erro={erro} inicial={enderecoEditando} />
        )}
      </Modal>

      <Modal
        open={!!enderecoRemovendo}
        onClose={() => setEnderecoRemovendo(null)}
        title="Remover endereço"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEnderecoRemovendo(null)} disabled={pending}>Cancelar</Button>
            <Button variant="danger" onClick={handleRemover} loading={pending}>Remover</Button>
          </div>
        }
      >
        <p className="text-sm text-[#3A5A78]">
          Tem certeza que deseja remover este endereço?
        </p>
      </Modal>
    </>
  )
}
