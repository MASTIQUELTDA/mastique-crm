'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, PowerOff, Power } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { editarEmpresa, toggleAtivoEmpresa } from '@/app/actions/empresas'
import type { EmpresaDetalhe } from '@/lib/types'

const SEGMENTOS = [
  'Alimentício', 'Farmácia', 'Pet Shop', 'Padaria', 'Supermercado',
  'Distribuidora', 'Açougue', 'Restaurante', 'Outro',
].map(s => ({ value: s, label: s }))

interface Props {
  empresa: EmpresaDetalhe
}

export default function EmpresaDetalheCliente({ empresa }: Props) {
  const router = useRouter()
  const [drawerEditar, setDrawerEditar] = useState(false)
  const [modalToggle, setModalToggle] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleEditar(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await editarEmpresa(empresa.id, formData)
      if (result.error) { setErro(result.error); return }
      setDrawerEditar(false)
      router.refresh()
    })
  }

  function handleToggleAtivo() {
    startTransition(async () => {
      await toggleAtivoEmpresa(empresa.id, !empresa.ativo)
      setModalToggle(false)
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModalToggle(true)}
          className={empresa.ativo ? 'text-[#7A8FA6] hover:text-[#E53E3E] hover:bg-[#FDE8E8]' : 'text-[#7A8FA6] hover:text-[#1A6B35] hover:bg-[#E6F4EC]'}
        >
          {empresa.ativo ? <PowerOff size={14} /> : <Power size={14} />}
          {empresa.ativo ? 'Inativar' : 'Reativar'}
        </Button>

        <Button variant="secondary" size="sm" onClick={() => { setErro(null); setDrawerEditar(true) }}>
          <Pencil size={14} />
          Editar
        </Button>
      </div>

      {/* Drawer editar */}
      <Drawer
        open={drawerEditar}
        onClose={() => setDrawerEditar(false)}
        title="Editar empresa"
        subtitle={empresa.razao_social}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDrawerEditar(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-editar-empresa" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <form id="form-editar-empresa" action={handleEditar} className="space-y-5">
          {erro && (
            <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}
          <Input name="razao_social" label="Razão social" defaultValue={empresa.razao_social} required />
          <Input name="nome_fantasia" label="Nome fantasia" defaultValue={empresa.nome_fantasia ?? ''} />
          <Select
            name="segmento"
            label="Segmento"
            options={SEGMENTOS}
            defaultValue={empresa.segmento ?? ''}
            placeholder="Selecionar segmento..."
          />
          <div className="bg-[#F4F2EE] rounded-lg px-4 py-3">
            <p className="text-xs text-[#7A8FA6]">CPF/CNPJ não pode ser alterado após o cadastro.</p>
          </div>
        </form>
      </Drawer>

      {/* Modal confirmar inativar/reativar */}
      <Modal
        open={modalToggle}
        onClose={() => setModalToggle(false)}
        title={empresa.ativo ? 'Inativar empresa' : 'Reativar empresa'}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalToggle(false)} disabled={pending}>Cancelar</Button>
            <Button
              variant={empresa.ativo ? 'danger' : 'primary'}
              onClick={handleToggleAtivo}
              loading={pending}
            >
              {empresa.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </div>
        }
      >
        {empresa.ativo ? (
          <p className="text-sm text-[#3A5A78]">
            Inativar <strong>{empresa.nome_fantasia ?? empresa.razao_social}</strong> vai removê-la dos filtros padrão e da fila de contatos.
            O histórico é preservado e ela pode ser reativada a qualquer momento.
          </p>
        ) : (
          <p className="text-sm text-[#3A5A78]">
            Reativar <strong>{empresa.nome_fantasia ?? empresa.razao_social}</strong> vai fazê-la voltar para a base ativa de clientes.
          </p>
        )}
      </Modal>
    </>
  )
}
