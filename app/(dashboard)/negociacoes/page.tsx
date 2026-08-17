import { Suspense } from 'react'
import { listarNegociacoes } from '@/app/actions/negociacoes'
import NegociacoesCliente from './NegociacoesCliente'

interface SearchParams { tipo?: string; status?: string }

export default async function NegociacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams

  // Aba ativa determina o status/tipo a buscar
  const aba = sp.status ?? 'aberta'

  let negociacoes
  if (aba === 'aberta') {
    negociacoes = await listarNegociacoes('aberta', sp.tipo)
  } else if (aba === 'gaveta') {
    negociacoes = await listarNegociacoes('gaveta')
  } else {
    // historico = ganha + perdida
    const [ganhas, perdidas] = await Promise.all([
      listarNegociacoes('ganha'),
      listarNegociacoes('perdida'),
    ])
    negociacoes = [...ganhas, ...perdidas].sort(
      (a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()
    )
  }

  return (
    <Suspense>
      <NegociacoesCliente
        negociacoesIniciais={negociacoes}
        abaAtiva={aba}
        tipoFiltro={sp.tipo}
      />
    </Suspense>
  )
}
