import { Search, Plus, Settings as SettingsIcon, Clock, Sun, Moon, Link2 } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'

export function TopBar() {
  const searchQuery = useHubStore((s) => s.searchQuery)
  const setSearchQuery = useHubStore((s) => s.setSearchQuery)
  const openAdd = useHubStore((s) => s.openAdd)
  const openSettings = useHubStore((s) => s.openSettings)
  const openRecent = useHubStore((s) => s.openRecent)
  const openPalette = useHubStore((s) => s.openPalette)
  const theme = useHubStore((s) => s.settings.theme)
  const updateSettings = useHubStore((s) => s.updateSettings)

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-[color:var(--accent-fg)]">
            <Link2 size={18} />
          </span>
          <span className="hidden sm:inline">Kiw HQ</span>
        </div>

        {/* Search bar (inline filter) — ⌘K เปิด Command Palette */}
        <div className="order-3 flex w-full min-w-0 items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 shadow-soft focus-within:border-accent sm:order-none sm:flex-1">
          <Search size={18} className="shrink-0 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเว็บหรือลิงก์…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            aria-label="ค้นหา"
          />
          <button
            onClick={openPalette}
            className="hidden shrink-0 items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-[11px] text-muted hover:border-accent hover:text-accent sm:flex"
            title="เปิด Command Palette"
          >
            ⌘K
          </button>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-[color:var(--accent-fg)] shadow-soft transition hover:opacity-90"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">เพิ่มลิงก์</span>
          </button>
          <IconButton title="เปิดล่าสุด" onClick={openRecent}>
            <Clock size={18} />
          </IconButton>
          <IconButton
            title={isDark ? 'โหมดสว่าง' : 'โหมดมืด'}
            onClick={() => updateSettings({ theme: isDark ? 'light' : 'dark' })}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <IconButton title="ตั้งค่า" onClick={openSettings}>
            <SettingsIcon size={18} />
          </IconButton>
        </div>
      </div>
    </header>
  )
}

function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card text-muted transition hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  )
}
