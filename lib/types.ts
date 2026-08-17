export type Perfil = 'admin' | 'gestor' | 'vendedor' | 'estoquista'

export interface Empresa {
  id: string
  cpf_cnpj: string
  razao_social: string
  nome_fantasia: string | null
  tipo: 'pf' | 'pj'
  segmento: string | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface EmpresaResumo extends Empresa {
  contato_nome: string | null
  contato_telefone: string | null
  contato_whatsapp: string | null
  cidade: string | null
  uf: string | null
}

export interface Contato {
  id: string
  empresa_id: string
  nome: string
  cargo: string | null
  telefone: string | null
  whatsapp: string | null
  email: string | null
  principal: boolean
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface Endereco {
  id: string
  empresa_id: string
  tipo: 'principal' | 'entrega' | 'cobranca' | 'outro'
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  criado_em: string
  atualizado_em: string
}

export interface CondicaoComercial {
  id: string
  empresa_id: string
  prazo_padrao: number | null
  desconto_max: number | null
  limite_credito: number | null
  observacoes: string | null
  criado_em: string
  atualizado_em: string
}

export interface EmpresaDetalhe extends Empresa {
  contatos: Contato[]
  enderecos: Endereco[]
  condicoes_comerciais: CondicaoComercial[]
}
