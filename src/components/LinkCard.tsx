import { useEffect, useRef, useState } from 'react'
import { Star, MoreVertical, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react'
import type { Link } from '../types'
import { useHubStore } from '../store/useHubStore'
import { Favicon } from './Favicon'
import { ConfirmDialog } from './ConfirmDialog'
import { shortUrl } from '../lib/url'

const SIZE = {
  sm: { icon: 34, pad: 'p-3', title: 'text-sm', desc: false },
  md: { icon: 42, pad: 'p-4', title: 'text-[15px]', desc: true },
  lg: { icon: 52, pad: 'p-5', title: 'text-base', desc: true },
} as const

export function LinkCard({ link }: { link: Link }) {
  const openLink = useHubStore((s) => s.openLink)
  const toggleFavorite = useHubStore((s) => s.toggleFavorite)
  const openEdit = useHubStore((s) => s.openEdit)
  const deleteLink = useHubStore((s) => s.deleteLink)
  const confirmDelete = useHubStore((s) => s.settings.confirmDelete)
  const cardSize = useHubStore((s) => s.settings.cardSize)
  const categories = useHubStore((s) => s.categories)
  const toast = useHubStore((s) => s.toast)

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const cfg = SIZE[cardSize]
  const category = categories.find((c) => c.id === link.categoryId)

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  const doDelete = () => {
    if (confirmDelete) setConfirming(true)
    else deleteLink(link.id)
    setMenuOpen(false)
  }

  const copyUrl = () => {
    navigator.clipboard?.writeText(link.url).then(() => toast('คัดลอกลิงก์แล้ว', 'success'))
    setMenuOpen(false)
  }

  return (
    <>
      <div
        onClick={() => openLink(link)}
        className={`group relative flex cursor-pointer flex-col gap-3 rounded-card border border-line bg-card ${cfg.pad} shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-pop`}
      >
        <div className="flex items-start gap-3">
          <Favicon url={link.url} title={link.title} iconUrl={link.iconUrl} size={cfg.icon} />
          <div className="min-w-0 flex-1">
            <div className={`truncate font-semibold ${cfg.title}`}>{link.title}</div>
            <div className="truncate text-xs text-muted">{shortUrl(link.url)}</div>
          </div>

          {/* actions */}
          <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => toggleFavorite(link.id)}
              title={link.favorite ? 'เอาออกจากโปรด' : 'เพิ่มเป็นโปรด'}
              className={`grid h-8 w-8 place-items-center rounded-lg transition hover:bg-elevated ${
                link.favorite ? 'text-amber-400' : 'text-muted opacity-0 group-hover:opacity-100'
              }`}
            >
              <Star size={16} fill={link.favorite ? 'currentColor' : 'none'} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                title="ตัวเลือกเพิ่มเติม"
                className="grid h-8 w-8 place-items-center rounded-lg text-muted opacity-0 transition hover:bg-elevated group-hover:opacity-100"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-20 w-44 animate-scale-in overflow-hidden rounded-xl border border-line bg-card py-1 shadow-pop">
                  <MenuItem icon={<ExternalLink size={15} />} onClick={() => { openLink(link); setMenuOpen(false) }}>
                    เปิดลิงก์
                  </MenuItem>
                  <MenuItem icon={<Pencil size={15} />} onClick={() => { openEdit(link); setMenuOpen(false) }}>
                    แก้ไข
                  </MenuItem>
                  <MenuItem icon={<Copy size={15} />} onClick={copyUrl}>
                    คัดลอก URL
                  </MenuItem>
                  <MenuItem icon={<Trash2 size={15} />} danger onClick={doDelete}>
                    ลบ
                  </MenuItem>
                </div>
              )}
            </div>
          </div>
        </div>

        {cfg.desc && link.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{link.description}</p>
        )}

        {(category || link.tags.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <span className="rounded-md bg-elevated px-2 py-0.5 text-xs text-muted">
                {category.icon} {category.name}
              </span>
            )}
            {link.tags.slice(0, 2).map((t) => (
              <span key={t} className="rounded-md px-1.5 py-0.5 text-xs text-accent" style={{ background: 'var(--accent-soft)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="ลบลิงก์นี้?"
        message={`"${link.title}" จะถูกลบออกจาก Hub — การกระทำนี้ย้อนกลับไม่ได้`}
        confirmLabel="ลบ"
        danger
        onConfirm={() => { deleteLink(link.id); setConfirming(false) }}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-elevated ${
        danger ? 'text-red-500' : 'text-fg'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
