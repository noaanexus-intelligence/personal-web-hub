import Fuse from 'fuse.js'
import type { Category, Link } from '../types'

// ค้นหาแบบ fuzzy ครอบคลุม title/url/description/tags/note + ชื่อหมวด
export function searchLinks(links: Link[], categories: Category[], query: string): Link[] {
  const q = query.trim()
  if (!q) return links

  const catName = new Map(categories.map((c) => [c.id, c.name]))
  const fuse = new Fuse(links, {
    includeScore: true,
    threshold: 0.4,
    ignoreLocation: true,
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 1 },
      { name: 'url', weight: 1.5 },
      { name: 'tags', weight: 2 },
      { name: 'note', weight: 1 },
      { name: 'categoryName', weight: 1, getFn: (l: Link) => catName.get(l.categoryId ?? '') ?? '' },
    ],
  })
  return fuse.search(q).map((r) => r.item)
}
