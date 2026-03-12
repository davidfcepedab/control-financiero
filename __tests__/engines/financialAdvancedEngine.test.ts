import { financialAdvancedEngine } from "../../lib/engines/financialAdvancedEngine"

// Helper: build a minimal spreadsheet row with the fields the engine reads.
// Indices that matter: [6] category, [7] subcategory, [10] amount, [12] month.
function makeRow(category: string, amount: number, month: string, sub = "Sub"): any[] {
  const row: any[] = Array(21).fill("")
  row[6] = category
  row[7] = sub
  row[10] = amount
  row[12] = month
  return row
}

const MONTH = "2025-03"
const PREV_MONTH = "2025-02" // engine derives this automatically

describe("financialAdvancedEngine", () => {
  describe("empty / null input", () => {
    it("returns zero totals for an empty array without throwing", () => {
      const result = financialAdvancedEngine({ rows: [], month: MONTH })

      expect(result.totalFixed).toBe(0)
      expect(result.totalVariable).toBe(0)
      expect(result.totalStructural).toBe(0)
      expect(result.structuralCategories).toHaveLength(0)
    })

    it("returns safe defaults when rows is not an array", () => {
      const result = financialAdvancedEngine({ rows: (null as unknown) as any[], month: MONTH })

      expect(result.totalFixed).toBe(0)
      expect(result.structuralCategories).toHaveLength(0)
    })
  })

  describe("totalFixed", () => {
    it("sums only fixed-category rows for the requested month", () => {
      const rows = [
        makeRow("Hogar & Base", -1000, MONTH),      // fixed
        makeRow("Obligaciones", -500, MONTH),         // fixed
        makeRow("Alimentacion", -300, MONTH),         // variable — must NOT count
        makeRow("Hogar & Base", -800, PREV_MONTH),    // previous month — must NOT count
      ]

      const { totalFixed } = financialAdvancedEngine({ rows, month: MONTH })

      expect(totalFixed).toBe(-1500)
    })
  })

  describe("totalVariable", () => {
    it("sums only variable-category rows for the requested month", () => {
      const rows = [
        makeRow("Alimentacion", -400, MONTH),         // variable
        makeRow("Entretenimiento", -200, MONTH),      // variable
        makeRow("Hogar & Base", -1000, MONTH),        // fixed — must NOT count
      ]

      const { totalVariable } = financialAdvancedEngine({ rows, month: MONTH })

      expect(totalVariable).toBe(-600)
    })
  })

  describe("delta vs previous month", () => {
    it("computes delta as current total minus previous total for the same category", () => {
      const rows = [
        makeRow("Alimentacion", -500, MONTH),
        makeRow("Alimentacion", -300, PREV_MONTH),
      ]

      const { structuralCategories } = financialAdvancedEngine({ rows, month: MONTH })
      const cat = structuralCategories.find((c) => c.name === "Alimentacion")!

      expect(cat).toBeDefined()
      expect(cat.total).toBe(-500)
      expect(cat.previousTotal).toBe(-300)
      expect(cat.delta).toBe(-200) // -500 - (-300) = -200
    })

    it("sets previousTotal to 0 when the category had no spending the previous month", () => {
      const rows = [makeRow("Alimentacion", -500, MONTH)]

      const { structuralCategories } = financialAdvancedEngine({ rows, month: MONTH })
      const cat = structuralCategories.find((c) => c.name === "Alimentacion")!

      expect(cat.previousTotal).toBe(0)
      expect(cat.delta).toBe(-500)
    })
  })

  describe("financial categories (excluded from structural totals)", () => {
    it("places excluded categories in financialCategories, not in structuralCategories", () => {
      const rows = [
        makeRow("Finanzas", -200, MONTH),
        makeRow("Alimentacion", -100, MONTH),
      ]

      const result = financialAdvancedEngine({ rows, month: MONTH })

      const structural = result.structuralCategories.map((c) => c.name)
      expect(structural).not.toContain("Finanzas")

      const financial = result.financialCategories.map((c) => c.name)
      expect(financial).toContain("Finanzas")
    })
  })
})
