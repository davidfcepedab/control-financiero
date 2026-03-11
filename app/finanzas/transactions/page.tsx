"use client"

import { Suspense } from "react"
import TransactionsClient from "./TransactionsClient"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <Suspense fallback={null}>
      <TransactionsClient />
    </Suspense>
  )
}
