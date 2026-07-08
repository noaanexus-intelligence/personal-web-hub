import { create } from 'zustand'
import type { Category, Link, Settings, Space } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import {
  db,
  ensureBootstrap,
  loadSettings,
  replaceAll,
  saveSettings,
} from '../db/hubDb'
import { DEFAULT_CATEGORIES, DEFAULT_SPACE, STARTER_LINKS } from '../seed'
import { uid } from '../lib/id'
import { normalizeUrl } from '../lib/url'
import { buildExport, type ParsedImport } from '../lib/importExport'

export type ModalState =
  | { kind: 'closed' }
  | { kind: 'add'; prefillUrl?: string }
  | { kind: 'edit'; link: Link }

export interface Toast {
  id: string
  message: string
  kind: 'success' | 'error' | 'info'
}

interface HubState {
  ready: boolean
  links: Link[]
  categories: Category[]
  spaces: Space[]
  settings: Settings

  // UI state (ไม่ persist)
  searchQuery: string
  activeCategory: string | 'all' | 'favorites'
  paletteOpen: boolean
  settingsOpen: boolean
  recentOpen: boolean
  modal: ModalState
  toasts: Toast[]

  // lifecycle
  hydrate: () => Promise<void>

  // links
  addLink: (data: Partial<Link> & { url: string; title: string }) => Promise<void>
  updateLink: (id: string, patch: Partial<Link>) => Promise<void>
  deleteLink: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  openLink: (link: Link) => void

  // categories
  addCategory: (name: string, icon: string) => Promise<void>
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  moveCategory: (id: string, dir: -1 | 1) => Promise<void>

  // settings
  updateSettings: (patch: Partial<Settings>) => Promise<void>

  // data ops
  seedStarter: () => Promise<void>
  importData: (parsed: ParsedImport) => Promise<void>
  exportData: () => ReturnType<typeof buildExport>
  clearRecent: () => Promise<void>
  resetAll: () => Promise<void>

  // ui setters
  setSearchQuery: (q: string) => void
  setActiveCategory: (c: string) => void
  openPalette: () => void
  closePalette: () => void
  openSettings: () => void
  closeSettings: () => void
  openRecent: () => void
  closeRecent: () => void
  openAdd: (prefillUrl?: string) => void
  openEdit: (link: Link) => void
  closeModal: () => void
  toast: (message: string, kind?: Toast['kind']) => void
  dismissToast: (id: string) => void
}

export const useHubStore = create<HubState>((set, get) => ({
  ready: false,
  links: [],
  categories: [],
  spaces: [DEFAULT_SPACE],
  settings: DEFAULT_SETTINGS,

  searchQuery: '',
  activeCategory: 'all',
  paletteOpen: false,
  settingsOpen: false,
  recentOpen: false,
  modal: { kind: 'closed' },
  toasts: [],

  hydrate: async () => {
    await ensureBootstrap()
    const [links, categories, spaces, settings] = await Promise.all([
      db.links.toArray(),
      db.categories.orderBy('order').toArray(),
      db.spaces.orderBy('order').toArray(),
      loadSettings(),
    ])
    set({
      links,
      categories,
      spaces: spaces.length ? spaces : [DEFAULT_SPACE],
      settings,
      ready: true,
    })
  },

  addLink: async (data) => {
    const { settings } = get()
    const link: Link = {
      id: uid(),
      title: data.title.trim(),
      url: normalizeUrl(data.url),
      description: data.description?.trim() || undefined,
      categoryId: data.categoryId ?? settings.defaultCategoryId,
      tags: data.tags ?? [],
      favorite: data.favorite ?? false,
      order: get().links.length,
      openMode: data.openMode ?? settings.defaultOpenMode,
      note: data.note?.trim() || undefined,
      color: data.color,
      iconUrl: data.iconUrl,
      createdAt: new Date().toISOString(),
      lastOpenedAt: null,
      openCount: 0,
      spaceId: settings.activeSpaceId,
    }
    await db.links.add(link)
    set((s) => ({ links: [...s.links, link] }))
    get().toast('เพิ่มลิงก์แล้ว', 'success')
  },

  updateLink: async (id, patch) => {
    if (patch.url) patch.url = normalizeUrl(patch.url)
    await db.links.update(id, patch)
    set((s) => ({ links: s.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  },

  deleteLink: async (id) => {
    await db.links.delete(id)
    set((s) => ({ links: s.links.filter((l) => l.id !== id) }))
    get().toast('ลบลิงก์แล้ว', 'info')
  },

  toggleFavorite: async (id) => {
    const link = get().links.find((l) => l.id === id)
    if (!link) return
    await get().updateLink(id, { favorite: !link.favorite })
  },

  openLink: (link) => {
    const { settings } = get()
    if (settings.usageStats) {
      const patch = { openCount: link.openCount + 1, lastOpenedAt: new Date().toISOString() }
      db.links.update(link.id, patch)
      set((s) => ({ links: s.links.map((l) => (l.id === link.id ? { ...l, ...patch } : l)) }))
    }
    const url = normalizeUrl(link.url)
    if (link.openMode === 'same_tab') window.location.href = url
    else window.open(url, '_blank', 'noopener,noreferrer')
  },

  addCategory: async (name, icon) => {
    const { categories, settings } = get()
    const cat: Category = {
      id: uid('cat'),
      name: name.trim(),
      icon: icon || '📁',
      order: categories.length,
      hidden: false,
      spaceId: settings.activeSpaceId,
    }
    await db.categories.add(cat)
    set((s) => ({ categories: [...s.categories, cat] }))
  },

  updateCategory: async (id, patch) => {
    await db.categories.update(id, patch)
    set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) }))
  },

  deleteCategory: async (id) => {
    // ลิงก์ในหมวดที่ถูกลบ -> categoryId = undefined (ไม่ลบลิงก์)
    const affected = get().links.filter((l) => l.categoryId === id)
    await db.transaction('rw', db.categories, db.links, async () => {
      await db.categories.delete(id)
      await Promise.all(affected.map((l) => db.links.update(l.id, { categoryId: undefined })))
    })
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      links: s.links.map((l) => (l.categoryId === id ? { ...l, categoryId: undefined } : l)),
      activeCategory: s.activeCategory === id ? 'all' : s.activeCategory,
    }))
  },

  moveCategory: async (id, dir) => {
    const cats = [...get().categories].sort((a, b) => a.order - b.order)
    const i = cats.findIndex((c) => c.id === id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= cats.length) return
    ;[cats[i].order, cats[j].order] = [cats[j].order, cats[i].order]
    await Promise.all([
      db.categories.update(cats[i].id, { order: cats[i].order }),
      db.categories.update(cats[j].id, { order: cats[j].order }),
    ])
    set({ categories: cats.sort((a, b) => a.order - b.order) })
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    await saveSettings(next)
  },

  seedStarter: async () => {
    await db.links.bulkAdd(STARTER_LINKS)
    set((s) => ({ links: [...s.links, ...STARTER_LINKS] }))
    await get().updateSettings({ onboarded: true })
  },

  importData: async (parsed) => {
    await replaceAll(parsed)
    if (parsed.settings && Object.keys(parsed.settings).length) {
      await get().updateSettings({ ...parsed.settings, onboarded: true })
    } else {
      await get().updateSettings({ onboarded: true })
    }
    set({
      links: parsed.links,
      categories: parsed.categories.sort((a, b) => a.order - b.order),
      spaces: parsed.spaces,
    })
    get().toast(`นำเข้า ${parsed.links.length} ลิงก์แล้ว`, 'success')
  },

  exportData: () => {
    const { links, categories, spaces, settings } = get()
    return buildExport(links, categories, spaces, settings)
  },

  clearRecent: async () => {
    const patch = { openCount: 0, lastOpenedAt: null as string | null }
    await Promise.all(get().links.map((l) => db.links.update(l.id, patch)))
    set((s) => ({ links: s.links.map((l) => ({ ...l, ...patch })) }))
    get().toast('ล้างประวัติการเปิดแล้ว', 'info')
  },

  resetAll: async () => {
    await replaceAll({ spaces: [DEFAULT_SPACE], categories: DEFAULT_CATEGORIES, links: [] })
    await get().updateSettings({ ...DEFAULT_SETTINGS })
    set({
      links: [],
      categories: DEFAULT_CATEGORIES,
      spaces: [DEFAULT_SPACE],
      activeCategory: 'all',
      searchQuery: '',
    })
    get().toast('รีเซ็ตข้อมูลทั้งหมดแล้ว', 'info')
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (c) => set({ activeCategory: c }),
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openRecent: () => set({ recentOpen: true }),
  closeRecent: () => set({ recentOpen: false }),
  openAdd: (prefillUrl) => set({ modal: { kind: 'add', prefillUrl } }),
  openEdit: (link) => set({ modal: { kind: 'edit', link } }),
  closeModal: () => set({ modal: { kind: 'closed' } }),
  toast: (message, kind = 'info') => {
    const id = uid('t')
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }))
    setTimeout(() => get().dismissToast(id), 2600)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
