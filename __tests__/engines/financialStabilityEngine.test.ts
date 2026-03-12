import { financialStabilityEngine } from "../../lib/engines/financialStabilityEngine"

const BASE = {
  ingresos: 5_000_000,
  gastoOperativo: -3_000_000,
  gastoFinanciero: -500_000,
  flujo: 1_500_000,
  liquidez: 10_000_000,
}

describe("financialStabilityEngine — status (semáforo)", () => {
  it("returns status 'red' when runway is below 1.5 months", () => {
    const result = financialStabilityEngine({ ...BASE, runway: 1.0 })
    expect(result.status).toBe("red")
  })

  it("returns status 'yellow' when runway is between 1.5 and 3.5 months (inclusive)", () => {
    const resultLow = financialStabilityEngine({ ...BASE, runway: 1.5 })
    expect(resultLow.status).toBe("yellow")

    const resultMid = financialStabilityEngine({ ...BASE, runway: 2.5 })
    expect(resultMid.status).toBe("yellow")

    const resultHigh = financialStabilityEngine({ ...BASE, runway: 3.5 })
    expect(resultHigh.status).toBe("yellow")
  })

  it("returns status 'green' when runway is above 3.5 months", () => {
    const result = financialStabilityEngine({ ...BASE, runway: 4.0 })
    expect(result.status).toBe("green")
  })
})

describe("financialStabilityEngine — stabilityIndex", () => {
  it("returns a number between 0 and 100", () => {
    const result = financialStabilityEngine({ ...BASE, runway: 3.0 })
    expect(result.stabilityIndex).toBeGreaterThanOrEqual(0)
    expect(result.stabilityIndex).toBeLessThanOrEqual(100)
  })

  it("is a composite of scoreOperativo, scoreLiquidez, scoreRiesgo", () => {
    const result = financialStabilityEngine({ ...BASE, runway: 5.0 })

    const expected = Math.round(
      result.scoreOperativo * 0.4 +
      result.scoreLiquidez * 0.4 +
      result.scoreRiesgo * 0.2
    )
    expect(result.stabilityIndex).toBe(expected)
  })
})
