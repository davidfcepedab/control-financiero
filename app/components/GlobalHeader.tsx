"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getContext } from "@/lib/getContext"

export default function GlobalHeader() {
  const [data, setData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    getContext().then(setData)
  }, [])

  if (!data) return null

  const gradient = "bg-gradient-to-br from-[#3FC5BB]/80 via-[#7EDCD3]/70 to-[#93C5FD]/80"

  const delta = data.delta_global ?? 0

  const deltaColor =
    delta > 0
      ? "text-emerald-100"
      : delta < 0
      ? "text-red-200"
      : "text-white/70"

  return (
    <div className="relative rounded-b-3xl overflow-hidden shadow-lg">

      {/* Gradiente base pastel */}
      <div className={`absolute inset-0 ${gradient}`} />

      {/* Overlay para contraste */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Contenido */}
      <div className="relative z-10 px-6 pt-12 pb-10 text-white">

        <p className="text-xs uppercase tracking-wider opacity-80">
          Score Global
        </p>

        <div className="flex items-center gap-4 mt-3">
          <span className="text-5xl font-bold">
            {data.score_global}
          </span>

          <span className={`text-lg font-semibold ${deltaColor}`}>
            {delta > 0 && "+"}
            {delta}%
          </span>
        </div>

      </div>
    </div>
  )
}
