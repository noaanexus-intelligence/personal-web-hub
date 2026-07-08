import { useEffect } from 'react'
import { useHubStore } from '../store/useHubStore'

// อ่าน settings แล้วเซ็ตลง <html> — theme, accent, radius, font scale, animations
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, accent, radius, fontScale, animations } = useHubStore((s) => s.settings)

  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      root.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#0f172a' : '#f6f7fb')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', accent)
    root.style.setProperty('--accent-soft', hexToSoft(accent))
    root.style.setProperty('--radius', `${radius}px`)
    root.style.setProperty('--font-scale', String(fontScale))
    document.body.classList.toggle('no-anim', !animations)
  }, [accent, radius, fontScale, animations])

  return <>{children}</>
}

function hexToSoft(hex: string): string {
  const m = hex.replace('#', '')
  if (m.length !== 6) return 'rgba(79,70,229,0.1)'
  const r = parseInt(m.slice(0, 2), 16)
  const g = parseInt(m.slice(2, 4), 16)
  const b = parseInt(m.slice(4, 6), 16)
  return `rgba(${r},${g},${b},0.12)`
}
