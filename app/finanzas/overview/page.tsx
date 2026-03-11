"use client"

import { useEffect, useState } from "react"
import { useFinance } from "../FinanceContext"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts"

type MonthlyRow = {
  month: string
  ingresos: number
  gasto_operativo: number
  flujo: number
}

type OverviewResponse = {
  ingresos: number
  flujo_total: number
  liquidez: number
  runway: number
  monthlyData: MonthlyRow[]
}

export default function FinanzasOverview() {
  const { month } = useFinance()
  const [data, setData] = useState<OverviewResponse | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!month) return

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/finanzas/overview?month=${month}`)
        if (!res.ok) throw new Error("API error")
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error("Overview fetch error:", err)
        setError(true)
      }
    }

    fetchData()
  }, [month])

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error cargando datos financieros
      </div>
    )
  }

  if (!data) return null

  const {
    ingresos = 0,
    flujo_total = 0,
    liquidez = 0,
    runway = 0,
    monthlyData = [],
  } = data

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(Math.round(value || 0))

  const formatMillions = (value: number) => {
    const millions = value / 1_000_000
    return `${millions.toFixed(0)}M`
  }

  // ⚠️ Formatter compatible 100% con Recharts + TS strict
  const formatTooltip = (
    value: number | string,
    name?: string
  ): [string, string] => {
    const numeric =
      typeof value === "number"
        ? value
        : Number(value ?? 0)

    return [`$${formatMoney(numeric)}`, name ?? ""]
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <p className="text-xs text-gray-500">Ingresos</p>
          <p className="text-lg font-semibold">
            ${formatMoney(ingresos)}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-gray-500">Flujo Total</p>
          <p className="text-lg font-semibold">
            ${formatMoney(flujo_total)}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-gray-500">Liquidez</p>
          <p className="text-lg font-semibold">
            ${formatMoney(liquidez)}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-gray-500">Runway</p>
          <p className="text-lg font-semibold">
            {runway} meses
          </p>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="card p-6">
        <h3 className="text-sm text-gray-500 mb-4">
          Ingresos vs Gasto Operativo vs Flujo (6 meses)
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatMillions} />
            <Tooltip formatter={formatTooltip} />
            <Legend />
            <ReferenceLine y={0} stroke="#9CA3AF" strokeWidth={2} />

            <Line
              type="monotone"
              dataKey="ingresos"
              stroke="#16A34A"
              strokeWidth={3}
              dot={false}
              name="Ingresos"
            />

            <Line
              type="monotone"
              dataKey="gasto_operativo"
              stroke="#DC2626"
              strokeWidth={3}
              dot={false}
              name="Gasto Operativo"
            />

            <Line
              type="monotone"
              dataKey="flujo"
              stroke="#6B7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Flujo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
