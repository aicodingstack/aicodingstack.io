'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { CurrencyConversion, DisplayCurrency } from '@/lib/model-pricing'

export type CurrencyPreference = 'native' | DisplayCurrency
export type ExchangeRateStatus = 'idle' | 'loading' | 'ready' | 'error'

interface CachedExchangeRate {
  date: string
  fetchedAt: number
  usdToCny: number
}

interface CurrencyContextValue {
  conversion: CurrencyConversion | null
  exchangeRate: CachedExchangeRate | null
  preference: CurrencyPreference
  rateStatus: ExchangeRateStatus
  setPreference: (preference: CurrencyPreference) => void
}

const PREFERENCE_STORAGE_KEY = 'aicodingstack-currency-preference'
const RATE_STORAGE_KEY = 'aicodingstack-exchange-rate-usd-cny'
const RATE_TTL_MS = 24 * 60 * 60 * 1000
const RATE_ENDPOINT = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=CNY'

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

function readLocalStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // The current session still works when persistent storage is unavailable.
  }
}

function isCurrencyPreference(value: string | null): value is CurrencyPreference {
  return value === 'native' || value === 'CNY' || value === 'USD'
}

function parseCachedExchangeRate(value: string | null): CachedExchangeRate | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as Partial<CachedExchangeRate>
    if (
      typeof parsed.date === 'string' &&
      typeof parsed.fetchedAt === 'number' &&
      typeof parsed.usdToCny === 'number' &&
      Number.isFinite(parsed.usdToCny) &&
      parsed.usdToCny > 0
    ) {
      return parsed as CachedExchangeRate
    }
  } catch {
    // Ignore invalid local data and fetch a fresh rate when needed.
  }
  return null
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<CurrencyPreference>('native')
  const [exchangeRate, setExchangeRate] = useState<CachedExchangeRate | null>(null)
  const [rateStatus, setRateStatus] = useState<ExchangeRateStatus>('idle')

  useEffect(() => {
    const storedPreference = readLocalStorage(PREFERENCE_STORAGE_KEY)
    if (isCurrencyPreference(storedPreference)) setPreferenceState(storedPreference)

    const cachedRate = parseCachedExchangeRate(readLocalStorage(RATE_STORAGE_KEY))
    if (cachedRate) {
      setExchangeRate(cachedRate)
      setRateStatus('ready')
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === PREFERENCE_STORAGE_KEY && isCurrencyPreference(event.newValue)) {
        setPreferenceState(event.newValue)
      }
      if (event.key === RATE_STORAGE_KEY) {
        const nextRate = parseCachedExchangeRate(event.newValue)
        if (nextRate) {
          setExchangeRate(nextRate)
          setRateStatus('ready')
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (preference === 'native') return
    if (exchangeRate && Date.now() - exchangeRate.fetchedAt < RATE_TTL_MS) return

    const controller = new AbortController()
    setRateStatus('loading')

    void fetch(RATE_ENDPOINT, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error(`Exchange-rate request failed: ${response.status}`)
        return (await response.json()) as { date?: string; rates?: { CNY?: number } }
      })
      .then(data => {
        const usdToCny = data.rates?.CNY
        if (!data.date || !usdToCny || !Number.isFinite(usdToCny)) {
          throw new Error('Exchange-rate response is incomplete')
        }
        const nextRate: CachedExchangeRate = {
          date: data.date,
          fetchedAt: Date.now(),
          usdToCny,
        }
        setExchangeRate(nextRate)
        setRateStatus('ready')
        writeLocalStorage(RATE_STORAGE_KEY, JSON.stringify(nextRate))
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setRateStatus(exchangeRate ? 'ready' : 'error')
      })

    return () => controller.abort()
  }, [exchangeRate, preference])

  const setPreference = useCallback((nextPreference: CurrencyPreference) => {
    setPreferenceState(nextPreference)
    writeLocalStorage(PREFERENCE_STORAGE_KEY, nextPreference)
  }, [])

  const conversion = useMemo<CurrencyConversion | null>(() => {
    if (preference === 'native') return null
    return {
      targetCurrency: preference,
      usdToCny: exchangeRate?.usdToCny ?? null,
    }
  }, [exchangeRate, preference])

  const value = useMemo(
    () => ({ conversion, exchangeRate, preference, rateStatus, setPreference }),
    [conversion, exchangeRate, preference, rateStatus, setPreference]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
