import { useMemo } from 'react'
import { Star, LayoutGrid, SlidersHorizontal } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'
import type { SortMode } from '../types'

const SORT_LABEL: Record<SortMode, string> = {
  manual: 'ลำดับเอง',
  az: 'ก-ฮ / A-Z',
  recent: 'เปิดล่าสุด',
  mostused: 'ใช้บ่อยสุด',
}

export function CategoryChips() {
  const categories = useHubStore((s) => s.categories)
  const links = useHubStore((s) => s.links)
  const active = useHubStore((s) => s.activeCategory)
  const setActive = useHubStore((s) => s.setActiveCategory)
  const sortMode = useHubStore((s) => s.settings.sortMode)
  const updateSettings = useHubStore((s) => s.updateSettings)

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of links) if (l.categoryId) map.set(l.categoryId, (map.get(l.categoryId) ?? 0) + 1)
    return map
  }, [links])

  const favCount = links.filter((l) => l.favorite).length
  const visibleCats = categories.filter((c) => !c.hidden).sort((a, b) => a.order - b.order)

  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto py-1">
        <Chip active={active === 'all'} onClick={() => setActive('all')}>
          <LayoutGrid size={14} /> ทั้งหมด
          <Count n={links.length} />
        </Chip>
        {favCount > 0 && (
          <Chip active={active === 'favorites'} onClick={() => setActive('favorites')}>
            <Star size={14} /> รายการโปรด
            <Count n={favCount} />
          </Chip>
        )}
        {visibleCats.map((c) => (
          <Chip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
            <span>{c.icon}</span> {c.name}
            <Count n={counts.get(c.id) ?? 0} />
          </Chip>
        ))}
      </div>

      <label className="hidden shrink-0 items-center gap-1.5 text-sm text-muted sm:flex">
        <SlidersHorizontal size={14} />
        <select
          value={sortMode}
          onChange={(e) => updateSettings({ sortMode: e.target.value as SortMode })}
          className="cursor-pointer rounded-lg border border-line bg-card px-2 py-1.5 text-sm text-fg outline-none focus:border-accent"
        >
          {(Object.keys(SORT_LABEL) as SortMode[]).map((k) => (
            <option key={k} value={k}>
              {SORT_LABEL[k]}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-transparent bg-accent text-[color:var(--accent-fg)] shadow-soft'
          : 'border-line bg-card text-fg hover:border-accent'
      }`}
    >
      {children}
    </button>
  )
}

function Count({ n }: { n: number }) {
  return <span className="text-xs opacity-60">{n}</span>
}
