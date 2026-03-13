import type { Transaction } from "@/lib/types"
import { buildStructuralTree } from "./categoriesEngine"

export function financialAdvancedEngine({
  transactions,
  month,
}: {
  transactions: Transaction[]
  month: string
}) {
  return buildStructuralTree(transactions, month)
}
