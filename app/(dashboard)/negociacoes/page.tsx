import { Suspense } from 'react'
import { listarNegociacoes } from '@/app/actions/negociacoes'
import NegociacoesCliente from './NegociacoesCliente'

// aba pode ser: abertas | novos | recorrentes | gaveta | historico
interface SearchParams { aba?: string }

export default async function NegociacoesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const aba = sp.aba ?? 'abertas'

  let negociacoes
  if (aba === 'novos') {
    negociacoes = await listarNegociacoes('aberta', 'novos')
  } else if (aba === 'recorrentes') {
    negociacoes = await listarNegociacoes('aberta', 'recorrentes')
  } else if (aba === 'gaveta') {
    negociacoes = await listarNegociacoes('aberta', 'gaveta')
  } else if (aba === 'historico') {
    const [concluidas, canceladas] = await Promise.all([
      listarNegociacoes('concluida'),
      listarNegociacoes('cancelada'),
    ])
    negociacoes = [...concluidas, ...canceladas].sort(
      (a, b) => new Date(b.atualizado_em).getTime() - new Date(a.atualizado_em).getTime()
    )
  } else {
    // abertas = todas as abertas (todos os funis)
    negociacoes = await listarNegociacoes('aberta')
  }

  return (
    <Suspense>
      <NegociacoesCliente
        negociacoesIniciais={negociacoes}
        abaAtiva={aba}
      />
    </Suspense>
  )
}
