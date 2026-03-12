export function financialPredictionEngine({
  structuralCategories,
  totalStructural,
}: {
  structuralCategories: any[]
  totalStructural: number
}) {
  if (!structuralCategories || totalStructural === 0) {
    return {
      projectedEndOfMonth: 0,
      warning: false,
    }
  }

  const today = new Date()
  const currentDay = today.getDate()
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate()

  const dailyAverage = totalStructural / currentDay
  const projectedEndOfMonth = Math.round(
    dailyAverage * daysInMonth
  )

  const warning =
    currentDay < 15 &&
    dailyAverage * 30 > totalStructural * 1.2

  return {
    dailyAverage: Math.round(dailyAverage),
    projectedEndOfMonth,
    warning,
  }
}
