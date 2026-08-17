import { Suspense } from 'react'
import { listarEmpresas } from '@/app/actions/empresas'
import EmpresasCliente from './EmpresasCliente'

interface SearchParams {
  q?: string
  segmento?: string
  ativo?: string
}

export default async function EmpresasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const empresas = await listarEmpresas(sp.q, sp.segmento, sp.ativo)

  return (
    <Suspense>
      <EmpresasCliente
        empresasIniciais={empresas}
        filtros={{ q: sp.q, segmento: sp.segmento, ativo: sp.ativo }}
      />
    </Suspense>
  )
}
