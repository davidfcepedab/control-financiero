"use client"

import { useEffect, useState } from "react"
import { useFinance } from "../FinanceContext"
import { useSearchParams } from "next/navigation"

export default function TransactionsClient() {
  const { month } = useFinance()
  const searchParams = useSearchParams()

  const categoryFilter = searchParams.get("category")

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!month) return

    let url = `/api/finanzas/transactions?month=${month}`

    if (categoryFilter) {
      url += `&category=${encodeURIComponent(categoryFilter)}`
    }

    fetch(url)
      .then(res => res.json())
      .then(setData)

  }, [month, categoryFilter])

  if (!data) return null

  return (
    <div className="space-y-6">

      {/* Breadcrumb cuando hay filtro */}
      {categoryFilter && (
        <div className="text-sm text-gray-500">
          Categorías &gt; <span className="font-medium">{categoryFilter}</span>
        </div>
      )}

      {/* Renderiza aquí tu tabla/lista de movimientos */}
      {/* data.transactions.map(...) */}

    </div>
  )
}
