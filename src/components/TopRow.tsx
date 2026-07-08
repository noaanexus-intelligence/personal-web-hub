import { Star } from 'lucide-react'
import type { Link } from '../types'
import { useHubStore } from '../store/useHubStore'
import { Favicon } from './Favicon'

// Quick Access แบบ adaptive — รวมลิงก์ที่ปักหมุด (favorite) ไว้ด้านบน
export function TopRow({ links }: { links: Link[] }) {
  const openLink = useHubStore((s) => s.openLink)

  return (
    <section className="mb-6">
      <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted">
        <Star size={14} className="text-amber-400" fill="currentColor" /> Quick Access
      </h2>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:grid sm:grid-cols-[repeat(auto-fill,minmax(108px,1fr))] sm:overflow-visible">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => openLink(link)}
            title={link.title}
            className="flex w-[92px] shrink-0 flex-col items-center gap-2 rounded-card border border-line bg-card p-3 shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-pop sm:w-auto"
          >
            <Favicon url={link.url} title={link.title} iconUrl={link.iconUrl} size={40} />
            <span className="w-full truncate text-center text-xs font-medium">{link.title}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
