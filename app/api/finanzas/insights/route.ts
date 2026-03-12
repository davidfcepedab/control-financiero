import { NextResponse } from "next/server"
import { financialInsightsEngine } from "@/lib/engines/financialInsightsEngine"

export async function GET() {
  try {
    const res = await fetch("http://localhost:3000/api/finanzas/categories")
    const json = await res.json()

    const categories = json?.data?.structuralCategories || []

    const insights = financialInsightsEngine({
      categories,
      flujo: -1, // puedes conectar flujo real luego
    })

    return NextResponse.json({ success: true, data: { insights } })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error cargando insights" },
      { status: 500 }
    )
  }
}

