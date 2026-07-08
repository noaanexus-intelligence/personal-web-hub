import Dexie, { type Table } from 'dexie'
import type { Category, Link, Settings, Space } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { DEFAULT_CATEGORIES, DEFAULT_SPACE } from '../seed'

// เก็บ settings เป็น key-value เพื่อความยืดหยุ่น (row เดียว id='app')
interface SettingsRow {
  id: string
  data: Settings
}

class HubDatabase extends Dexie {
  links!: Table<Link, string>
  categories!: Table<Category, string>
  spaces!: Table<Space, string>
  settings!: Table<SettingsRow, string>

  constructor() {
    super('personalWebHub')
    this.version(1).stores({
      links: 'id, categoryId, spaceId, favorite, order, lastOpenedAt, openCount',
      categories: 'id, order, spaceId',
      spaces: 'id, order',
      settings: 'id',
    })
  }
}

export const db = new HubDatabase()

// รับประกันว่ามี space เริ่มต้นเสมอ (ยังไม่ใส่ starter links — ให้ผู้ใช้เลือกตอน onboarding)
export async function ensureBootstrap(): Promise<void> {
  const spaceCount = await db.spaces.count()
  if (spaceCount === 0) {
    await db.spaces.add(DEFAULT_SPACE)
  }
  const catCount = await db.categories.count()
  if (catCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
  }
}

export async function loadSettings(): Promise<Settings> {
  const row = await db.settings.get('app')
  return { ...DEFAULT_SETTINGS, ...(row?.data ?? {}) }
}

export async function saveSettings(data: Settings): Promise<void> {
  await db.settings.put({ id: 'app', data })
}

// ล้างทั้งหมดแล้วเขียนใหม่ (ใช้ตอน Import / Reset)
export async function replaceAll(payload: {
  spaces: Space[]
  categories: Category[]
  links: Link[]
}): Promise<void> {
  await db.transaction('rw', db.links, db.categories, db.spaces, async () => {
    await Promise.all([db.links.clear(), db.categories.clear(), db.spaces.clear()])
    if (payload.spaces.length) await db.spaces.bulkAdd(payload.spaces)
    if (payload.categories.length) await db.categories.bulkAdd(payload.categories)
    if (payload.links.length) await db.links.bulkAdd(payload.links)
  })
}
