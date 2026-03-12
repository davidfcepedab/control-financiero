"use client"

import { useEffect, useState, useMemo } from "react"
import { useFinance } from "../FinanceContext"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useRouter } from "next/navigation"

interface Subcategory {
  name: string
  total: number
}

interface Category {
  name: string
  type: "fixed" | "variable"
  total: number
  previousTotal?: number
  delta?: number
  budget?: number
  budgetUsedPercent?: number
  budgetStatus?: "green" | "yellow" | "red"
  subcategories?: Subcategory[]
}

interface CategoriesData {
  structuralCategories?: Category[]
  totalFixed?: number
  totalVariable?: number
  previousTotalFixed?: number
  previousTotalVariable?: number
  success?: boolean
  error?: string
}

export default function FinanzasCategories() {
  const finance = useFinance()
  const router = useRouter()

  const [data, setData] = useState<CategoriesData | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [advanced, setAdvanced] = useState(false)

  if (!finance) return null

  const { month } = finance

  useEffect(() => {
    if (!month) return
    fetch(`/api/finanzas/categories?month=${month}`)
      .then(res => res.json())
      .then(setData)
  }, [month])

  if (!data) return null

  const {
    structuralCategories = [],
    totalFixed = 0,
    totalVariable = 0,
    previousTotalFixed = 0,
    previousTotalVariable = 0,
  } = data

  const absFixed = Math.abs(totalFixed)
  const absVariable = Math.abs(totalVariable)
  const structuralTotal = absFixed + absVariable

  const previousTotal = Math.abs(previousTotalFixed) + Math.abs(previousTotalVariable)

  const globalDelta = structuralTotal - previousTotal

  const globalDeltaPct =
    previousTotal === 0
      ? structuralTotal > 0 ? 100 : 0
      : (globalDelta / previousTotal) * 100

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 })
      .format(Math.abs(value))

  const fixedPct = structuralTotal > 0
    ? Math.round((absFixed / structuralTotal) * 100)
    : 0

  const variablePct = 100 - fixedPct

  const donutData = [
    { name: "Fijos", value: absFixed },
    { name: "Variables", value: absVariable },
  ]

  const fixedCategories = structuralCategories
    .filter(c => c.type === "fixed")
    .sort((a,b) => Math.abs(b.total) - Math.abs(a.total))

  const variableCategories = structuralCategories
    .filter(c => c.type === "variable")
    .sort((a,b) => Math.abs(b.total) - Math.abs(a.total))

  const navigateToTransactions = (name: string) => {
    router.push(`/finanzas/transactions?month=${month}&category=${name}`)
  }

  return (
    <div className="space-y-10">

      {/* TOTAL GLOBAL */}
      <div className="text-center space-y-2">
        <p className="text-3xl font-bold text-gray-900">
          ${formatMoney(structuralTotal)}
        </p>

        {advanced && (
          <p className={`text-sm font-medium ${
            globalDelta === 0
              ? "text-gray-500"
              : globalDelta > 0
              ? "text-rose-500"
              : "text-blue-600"
          }`}>
            {globalDelta > 0 && "↑ "}
            {globalDelta < 0 && "↓ "}
            {globalDelta === 0 ? "" : `${Math.abs(globalDeltaPct).toFixed(1)}% `}
            vs mes anterior
          </p>
        )}
      </div>

      {/* DONUT */}
      <div className="card p-6 bg-white rounded-lg shadow">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                innerRadius={60}
                outerRadius={85}
              >
                <Cell fill="#FDA4AF" />
                <Cell fill="#3B82F6" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DISTRIBUCIÓN */}
      <div className="text-center text-sm font-semibold space-x-6">
        <span className="text-rose-500">
          Fijos {fixedPct}%
        </span>
        <span className="text-blue-600">
          Variables {variablePct}%
        </span>
      </div>

      {/* INSIGHT ESTRUCTURAL */}
      {advanced && (
        <div className="max-w-md mx-auto text-center">
          {fixedPct > 70 && (
            <div className="bg-rose-50 rounded-lg p-4 text-rose-700 text-sm">
              Alta rigidez estructural. 74% del gasto es fijo.
            </div>
          )}
        </div>
      )}

      {/* SECCIONES OPERATIVAS */}
      {[{
        title: "Movimientos Fijos",
        items: fixedCategories,
        clusterBase: absFixed,
        barColor: "bg-rose-400",
      },{
        title: "Movimientos Variables",
        items: variableCategories,
        clusterBase: absVariable,
        barColor: "bg-blue-500",
      }].map(section => (
        <div key={section.title} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>

          {section.items.map(cat => {

            const percent = section.clusterBase > 0
              ? (Math.abs(cat.total) / section.clusterBase) * 100
              : 0

            const previous = cat.previousTotal ?? 0
            const delta = cat.total - previous

            const deltaPct = previous === 0
              ? cat.total > 0 ? 100 : 0
              : (delta / previous) * 100

            return (
              <div key={cat.name}
                className="card p-4 bg-white rounded-lg border border-gray-200 space-y-3">

                <div className="flex justify-between">
                  <button
                    onClick={() => navigateToTransactions(cat.name)}
                    className="font-medium hover:underline"
                  >
                    {cat.name}
                  </button>

                  <div className="text-right">
                    <p className="font-semibold">
                      -${formatMoney(cat.total)}
                    </p>

                    {advanced && delta !== 0 && (
                      <p className={`text-xs ${
                        delta > 0 ? "text-rose-500" : "text-blue-600"
                      }`}>
                        {delta > 0 ? "↑" : "↓"} {Math.abs(deltaPct).toFixed(1)}%
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${section.barColor} h-2 rounded-full`}
                    style={{ width: `${Math.min(percent,100)}%` }}
                  />
                </div>

                {advanced && cat.budget && cat.total !== 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    Presupuesto ${formatMoney(cat.budget)}
                  </div>
                )}

              </div>
            )
          })}
        </div>
      ))}

      {/* TOGGLE */}
      <div className="flex justify-center">
        <button
          onClick={() => setAdvanced(!advanced)}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white"
        >
          {advanced ? "Ocultar análisis" : "Modo análisis"}
        </button>
      </div>

    </div>
  )
}
