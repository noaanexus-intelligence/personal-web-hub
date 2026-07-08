// โครงสร้างข้อมูลหลักของ Personal Web Hub
// หลักการ: local-first, ไม่เก็บ password/token/ข้อมูล sensitive

export type OpenMode = 'new_tab' | 'same_tab'
export type SortMode = 'manual' | 'az' | 'recent' | 'mostused'
export type ThemeMode = 'light' | 'dark' | 'system'
export type CardSize = 'sm' | 'md' | 'lg'

export interface Link {
  id: string
  title: string
  url: string
  description?: string
  categoryId?: string
  tags: string[]
  favorite: boolean // = ปักหมุดขึ้น Top row
  order: number // ลำดับ manual ภายในหมวด
  openMode: OpenMode
  note?: string
  color?: string // override สีการ์ด (optional)
  iconUrl?: string // override favicon (optional)
  createdAt: string
  lastOpenedAt: string | null
  openCount: number
  spaceId: string // MVP = 'default' (เปิดทาง Spaces ใน Phase 2)
}

export interface Category {
  id: string
  name: string
  icon: string // emoji (เรียบง่าย ปรับได้)
  color?: string
  order: number
  hidden: boolean
  spaceId: string
}

export interface Space {
  id: string
  name: string
  icon: string
  order: number
}

export interface Settings {
  theme: ThemeMode
  accent: string
  cardSize: CardSize
  fontScale: number
  radius: number // px
  animations: boolean
  defaultOpenMode: OpenMode
  confirmDelete: boolean
  defaultCategoryId?: string
  remoteFavicons: boolean // privacy: ปิด = ใช้ monogram ล้วน
  sortMode: SortMode
  usageStats: boolean
  activeSpaceId: string
  onboarded: boolean
}

export const SCHEMA_VERSION = 1

// รูปแบบไฟล์ Export / Import JSON
// 'personal-web-hub' คือชื่อเดิมก่อน rebrand เป็น Kiw HQ — ยังรับ import ได้
export interface HubExport {
  app: 'kiw-hq' | 'personal-web-hub'
  version: number
  exportedAt: string
  spaces: Space[]
  categories: Category[]
  links: Link[]
  settings: Partial<Settings>
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  accent: '#4f46e5',
  cardSize: 'md',
  fontScale: 1,
  radius: 16,
  animations: true,
  defaultOpenMode: 'new_tab',
  confirmDelete: true,
  remoteFavicons: true,
  sortMode: 'manual',
  usageStats: true,
  activeSpaceId: 'default',
  onboarded: false,
}
