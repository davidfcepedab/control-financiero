"use client"

import { useEffect, useState } from "react"
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
  budget?: number
  subcategories?: Subcategory[]
}

interface CategoriesData {
  structuralCategories?: Category[]
  totalFixed?: number
  totalVariable?: number
  previousTotalFixed?: number
  previousTotalVariable?: number
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

  const previousTotal =
    Math.abs(previousTotalFixed) + Math.abs(previousTotalVariable)

  const globalDelta = structuralTotal - previousTotal

  const globalDeltaPct =
    previousTotal === 0
      ? structuralTotal > 0 ? 100 : 0
      : (globalDelta / previousTotal) * 100

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(Math.abs(value))

  const fixedPct =
    structuralTotal > 0
      ? Math.round((absFixed / structuralTotal) * 100)
      : 0

  const variablePct = 100 - fixedPct

  const donutData = [
    { name: "Fijos", value: absFixed },
    { name: "Variables", value: absVariable },
  ]

  const fixedCategories = structuralCategories
    .filter(c => c.type === "fixed")
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))

  const variableCategories = structuralCategories
    .filter(c => c.type === "variable")
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))

  const toggleCategory = (name: string) => {
    setExpanded(prev => (prev === name ? null : name))
  }

  const navigateToTransactions = (categoryName: string) => {
    router.push(
      `/finanzas/transactions?month=${encodeURIComponent(month)}&category=${encodeURIComponent(categoryName)}`
    )
  }

  return (
    <div className="space-y-10">

      {/* ===================== */}
      {/* BLOQUE SUPERIOR      */}
      {/* ===================== */}

      <div className="text-center space-y-2">
        <p className="text-3xl font-bold text-gray-900">
          ${formatMoney(structuralTotal)}
        </p>

        <p
          className={`text-sm font-medium ${
            globalDelta === 0
              ? "text-gray-500"
              : globalDelta > 0
              ? "text-rose-500"
              : "text-blue-600"
          }`}
        >
          {globalDelta > 0 && "↑ "}
          {globalDelta < 0 && "↓ "}
          {globalDelta === 0
            ? "Sin variación vs mes anterior"
            : `${Math.abs(globalDeltaPct).toFixed(1)}% vs mes anterior`}
        </p>
      </div>

      {/* Totales cluster */}
      <div className="flex justify-center gap-16 text-center">
        <div>
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
            Movimientos Fijos
          </p>
          <p className="text-xl font-bold text-rose-500">
            ${formatMoney(absFixed)}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-1">
            Movimientos Variables
          </p>
          <p className="text-xl font-bold text-blue-600">
            ${formatMoney(absVariable)}
          </p>
        </div>
      </div>

      {/* Donut */}
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

      {/* Distribución */}
      <div className="text-center text-sm font-semibold space-x-6">
        <span className="text-rose-500">
          Fijos {fixedPct}%
        </span>
        <span className="text-blue-600">
          Variables {variablePct}%
        </span>
      </div>

      {/* ===================== */}
      {/* SECCIONES OPERATIVAS */}
      {/* ===================== */}

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

          <h2 className="text-xl font-semibold">
            {section.title}
          </h2>

          {section.items.map(cat => {

            const spent = Math.abs(cat.total)
            const budget = cat.budget ?? 0
            const hasBudget = budget > 0

            const difference = spent - budget
            const differenceAbs = Math.abs(difference)

            const usagePercent =
              budget === 0 ? 0 : (spent / budget) * 100

            let budgetStatus: "green" | "yellow" | "red" = "green"
            if (usagePercent > 100) budgetStatus = "red"
            else if (usagePercent > 80) budgetStatus = "yellow"

            const percent =
              section.clusterBase > 0
                ? (spent / section.clusterBase) * 100
                : 0

            const hasSubcategories =
              Array.isArray(cat.subcategories) &&
              cat.subcategories.length > 0

            return (
              <div
                key={cat.name}
                className="card p-4 bg-white rounded-lg border border-gray-200 space-y-3"
              >

                {/* HEADER */}
                <div className="flex justify-between items-center gap-4">

                  <button
                    onClick={() => toggleCategory(cat.name)}
                    className="flex items-center gap-2 text-left"
                  >
                    <span className="font-medium">
                      {cat.name}
                    </span>
                    {hasSubcategories && (
                      <span className="text-xs text-gray-400">
                        {expanded === cat.name ? "▴" : "▾"}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => navigateToTransactions(cat.name)}
                    className="font-semibold hover:text-blue-600 hover:underline"
                  >
                    -${formatMoney(cat.total)}
                  </button>

                </div>

                {/* Barra cluster */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${section.barColor} h-2 rounded-full`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>

                {/* Presupuesto compacto + diferencia */}
                {hasBudget && (
                  <div
                    className={`p-3 rounded-lg border text-sm space-y-1 ${
                      budgetStatus === "red"
                        ? "bg-rose-50 border-rose-200"
                        : budgetStatus === "yellow"
                        ? "bg-amber-50 border-amber-200"
                        : "bg-emerald-50 border-emerald-200"
                    }`}
                  >

                    <div className="flex justify-between font-medium">
                      <span>Presupuesto</span>
                      <span>${formatMoney(budget)}</span>
                    </div>

                    <div
                      className={`flex justify-between ${
                        budgetStatus === "red"
                          ? "text-rose-600"
                          : budgetStatus === "yellow"
                          ? "text-amber-600"
                          : "text-emerald-600"
                      }`}
                    >
                      <span>
                        {difference > 0
                          ? "Sobre ejecución"
                          : difference < 0
                          ? "Sub ejecución"
                          : "En línea"}
                      </span>
                      <span>
                        {difference === 0
                          ? "$0"
                          : `${difference > 0 ? "+" : "-"}$${formatMoney(differenceAbs)}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Uso</span>
                      <span>{usagePercent.toFixed(0)}%</span>
                    </div>

                    {advanced && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            budgetStatus === "red"
                              ? "bg-rose-500"
                              : budgetStatus === "yellow"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                    )}

                  </div>
                )}

                {/* Subcategorías */}
                {expanded === cat.name && hasSubcategories && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {cat.subcategories!.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() =>
                          router.push(
                            `/finanzas/transactions?month=${encodeURIComponent(month)}&category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub.name)}`
                          )
                        }
                        className="w-full flex justify-between text-sm hover:text-blue-600"
                      >
                        <span>• {sub.name}</span>
                        <span>-${formatMoney(sub.total)}</span>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )
          })}
        </div>
      ))}

      {/* Toggle análisis */}
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
