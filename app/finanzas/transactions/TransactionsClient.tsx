"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function TransactionsClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const month = searchParams.get("month")
  const category = searchParams.get("category")

  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (!month) return

    let url = `/api/finanzas/transactions?month=${month}`

    if (category) {
      url += `&category=${encodeURIComponent(category)}`
    }

    fetch(url)
      .then((res) => res.json())
      .then(setData)
  }, [month, category])

  if (!data) return null

  const {
    transactions = [],
    subtotal = 0,
    previousSubtotal = 0,
    delta = 0,
  } = data

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(value || 0)

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button
          onClick={() =>
            router.push(`/finanzas/categories?month=${month}`)
          }
          className="underline"
        >
          Categorías
        </button>
        <span>›</span>
        <span className="text-black font-medium">
          {category || "Todos"}
        </span>
      </div>

      <div className="card p-4">
        <p className="text-xs text-gray-500">Subtotal</p>
        <p className="text-lg font-semibold">
          ${formatMoney(subtotal)}
        </p>
      </div>

      <div className="space-y-2">
        {transactions.map((t: any, i: number) => (
          <div
            key={i}
            className="flex justify-between text-sm border-b py-2"
          >
            <span>{t.description}</span>
            <span>${formatMoney(t.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
