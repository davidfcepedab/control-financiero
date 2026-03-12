import { financialScoreEngine } from "../../lib/engines/financialScoreEngine"

describe("financialScoreEngine", () => {
  it("returns 0 when ingresos is 0 (no division by zero)", () => {
    const score = financialScoreEngine({
      ingresos: 0,
      gastoOp: -500,
      gastoFin: -100,
      flujo: -600,
    })

    expect(score).toBe(0)
  })

  it("returns a positive score when flujo is positive", () => {
    const score = financialScoreEngine({
      ingresos: 5_000_000,
      gastoOp: -3_000_000,
      gastoFin: -500_000,
      flujo: 1_500_000,
    })

    expect(score).toBeGreaterThan(0)
  })

  it("score never exceeds 100 even with an ideal scenario", () => {
    // Very healthy finances: all income saved, no expenses
    const score = financialScoreEngine({
      ingresos: 10_000_000,
      gastoOp: 0,
      gastoFin: 0,
      flujo: 10_000_000,
    })

    expect(score).toBeLessThanOrEqual(100)
  })

  it("score is never below 0 even with severe deficit", () => {
    const score = financialScoreEngine({
      ingresos: 1_000_000,
      gastoOp: -5_000_000,
      gastoFin: -2_000_000,
      flujo: -6_000_000,
    })

    expect(score).toBeGreaterThanOrEqual(0)
  })

  it("returns an integer (Math.round is applied)", () => {
    const score = financialScoreEngine({
      ingresos: 3_000_000,
      gastoOp: -1_500_000,
      gastoFin: -300_000,
      flujo: 1_200_000,
    })

    expect(Number.isInteger(score)).toBe(true)
  })
})
