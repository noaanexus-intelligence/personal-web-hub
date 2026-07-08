import { getDomain } from './url'

// Favicon จาก Google s2 service — จะใช้ก็ต่อเมื่อ remoteFavicons = true (privacy toggle)
export function faviconUrl(url: string, size = 64): string {
  const domain = getDomain(url)
  if (!domain) return ''
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`
}

// สีพื้นหลัง monogram แบบ deterministic จากชื่อ/domain (fallback เมื่อไม่มี favicon)
const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6',
]

export function monogramColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export function monogramLetter(title: string, url: string): string {
  const base = (title || getDomain(url) || '?').trim()
  return base.charAt(0).toUpperCase()
}
