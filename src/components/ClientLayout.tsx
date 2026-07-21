'use client'

import { CurrencyProvider } from './CurrencyProvider'
import { ThemeProvider } from './ThemeProvider'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </CurrencyProvider>
  )
}
