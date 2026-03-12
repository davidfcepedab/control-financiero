export interface Transaction {
  id: string
  date: string
  description: string
  category: string
  subcategory: string
  amount: number
}

/**
 * Filters raw Movimientos rows by month (col 12) and optional category (col 6).
 * All numeric column references are centralised here so route files stay index-free.
 */
export function filterTransactionRows(
  rows: any[][],
  month: string,
  category?: string | null
): any[][] {
  return rows.filter((r) => {
    const rowMonth = r?.[12]
    const rowCategory = r?.[6]
    if (!rowMonth) return false
    if (rowMonth !== month) return false
    if (category && rowCategory !== category) return false
    return true
  })
}

/**
 * Maps a single raw Movimientos row to a typed Transaction object.
 * Column positions: [0] date, [5] description, [6] category, [7] subcategory, [10] amount.
 */
export function mapRowToTransaction(row: any[], index: number): Transaction {
  return {
    id: `${row?.[0] || ""}-${index}`,
    date: row?.[0] || "",
    description: row?.[5] || "",
    category: row?.[6] || "",
    subcategory: row?.[7] || "",
    amount: Number(row?.[10] || 0),
  }
}
