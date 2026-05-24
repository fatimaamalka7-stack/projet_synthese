import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [color, setColor] = useState(() => localStorage.getItem('themeColor') || 'violet')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    // remove previous theme-... classes then add the selected one
    Array.from(document.documentElement.classList)
      .filter(c => c.startsWith('theme-'))
      .forEach(c => document.documentElement.classList.remove(c))
    document.documentElement.classList.add(`theme-${color}`)
    localStorage.setItem('themeColor', color)
  }, [color])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d), color, setColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
