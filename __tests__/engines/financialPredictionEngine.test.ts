import { financialPredictionEngine } from "../../lib/engines/financialPredictionEngine"

describe("financialPredictionEngine", () => {
  describe("insufficient history", () => {
    it("returns empty projection when monthlyHistory is empty", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: [],
        liquidez: 5_000_000,
      })
      expect(projection).toHaveLength(0)
    })

    it("returns empty projection when monthlyHistory has 1 entry", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: [1_000_000],
        liquidez: 5_000_000,
      })
      expect(projection).toHaveLength(0)
    })

    it("returns empty projection when monthlyHistory has exactly 2 entries", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: [1_000_000, 900_000],
        liquidez: 5_000_000,
      })
      expect(projection).toHaveLength(0)
    })
  })

  describe("sufficient history (>= 3 entries)", () => {
    const HISTORY = [1_000_000, 1_200_000, 800_000] // avg = 1_000_000
    const LIQUIDEZ = 4_000_000

    it("returns exactly 3 projected months", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: HISTORY,
        liquidez: LIQUIDEZ,
      })
      expect(projection).toHaveLength(3)
    })

    it("labels the months '+1', '+2', '+3'", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: HISTORY,
        liquidez: LIQUIDEZ,
      })
      expect(projection[0].month).toBe("+1")
      expect(projection[1].month).toBe("+2")
      expect(projection[2].month).toBe("+3")
    })

    it("subtracts the average monthly flow from the remaining balance each step", () => {
      // avg = (1_000_000 + 1_200_000 + 800_000) / 3 = 1_000_000
      const { projection } = financialPredictionEngine({
        monthlyHistory: HISTORY,
        liquidez: LIQUIDEZ,
      })

      expect(projection[0].projectedBalance).toBe(3_000_000) // 4M - 1M
      expect(projection[1].projectedBalance).toBe(2_000_000) // 3M - 1M
      expect(projection[2].projectedBalance).toBe(1_000_000) // 2M - 1M
    })

    it("still returns 3 months with a longer history", () => {
      const { projection } = financialPredictionEngine({
        monthlyHistory: [500_000, 600_000, 700_000, 800_000, 900_000, 1_000_000],
        liquidez: 10_000_000,
      })
      expect(projection).toHaveLength(3)
    })
  })
})
