"use client"

import { createContext, useContext, useState } from "react"

const FinanceContext = createContext<any>(null)

export function FinanceProvider({ children }: any) {
  const today = new Date().toISOString().slice(0, 7)

  const [month, setMonth] = useState(today)

  return (
    <FinanceContext.Provider value={{ month, setMonth }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
