'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { editarEmpresa } from '@/app/actions/empresas'
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
  const [drawerAberto, setDrawerAberto] = useState(false)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await editarEmpresa(empresa.id, formData)
      if (result.error) {
        setErro(result.error)
        return
      }
      setDrawerAberto(false)
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setDrawerAberto(true)}>
        <Pencil size={14} />
        Editar
      </Button>

      <Drawer
        open={drawerAberto}
        onClose={() => setDrawerAberto(false)}
        title="Editar empresa"
        subtitle={empresa.razao_social}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setDrawerAberto(false)} disabled={pending}>Cancelar</Button>
            <Button type="submit" form="form-editar-empresa" loading={pending}>Salvar</Button>
          </div>
        }
      >
        <form id="form-editar-empresa" action={handleSubmit} className="space-y-5">
          {erro && (
            <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}
          <Input
            name="razao_social"
            label="Razão social"
            defaultValue={empresa.razao_social}
            required
          />
          <Input
            name="nome_fantasia"
            label="Nome fantasia"
            defaultValue={empresa.nome_fantasia ?? ''}
          />
          <Select
            name="segmento"
            label="Segmento"
            options={SEGMENTOS}
            defaultValue={empresa.segmento ?? ''}
            placeholder="Selecionar segmento..."
          />
          <div className="bg-[#F4F2EE] rounded-lg px-4 py-3">
            <p className="text-xs text-[#7A8FA6]">
              CPF/CNPJ não pode ser alterado após o cadastro.
            </p>
          </div>
        </form>
      </Drawer>
    </>
  )
}
