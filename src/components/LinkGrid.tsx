import { Inbox, SearchX } from 'lucide-react'
import type { Link } from '../types'
import { LinkCard } from './LinkCard'
import { useHubStore } from '../store/useHubStore'

export function LinkGrid({ links }: { links: Link[] }) {
  const searchQuery = useHubStore((s) => s.searchQuery)
  const openAdd = useHubStore((s) => s.openAdd)

  if (links.length === 0) {
    const searching = searchQuery.trim().length > 0
    return (
      <div className="grid place-items-center gap-3 rounded-2xl border border-dashed border-line py-20 text-center">
        {searching ? <SearchX size={40} className="text-muted" /> : <Inbox size={40} className="text-muted" />}
        <p className="text-muted">
          {searching ? `ไม่พบลิงก์ที่ตรงกับ "${searchQuery}"` : 'ยังไม่มีลิงก์ในหมวดนี้'}
        </p>
        {!searching && (
          <button
            onClick={() => openAdd()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-[color:var(--accent-fg)] hover:opacity-90"
          >
            + เพิ่มลิงก์แรก
          </button>
        )}
      </div>
    )
  }

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-muted">
          {searchQuery.trim() ? `ผลการค้นหา (${links.length})` : `ลิงก์ของฉัน (${links.length})`}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </section>
  )
}
