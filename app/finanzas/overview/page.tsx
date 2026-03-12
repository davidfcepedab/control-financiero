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

interface MonthlyRow {
  month: string
  ingresos: number
  gasto_operativo: number
  flujo: number
}

interface OverviewResponse {
  ingresos: number
  flujo_total: number
  liquidez: number
  runway: number
  monthlyData: MonthlyRow[]
  success?: boolean
  error?: string
}

export default function FinanzasOverview() {
  const finance = useFinance()

  const [data, setData] = useState<OverviewResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!finance) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Inicializando...</p>
      </div>
    )
  }

  const { month } = finance

  useEffect(() => {
    if (!month) {
      setData(null)
      return
    }

    const fetchOverview = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `/api/finanzas/overview?month=${encodeURIComponent(month)}`
        )

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const json: OverviewResponse = await response.json()

        if (!json.success && json.error) {
          throw new Error(json.error)
        }

        setData(json)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        setError(errorMessage)
        console.error("Error fetching overview:", err)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchOverview()
  }, [month])

  // Estado de carga
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Cargando datos...</p>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <p className="font-semibold">Error al cargar datos</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Sin datos
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No hay datos disponibles para este mes</p>
      </div>
    )
  }

  const {
    ingresos,
    flujo_total,
    liquidez,
    runway,
    monthlyData,
  } = data

  const formatMoney = (value: number): string =>
    new Intl.NumberFormat("es-CO", {
      maximumFractionDigits: 0,
    }).format(Math.round(value || 0))

  const formatMillions = (value: number): string =>
    `${Math.round(value / 1_000_000)}M`

  // Determinar colores basados en valores
  const getFluidezColor = (runway: number): string => {
    if (runway < 3) return "text-red-600"
    if (runway < 6) return "text-amber-600"
    return "text-green-600"
  }

  const getFluidezBg = (runway: number): string => {
    if (runway < 3) return "bg-red-50"
    if (runway < 6) return "bg-amber-50"
    return "bg-green-50"
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ingresos */}
        <div className="card p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ingresos
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${formatMoney(ingresos)}
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Flujo Total */}
        <div className={`card p-6 rounded-lg border transition ${
          flujo_total >= 0
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Flujo Total
              </p>
              <p className={`text-3xl font-bold mt-2 ${
                flujo_total >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                ${formatMoney(flujo_total)}
              </p>
            </div>
            <div className="text-4xl">
              {flujo_total >= 0 ? "📈" : "📉"}
            </div>
          </div>
        </div>

        {/* Liquidez */}
        <div className="card p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Liquidez
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${formatMoney(liquidez)}
              </p>
            </div>
            <div className="text-4xl">💎</div>
          </div>
        </div>

        {/* Runway */}
        <div className={`card p-6 rounded-lg border transition ${
          getFluidezBg(runway)
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Runway
              </p>
              <p className={`text-3xl font-bold mt-2 ${getFluidezColor(runway)}`}>...
                {runway.toFixed(1)} meses
              </p>
              {runway < 6 && (
                <p className="text-xs text-gray-600 mt-2">
                  ⚠️ Revisar estrategia
                </p>
              )}
            </div>
            <div className="text-4xl">
              {runway < 3 ? "🚨" : runway < 6 ? "⏰" : "✓"}
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICO */}
      {monthlyData && monthlyData.length > 0 ? (
        <div className="card p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Ingresos vs Gasto Operativo vs Flujo (últimos meses)
          </h3>

          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  tickFormatter={formatMillions}
                  stroke="#9ca3af"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  formatter={(value: any) => formatMoney(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                />
                <ReferenceLine
                  y={0}
                  stroke="#d1d5db"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />

                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: "#16a34a", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Ingresos"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="gasto_operativo"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ fill: "#dc2626", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Gasto Operativo"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="flujo"
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#6b7280", r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Flujo"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda explicativa */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-4 h-1 bg-green-600 rounded mt-1" />
              <div>
                <p className="text-xs font-semibold text-gray-600">Ingresos</p>
                <p className="text-sm text-gray-500">Dinero que ingresa</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-4 h-1 bg-red-600 rounded mt-1" />
              <div>
                <p className="text-xs font-semibold text-gray-600">Gasto Operativo</p>
                <p className="text-sm text-gray-500">Gastos operacionales</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-4 h-1 bg-gray-600 rounded mt-1" style={{ backgroundImage: "repeating-linear-gradient(90deg, #6b7280 0px, #6b7280 5px, transparent 5px, transparent 10px)" }} />
              <div>
                <p className="text-xs font-semibold text-gray-600">Flujo Neto</p>
                <p className="text-sm text-gray-500">Diferencia entre ingresos y gastos</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6 bg-gray-50 rounded-lg text-center text-gray-500">
          <p>No hay datos de histórico disponibles</p>
        </div>
      )}
    </div>
  )
}