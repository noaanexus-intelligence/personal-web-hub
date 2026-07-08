import { useMemo } from 'react'
import { Clock, Flame } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'
import { SlideOver } from './Modal'
import { Favicon } from './Favicon'
import { shortUrl } from '../lib/url'
import type { Link } from '../types'

export function RecentPanel() {
  const open = useHubStore((s) => s.recentOpen)
  const close = useHubStore((s) => s.closeRecent)
  const links = useHubStore((s) => s.links)
  const openLink = useHubStore((s) => s.openLink)

  const recent = useMemo(
    () =>
      [...links]
        .filter((l) => l.lastOpenedAt)
        .sort((a, b) => (b.lastOpenedAt ?? '').localeCompare(a.lastOpenedAt ?? ''))
        .slice(0, 12),
    [links],
  )
  const mostUsed = useMemo(
    () => [...links].filter((l) => l.openCount > 0).sort((a, b) => b.openCount - a.openCount).slice(0, 8),
    [links],
  )

  return (
    <SlideOver open={open} onClose={close} title="กิจกรรม">
      <Section icon={<Clock size={15} />} title="เปิดล่าสุด" empty={recent.length === 0} onOpen={openLink} items={recent} />
      <div className="h-4" />
      <Section
        icon={<Flame size={15} />}
        title="ใช้บ่อยที่สุด"
        empty={mostUsed.length === 0}
        onOpen={openLink}
        items={mostUsed}
        showCount
      />
    </SlideOver>
  )
}

function Section({
  icon,
  title,
  items,
  empty,
  onOpen,
  showCount,
}: {
  icon: React.ReactNode
  title: string
  items: Link[]
  empty: boolean
  onOpen: (l: Link) => void
  showCount?: boolean
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
        {icon} {title}
      </h3>
      {empty ? (
        <p className="rounded-xl border border-dashed border-line px-3 py-6 text-center text-sm text-muted">
          ยังไม่มีข้อมูล — เปิดลิงก์สักอันแล้วกลับมาดูที่นี่
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((l) => (
            <button
              key={l.id}
              onClick={() => onOpen(l)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-elevated"
            >
              <Favicon url={l.url} title={l.title} iconUrl={l.iconUrl} size={32} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{l.title}</div>
                <div className="truncate text-xs text-muted">{shortUrl(l.url)}</div>
              </div>
              {showCount && <span className="shrink-0 text-xs text-muted">{l.openCount} ครั้ง</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
