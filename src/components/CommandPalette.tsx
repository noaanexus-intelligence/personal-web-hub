import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Plus,
  Settings as SettingsIcon,
  SunMoon,
  Star,
  Globe,
  CornerDownLeft,
  Clock,
} from 'lucide-react'
import { useHubStore } from '../store/useHubStore'
import { searchLinks } from '../lib/search'
import { isProbablyUrl, normalizeUrl } from '../lib/url'
import { Favicon } from './Favicon'

const enc = encodeURIComponent
const BANGS: Record<string, { name: string; url: (q: string) => string }> = {
  g: { name: 'Google', url: (q) => `https://www.google.com/search?q=${enc(q)}` },
  yt: { name: 'YouTube', url: (q) => `https://www.youtube.com/results?search_query=${enc(q)}` },
  gh: { name: 'GitHub', url: (q) => `https://github.com/search?q=${enc(q)}` },
  w: { name: 'Wikipedia', url: (q) => `https://th.wikipedia.org/w/index.php?search=${enc(q)}` },
  map: { name: 'Google Maps', url: (q) => `https://www.google.com/maps/search/${enc(q)}` },
}

interface PItem {
  id: string
  section: string
  icon: React.ReactNode
  label: string
  hint?: string
  run: () => void
}

export function CommandPalette() {
  const open = useHubStore((s) => s.paletteOpen)
  const close = useHubStore((s) => s.closePalette)
  const links = useHubStore((s) => s.links)
  const categories = useHubStore((s) => s.categories)
  const openLink = useHubStore((s) => s.openLink)
  const openAdd = useHubStore((s) => s.openAdd)
  const openSettings = useHubStore((s) => s.openSettings)
  const setActiveCategory = useHubStore((s) => s.setActiveCategory)
  const updateSettings = useHubStore((s) => s.updateSettings)
  const theme = useHubStore((s) => s.settings.theme)

  const [query, setQuery] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const run = (fn: () => void) => {
    fn()
    close()
  }

  const items = useMemo<PItem[]>(() => {
    const q = query.trim()
    const out: PItem[] = []

    // URL ตรง ๆ
    if (q && isProbablyUrl(q)) {
      const url = normalizeUrl(q)
      out.push({
        id: 'open-url',
        section: 'ลิงก์',
        icon: <Globe size={16} />,
        label: `เปิด ${url}`,
        hint: 'ลิงก์',
        run: () => run(() => window.open(url, '_blank', 'noopener,noreferrer')),
      })
      out.push({
        id: 'add-url',
        section: 'ลิงก์',
        icon: <Plus size={16} />,
        label: `เพิ่ม "${q}" เข้า Hub`,
        run: () => run(() => openAdd(q)),
      })
    }

    // Bang shortcut เช่น "g cats"
    const [first, ...rest] = q.split(' ')
    const bang = BANGS[first?.toLowerCase()]
    if (bang && rest.length) {
      const term = rest.join(' ')
      out.push({
        id: 'bang',
        section: 'ค้นเว็บ',
        icon: <Search size={16} />,
        label: `ค้นหา "${term}" ใน ${bang.name}`,
        hint: `!${first}`,
        run: () => run(() => window.open(bang.url(term), '_blank', 'noopener,noreferrer')),
      })
    }

    // ลิงก์ที่ตรงกับคำค้น
    const matched = q ? searchLinks(links, categories, q).slice(0, 6) : []
    for (const l of matched) {
      out.push({
        id: `link-${l.id}`,
        section: 'ลิงก์ของฉัน',
        icon: <Favicon url={l.url} title={l.title} iconUrl={l.iconUrl} size={22} />,
        label: l.title,
        hint: l.categoryId ? categories.find((c) => c.id === l.categoryId)?.name : undefined,
        run: () => run(() => openLink(l)),
      })
    }

    // หมวดที่ตรงกับคำค้น
    if (q) {
      categories
        .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 3)
        .forEach((c) =>
          out.push({
            id: `cat-${c.id}`,
            section: 'หมวดหมู่',
            icon: <span className="text-base">{c.icon}</span>,
            label: `ไปหมวด ${c.name}`,
            run: () => run(() => setActiveCategory(c.id)),
          }),
        )
    }

    // คำสั่งพื้นฐาน (แสดงเสมอเมื่อไม่ค้น หรือเป็น fallback)
    const commands: PItem[] = [
      {
        id: 'cmd-add',
        section: 'คำสั่ง',
        icon: <Plus size={16} />,
        label: 'เพิ่มลิงก์ใหม่',
        hint: '⌘N',
        run: () => run(() => openAdd(isProbablyUrl(q) ? q : undefined)),
      },
      {
        id: 'cmd-fav',
        section: 'คำสั่ง',
        icon: <Star size={16} />,
        label: 'ดูรายการโปรด',
        run: () => run(() => setActiveCategory('favorites')),
      },
      {
        id: 'cmd-theme',
        section: 'คำสั่ง',
        icon: <SunMoon size={16} />,
        label: 'สลับธีมสว่าง / มืด',
        run: () =>
          run(() => {
            const dark =
              theme === 'dark' ||
              (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            updateSettings({ theme: dark ? 'light' : 'dark' })
          }),
      },
      {
        id: 'cmd-settings',
        section: 'คำสั่ง',
        icon: <SettingsIcon size={16} />,
        label: 'เปิดการตั้งค่า',
        run: () => run(() => openSettings()),
      },
    ]
    if (!q) {
      // ลิงก์ที่เปิดล่าสุด
      const recent = [...links]
        .filter((l) => l.lastOpenedAt)
        .sort((a, b) => (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''))
        .slice(0, 4)
      recent.forEach((l) =>
        out.push({
          id: `recent-${l.id}`,
          section: 'เปิดล่าสุด',
          icon: <Clock size={16} className="text-muted" />,
          label: l.title,
          run: () => run(() => openLink(l)),
        }),
      )
      out.push(...commands)
    } else {
      const cmdFilter = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()))
      out.push(...cmdFilter)
      // fallback ค้นเว็บเสมอ
      out.push({
        id: 'web-search',
        section: 'ค้นเว็บ',
        icon: <Search size={16} />,
        label: `ค้นเว็บด้วย Google: "${q}"`,
        run: () => run(() => window.open(BANGS.g.url(q), '_blank', 'noopener,noreferrer')),
      })
    }

    return out
  }, [query, links, categories, theme, openLink, openAdd, openSettings, setActiveCategory, updateSettings])

  useEffect(() => {
    if (sel >= items.length) setSel(Math.max(0, items.length - 1))
  }, [items.length, sel])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSel((s) => Math.min(items.length - 1, s + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSel((s) => Math.max(0, s - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      items[sel]?.run()
    } else if (e.key === 'Escape') {
      close()
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${sel}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [sel])

  if (!open) return null

  let lastSection = ''
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSel(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="ค้นลิงก์ · พิมพ์ URL · คำสั่ง · หรือค้นเว็บ…"
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {items.length === 0 && (
            <div className="px-3 py-8 text-center text-sm text-muted">ไม่พบผลลัพธ์</div>
          )}
          {items.map((item, i) => {
            const showHeader = item.section !== lastSection
            lastSection = item.section
            return (
              <div key={item.id}>
                {showHeader && (
                  <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {item.section}
                  </div>
                )}
                <button
                  data-idx={i}
                  onMouseMove={() => setSel(i)}
                  onClick={() => item.run()}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                    i === sel ? 'bg-accent-soft text-fg' : 'hover:bg-elevated'
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center text-muted">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">
                      {item.hint}
                    </span>
                  )}
                  {i === sel && <CornerDownLeft size={14} className="shrink-0 text-muted" />}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
