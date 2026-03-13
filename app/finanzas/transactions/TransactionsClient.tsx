"use client"

import { useEffect, useState } from "react"
import { useFinance } from "../FinanceContext"
import { useSearchParams } from "next/navigation"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category?: string
  subcategory?: string
}

interface TransactionsData {
  transactions: Transaction[]
  subtotal?: number
}

interface TransactionsResponse {
  success: boolean
  data?: TransactionsData
  error?: string
}

export default function TransactionsClient() {
  const finance = useFinance()
  const searchParams = useSearchParams()
  const month = finance?.month ?? ""
  const categoryFilter = searchParams.get("category")
  const subcategoryFilter = searchParams.get("subcategory")

  const [data, setData] = useState<TransactionsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!month) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        let url = `/api/finanzas/transactions?month=${encodeURIComponent(month)}`

        if (categoryFilter) {
          url += `&category=${encodeURIComponent(categoryFilter)}`
        }

        if (subcategoryFilter) {
          url += `&subcategory=${encodeURIComponent(subcategoryFilter)}`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const json: TransactionsResponse = await response.json()

        if (!json.success) {
          throw new Error(json.error || "Error desconocido")
        }

        setData(json.data ?? null)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        console.error("Error fetching transactions:", err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [month, categoryFilter, subcategoryFilter])

  if (!finance) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Inicializando...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Cargando movimientos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Sin movimientos registrados para este período.</p>
      </div>
    )
  }

  if (!data) return null

  const transactions = data.transactions ?? []
  const hasTransactions = transactions.length > 0

  return (
    <div className="space-y-6">
      {/* Breadcrumb de categoría */}
      {categoryFilter && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="text-gray-500">Filtro: </span>
          <span className="font-medium text-gray-800">
            {categoryFilter}
            {subcategoryFilter && ` › ${subcategoryFilter}`}
          </span>
        </div>
      )}

      {/* Resumen */}
      {hasTransactions && data.subtotal !== undefined && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total de movimientos</p>
          <p className="text-2xl font-bold text-blue-600">
            ${Math.abs(data.subtotal).toLocaleString("es-CO")}
          </p>
        </div>
      )}

      {/* Transacciones */}
      {hasTransactions ? (
        <div className="space-y-3">
          {transactions.map((tx, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900">{tx.description}</p>
                <p className="text-xs text-gray-500 mt-1">{tx.date}</p>
                {tx.category && (
                  <p className="text-xs text-gray-400 mt-1">
                    {tx.category}
                    {tx.subcategory && ` › ${tx.subcategory}`}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className={`font-semibold text-lg ${
                  tx.amount < 0 ? "text-red-600" : "text-green-600"
                }`}>
                  {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toLocaleString("es-CO")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Sin movimientos registrados para este período.
          </p>
        </div>
      )}

    </div>
  )
}
