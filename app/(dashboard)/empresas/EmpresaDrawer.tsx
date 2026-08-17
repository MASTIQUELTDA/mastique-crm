'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Drawer } from '@/components/ui/Drawer'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { criarEmpresa, buscarCep } from '@/app/actions/empresas'

const SEGMENTOS = [
  'Alimentício', 'Farmácia', 'Pet Shop', 'Padaria', 'Supermercado',
  'Distribuidora', 'Açougue', 'Restaurante', 'Outro',
].map(s => ({ value: s, label: s }))

interface EmpresaDrawerProps {
  open: boolean
  onClose: () => void
}

export function EmpresaDrawer({ open, onClose }: EmpresaDrawerProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [cepCarregando, setCepCarregando] = useState(false)
  const [endereco, setEndereco] = useState({ logradouro: '', bairro: '', cidade: '', uf: '' })

  async function handleCep(e: React.ChangeEvent<HTMLInputElement>) {
    const cep = e.target.value
    if (cep.replace(/\D/g, '').length === 8) {
      setCepCarregando(true)
      const dados = await buscarCep(cep)
      if (dados) setEndereco(dados)
      setCepCarregando(false)
    }
  }

  function handleSubmit(formData: FormData) {
    setErro(null)
    startTransition(async () => {
      const result = await criarEmpresa(formData)
      if (result.error) {
        setErro(result.error)
        return
      }
      onClose()
      router.refresh()
    })
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Nova empresa"
      subtitle="Cadastro permanente por CPF/CNPJ"
      width="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" form="form-nova-empresa" loading={pending}>
            Salvar empresa
          </Button>
        </div>
      }
    >
      <form id="form-nova-empresa" action={handleSubmit} className="space-y-6">

        {erro && (
          <div className="bg-[#FDE8E8] border border-[#FABABA] text-[#8B1A1A] text-sm px-4 py-3 rounded-lg">
            {erro}
          </div>
        )}

        {/* Dados principais */}
        <section>
          <h3 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Dados da empresa</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                name="tipo"
                label="Tipo"
                options={[{ value: 'pj', label: 'Pessoa Jurídica' }, { value: 'pf', label: 'Pessoa Física' }]}
                defaultValue="pj"
              />
              <Input
                name="cpf_cnpj"
                label="CPF / CNPJ"
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
            <Input
              name="razao_social"
              label="Razão social"
              placeholder="Nome completo ou razão social"
              required
            />
            <Input
              name="nome_fantasia"
              label="Nome fantasia"
              placeholder="Como a empresa é conhecida (opcional)"
            />
            <Select
              name="segmento"
              label="Segmento"
              options={SEGMENTOS}
              placeholder="Selecionar segmento..."
            />
          </div>
        </section>

        <hr className="border-[#DDD9D2]" />

        {/* Endereço */}
        <section>
          <h3 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Endereço principal</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <Input
                  name="cep"
                  label={cepCarregando ? 'CEP (buscando...)' : 'CEP'}
                  placeholder="00000-000"
                  onChange={handleCep}
                />
              </div>
              <div className="col-span-2">
                <Input
                  name="logradouro"
                  label="Logradouro"
                  placeholder="Rua, Avenida..."
                  value={endereco.logradouro}
                  onChange={e => setEndereco(p => ({ ...p, logradouro: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Input name="numero" label="Número" placeholder="Nº" />
              <Input name="complemento" label="Complemento" placeholder="Apto, sala..." />
              <Input
                name="bairro"
                label="Bairro"
                value={endereco.bairro}
                onChange={e => setEndereco(p => ({ ...p, bairro: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  name="cidade"
                  label="Cidade"
                  value={endereco.cidade}
                  onChange={e => setEndereco(p => ({ ...p, cidade: e.target.value }))}
                />
              </div>
              <Input
                name="uf"
                label="UF"
                maxLength={2}
                value={endereco.uf}
                onChange={e => setEndereco(p => ({ ...p, uf: e.target.value.toUpperCase() }))}
              />
            </div>
          </div>
        </section>

        <hr className="border-[#DDD9D2]" />

        {/* Contato principal */}
        <section>
          <h3 className="text-xs font-bold text-[#3A5A78] uppercase tracking-widest mb-3">Contato principal</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="contato_nome" label="Nome" placeholder="Nome do contato" />
              <Input name="contato_cargo" label="Cargo" placeholder="Ex: Gerente de compras" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input name="contato_telefone" label="Telefone" placeholder="(00) 0000-0000" />
              <Input name="contato_whatsapp" label="WhatsApp" placeholder="(00) 9 0000-0000" />
            </div>
            <Input name="contato_email" label="E-mail" type="email" placeholder="contato@empresa.com" />
          </div>
        </section>

      </form>
    </Drawer>
  )
}
