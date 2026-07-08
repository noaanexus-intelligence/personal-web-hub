import { useEffect, useMemo } from 'react'
import { useHubStore } from './store/useHubStore'
import { ThemeProvider } from './components/ThemeProvider'
import { TopBar } from './components/TopBar'
import { CategoryChips } from './components/CategoryChips'
import { TopRow } from './components/TopRow'
import { LinkGrid } from './components/LinkGrid'
import { CommandPalette } from './components/CommandPalette'
import { AddEditLinkModal } from './components/AddEditLinkModal'
import { SettingsPanel } from './components/SettingsPanel'
import { RecentPanel } from './components/RecentPanel'
import { Toaster } from './components/Toaster'
import { Onboarding } from './components/Onboarding'
import { searchLinks } from './lib/search'
import type { Link } from './types'

function sortLinks(links: Link[], mode: string): Link[] {
  const arr = [...links]
  switch (mode) {
    case 'az':
      return arr.sort((a, b) => a.title.localeCompare(b.title, 'th'))
    case 'recent':
      return arr.sort((a, b) => (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''))
    case 'mostused':
      return arr.sort((a, b) => b.openCount - a.openCount)
    default:
      return arr.sort((a, b) => a.order - b.order)
  }
}

export function App() {
  const ready = useHubStore((s) => s.ready)
  const hydrate = useHubStore((s) => s.hydrate)
  const links = useHubStore((s) => s.links)
  const categories = useHubStore((s) => s.categories)
  const settings = useHubStore((s) => s.settings)
  const searchQuery = useHubStore((s) => s.searchQuery)
  const activeCategory = useHubStore((s) => s.activeCategory)
  const openPalette = useHubStore((s) => s.openPalette)
  const openAdd = useHubStore((s) => s.openAdd)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Global hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' ||
          e.target.tagName === 'TEXTAREA' ||
          e.target.isContentEditable)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        openPalette()
      } else if (!typing && e.key === '/') {
        e.preventDefault()
        openPalette()
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n' && !typing) {
        e.preventDefault()
        openAdd()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPalette, openAdd])

  const visible = useMemo(() => {
    if (searchQuery.trim()) return searchLinks(links, categories, searchQuery)
    let filtered = links
    if (activeCategory === 'favorites') filtered = links.filter((l) => l.favorite)
    else if (activeCategory !== 'all') filtered = links.filter((l) => l.categoryId === activeCategory)
    return sortLinks(filtered, settings.sortMode)
  }, [links, categories, searchQuery, activeCategory, settings.sortMode])

  const favorites = useMemo(
    () => sortLinks(links.filter((l) => l.favorite), 'manual'),
    [links],
  )

  const showTopRow = !searchQuery.trim() && activeCategory === 'all' && favorites.length > 0
  const needsOnboarding = ready && !settings.onboarded && links.length === 0

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg text-fg">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6">
          {!ready ? (
            <div className="grid place-items-center py-32 text-muted">กำลังโหลด…</div>
          ) : needsOnboarding ? (
            <Onboarding />
          ) : (
            <>
              <CategoryChips />
              {showTopRow && <TopRow links={favorites} />}
              <LinkGrid links={visible} />
            </>
          )}
        </main>

        <CommandPalette />
        <AddEditLinkModal />
        <SettingsPanel />
        <RecentPanel />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}
