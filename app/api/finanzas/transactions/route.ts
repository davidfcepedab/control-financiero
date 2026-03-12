import { NextRequest, NextResponse } from "next/server"
import { sheets } from "@/lib/googleAuth"

const SPREADSHEET_ID = "1fEP_Em30-BTUhmeObzAE9zObQRc7CNkYXbVCecpCHO0"

export async function GET(req: NextRequest) {
  try {
    const month =
      req.nextUrl.searchParams.get("month") ||
      new Date().toISOString().slice(0, 7)

    const category =
      req.nextUrl.searchParams.get("category")

    const movimientosRes =
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Movimientos!A2:U5000",
        valueRenderOption: "UNFORMATTED_VALUE",
      })

    const rows = movimientosRes.data.values || []

    const filtered = rows.filter((r) => {
      const rowMonth = r?.[12]
      const rowCategory = r?.[6]

      if (!rowMonth) return false
      if (rowMonth !== month) return false
      if (category && rowCategory !== category) return false

      return true
    })

    const transactions = filtered.map((r, i) => ({
      id: `${r?.[0] || ""}-${i}`,
      date: r?.[0] || "",
      description: r?.[5] || "",
      category: r?.[6] || "",
      subcategory: r?.[7] || "",
      amount: Number(r?.[10] || 0),
    }))

    const subtotal = transactions.reduce(
      (acc, tx) => acc + tx.amount,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        subtotal,
        previousSubtotal: 0,
        delta: 0,
      },
    })

  } catch (error: any) {
    console.error("TRANSACTIONS ERROR:", error?.message)

    return NextResponse.json(
      { success: false, error: "Error cargando transacciones" },
      { status: 500 }
    )
  }
}
