import type { Category, HubExport, Link, Settings, Space } from '../types'
import { SCHEMA_VERSION } from '../types'
import { DEFAULT_CATEGORIES, DEFAULT_SPACE } from '../seed'

export function buildExport(
  links: Link[],
  categories: Category[],
  spaces: Space[],
  settings: Settings,
): HubExport {
  // ไม่ export ข้อมูลที่ไม่ควรพกไปเครื่องอื่น (เช่นสถานะ onboarding)
  const { onboarded: _onboarded, ...safeSettings } = settings
  return {
    app: 'kiw-hq',
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    spaces,
    categories,
    links,
    settings: safeSettings,
  }
}

export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export interface ParsedImport {
  spaces: Space[]
  categories: Category[]
  links: Link[]
  settings: Partial<Settings>
}

// อ่าน + validate + migrate ไฟล์ JSON อย่างปลอดภัย
export function parseImport(raw: string): ParsedImport {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw new Error('ไฟล์ไม่ใช่ JSON ที่ถูกต้อง')
  }
  if (!json || typeof json !== 'object') throw new Error('รูปแบบไฟล์ไม่ถูกต้อง')
  const obj = json as Partial<HubExport>
  // รับทั้งชื่อใหม่ (kiw-hq) และชื่อเดิมก่อน rebrand (personal-web-hub)
  if (obj.app && obj.app !== 'kiw-hq' && obj.app !== 'personal-web-hub') {
    throw new Error('ไฟล์นี้ไม่ใช่ข้อมูลของ Kiw HQ')
  }
  if (!Array.isArray(obj.links)) throw new Error('ไม่พบรายการลิงก์ในไฟล์')

  const spaces: Space[] = Array.isArray(obj.spaces) && obj.spaces.length ? obj.spaces : [DEFAULT_SPACE]
  const categories: Category[] =
    Array.isArray(obj.categories) && obj.categories.length ? obj.categories : DEFAULT_CATEGORIES

  const links: Link[] = obj.links.map((l, i) => normalizeLink(l, i))

  return { spaces, categories, links, settings: obj.settings ?? {} }
}

function normalizeLink(l: Partial<Link>, index: number): Link {
  if (!l || typeof l.url !== 'string') throw new Error(`ลิงก์ลำดับที่ ${index + 1} ไม่มี URL`)
  return {
    id: l.id ?? `imp_${index}_${Math.random().toString(36).slice(2, 7)}`,
    title: l.title ?? l.url,
    url: l.url,
    description: l.description,
    categoryId: l.categoryId,
    tags: Array.isArray(l.tags) ? l.tags : [],
    favorite: Boolean(l.favorite),
    order: typeof l.order === 'number' ? l.order : index,
    openMode: l.openMode === 'same_tab' ? 'same_tab' : 'new_tab',
    note: l.note,
    color: l.color,
    iconUrl: l.iconUrl,
    createdAt: l.createdAt ?? new Date().toISOString(),
    lastOpenedAt: l.lastOpenedAt ?? null,
    openCount: typeof l.openCount === 'number' ? l.openCount : 0,
    spaceId: l.spaceId ?? 'default',
  }
}
