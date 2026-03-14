import React, { createContext, useContext, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Colors } from '../constants/theme'

type ThemeMode = 'dark' | 'light'

interface ThemeContextValue {
  isDark: boolean
  mode: ThemeMode
  toggle: () => void
  colors: typeof Colors.dark
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  mode: 'dark',
  toggle: () => {},
  colors: Colors.dark,
})

const STORAGE_KEY = 'frames_theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light') setMode('light')
      setLoaded(true)
    })
  }, [])

  const toggle = async () => {
    const next: ThemeMode = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    await AsyncStorage.setItem(STORAGE_KEY, next)
  }

  const value: ThemeContextValue = {
    isDark: mode === 'dark',
    mode,
    toggle,
    colors: mode === 'dark' ? Colors.dark : Colors.light,
  }

  if (!loaded) return null

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
