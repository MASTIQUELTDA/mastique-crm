export type Perfil = 'admin' | 'gestor' | 'vendedor' | 'estoquista'

export interface Empresa {
  id: string
  cpf_cnpj: string
  razao_social: string
  nome_fantasia: string | null
  tipo: 'pf' | 'pj'
  segmento: string | null
  ativo: boolean
  vendedor_id: string | null
  criado_em: string
  atualizado_em: string
}

export interface EmpresaResumo extends Empresa {
  contato_nome: string | null
  contato_telefone: string | null
  contato_whatsapp: string | null
  cidade: string | null
  uf: string | null
  vendedor_nome: string | null
}

export interface PerfilUsuario {
  id: string
  nome: string
  perfil: string
  ativo: boolean
}

export type NegociacaoStatus = 'aberta' | 'ganha' | 'perdida' | 'gaveta'
export type NegociacaoTipo = 'novo' | 'recorrente'
export type InteracaoTipo = 'nota' | 'ligacao' | 'email' | 'reuniao' | 'proposta' | 'pedido' | 'sistema'

export interface Negociacao {
  id: string
  empresa_id: string
  vendedor_id: string | null
  tipo: NegociacaoTipo
  status: NegociacaoStatus
  valor_estimado: number | null
  origem: string | null
  motivo_fechamento: string | null
  observacoes: string | null
  data_proxima_acao: string | null
  criado_em: string
  atualizado_em: string
}

export interface NegociacaoResumo extends Negociacao {
  empresa_nome: string
  empresa_fantasia: string | null
  empresa_segmento: string | null
  vendedor_nome: string | null
}

export interface NegociacaoInteracao {
  id: string
  negociacao_id: string
  autor_id: string | null
  tipo: InteracaoTipo
  descricao: string
  criado_em: string
}

export interface NegociacaoDetalhe extends Negociacao {
  empresa_nome: string
  empresa_fantasia: string | null
  empresa_segmento: string | null
  vendedor_nome: string | null
  interacoes: NegociacaoInteracao[]
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
