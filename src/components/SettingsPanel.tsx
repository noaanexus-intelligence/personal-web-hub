import { useRef, useState } from 'react'
import {
  Palette,
  MousePointerClick,
  FolderTree,
  Database,
  ShieldCheck,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react'
import { useHubStore } from '../store/useHubStore'
import { SlideOver } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import { downloadJson, parseImport } from '../lib/importExport'
import type { CardSize, OpenMode, ThemeMode } from '../types'

const TABS = [
  { id: 'appearance', label: 'หน้าตา', icon: <Palette size={16} /> },
  { id: 'behavior', label: 'ลิงก์', icon: <MousePointerClick size={16} /> },
  { id: 'categories', label: 'หมวดหมู่', icon: <FolderTree size={16} /> },
  { id: 'data', label: 'ข้อมูล', icon: <Database size={16} /> },
  { id: 'privacy', label: 'ความเป็นส่วนตัว', icon: <ShieldCheck size={16} /> },
] as const

const ACCENTS = ['#4f46e5', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316', '#ec4899', '#ef4444', '#64748b']

export function SettingsPanel() {
  const open = useHubStore((s) => s.settingsOpen)
  const close = useHubStore((s) => s.closeSettings)
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('appearance')

  return (
    <SlideOver open={open} onClose={close} title="ตั้งค่า">
      <div className="no-scrollbar -mx-1 mb-4 flex gap-1 overflow-x-auto px-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition ${
              tab === t.id ? 'bg-accent text-[color:var(--accent-fg)]' : 'text-muted hover:bg-elevated'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'behavior' && <BehaviorTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'data' && <DataTab />}
      {tab === 'privacy' && <PrivacyTab />}
    </SlideOver>
  )
}

/* ---------- Appearance ---------- */
function AppearanceTab() {
  const s = useHubStore((st) => st.settings)
  const update = useHubStore((st) => st.updateSettings)
  return (
    <div className="space-y-5">
      <Row label="ธีม">
        <Segmented
          value={s.theme}
          onChange={(v) => update({ theme: v as ThemeMode })}
          options={[
            { value: 'light', label: 'สว่าง' },
            { value: 'dark', label: 'มืด' },
            { value: 'system', label: 'ตามระบบ' },
          ]}
        />
      </Row>
      <Row label="สีหลัก (Accent)">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => update({ accent: c })}
              className={`h-7 w-7 rounded-full border-2 transition ${
                s.accent === c ? 'border-fg scale-110' : 'border-transparent'
              }`}
              style={{ background: c }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={s.accent}
            onChange={(e) => update({ accent: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
            title="สีกำหนดเอง"
          />
        </div>
      </Row>
      <Row label="ขนาดการ์ด">
        <Segmented
          value={s.cardSize}
          onChange={(v) => update({ cardSize: v as CardSize })}
          options={[
            { value: 'sm', label: 'เล็ก' },
            { value: 'md', label: 'กลาง' },
            { value: 'lg', label: 'ใหญ่' },
          ]}
        />
      </Row>
      <Row label={`ขนาดตัวอักษร (${Math.round(s.fontScale * 100)}%)`}>
        <input
          type="range"
          min={0.85}
          max={1.2}
          step={0.05}
          value={s.fontScale}
          onChange={(e) => update({ fontScale: Number(e.target.value) })}
          className="w-full accent-[color:var(--accent)]"
        />
      </Row>
      <Row label={`ความมนขอบ (${s.radius}px)`}>
        <input
          type="range"
          min={0}
          max={24}
          step={2}
          value={s.radius}
          onChange={(e) => update({ radius: Number(e.target.value) })}
          className="w-full accent-[color:var(--accent)]"
        />
      </Row>
      <Toggle label="เปิดใช้ Animation" checked={s.animations} onChange={(v) => update({ animations: v })} />
    </div>
  )
}

/* ---------- Behavior ---------- */
function BehaviorTab() {
  const s = useHubStore((st) => st.settings)
  const update = useHubStore((st) => st.updateSettings)
  const categories = useHubStore((st) => st.categories)
  return (
    <div className="space-y-5">
      <Row label="เปิดลิงก์เริ่มต้น">
        <Segmented
          value={s.defaultOpenMode}
          onChange={(v) => update({ defaultOpenMode: v as OpenMode })}
          options={[
            { value: 'new_tab', label: 'แท็บใหม่' },
            { value: 'same_tab', label: 'หน้าเดิม' },
          ]}
        />
      </Row>
      <Row label="หมวดเริ่มต้นเมื่อเพิ่มลิงก์">
        <select
          value={s.defaultCategoryId ?? ''}
          onChange={(e) => update({ defaultCategoryId: e.target.value || undefined })}
          className="input cursor-pointer"
        >
          <option value="">— ไม่ระบุ —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </Row>
      <Toggle
        label="ยืนยันก่อนลบลิงก์"
        checked={s.confirmDelete}
        onChange={(v) => update({ confirmDelete: v })}
      />
    </div>
  )
}

/* ---------- Categories ---------- */
function CategoriesTab() {
  const categories = useHubStore((s) => s.categories)
  const addCategory = useHubStore((s) => s.addCategory)
  const updateCategory = useHubStore((s) => s.updateCategory)
  const deleteCategory = useHubStore((s) => s.deleteCategory)
  const moveCategory = useHubStore((s) => s.moveCategory)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📁')
  const [delId, setDelId] = useState<string | null>(null)
  const sorted = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={icon}
          onChange={(e) => setIcon(e.target.value.slice(0, 2))}
          className="w-12 rounded-xl border border-line bg-bg px-2 py-2 text-center text-lg outline-none focus:border-accent"
          aria-label="ไอคอน"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              addCategory(name, icon)
              setName('')
              setIcon('📁')
            }
          }}
          placeholder="ชื่อหมวดใหม่…"
          className="input flex-1"
        />
        <button
          onClick={() => {
            if (name.trim()) {
              addCategory(name, icon)
              setName('')
              setIcon('📁')
            }
          }}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-[color:var(--accent-fg)] hover:opacity-90"
          aria-label="เพิ่มหมวด"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-1.5">
        {sorted.map((c, i) => (
          <div key={c.id} className="flex items-center gap-2 rounded-xl border border-line bg-bg px-2 py-1.5">
            <span className="grid h-8 w-8 place-items-center text-lg">{c.icon}</span>
            <input
              value={c.name}
              onChange={(e) => updateCategory(c.id, { name: e.target.value })}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <IconBtn title="เลื่อนขึ้น" disabled={i === 0} onClick={() => moveCategory(c.id, -1)}>
              <ChevronUp size={16} />
            </IconBtn>
            <IconBtn title="เลื่อนลง" disabled={i === sorted.length - 1} onClick={() => moveCategory(c.id, 1)}>
              <ChevronDown size={16} />
            </IconBtn>
            <IconBtn
              title={c.hidden ? 'แสดง' : 'ซ่อน'}
              onClick={() => updateCategory(c.id, { hidden: !c.hidden })}
            >
              {c.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconBtn>
            <IconBtn title="ลบ" danger onClick={() => setDelId(c.id)}>
              <Trash2 size={16} />
            </IconBtn>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={delId !== null}
        title="ลบหมวดนี้?"
        message="ลิงก์ในหมวดนี้จะไม่ถูกลบ แต่จะกลายเป็น 'ไม่ระบุหมวด'"
        confirmLabel="ลบหมวด"
        danger
        onConfirm={() => {
          if (delId) deleteCategory(delId)
          setDelId(null)
        }}
        onCancel={() => setDelId(null)}
      />
    </div>
  )
}

/* ---------- Data ---------- */
function DataTab() {
  const exportData = useHubStore((s) => s.exportData)
  const importData = useHubStore((s) => s.importData)
  const clearRecent = useHubStore((s) => s.clearRecent)
  const resetAll = useHubStore((s) => s.resetAll)
  const toast = useHubStore((s) => s.toast)
  const fileRef = useRef<HTMLInputElement>(null)
  const [resetting, setResetting] = useState(false)

  const onExport = () => {
    const data = exportData()
    downloadJson(data, `kiw-hq-backup-${data.exportedAt.slice(0, 10)}.json`)
    toast('ส่งออกข้อมูลแล้ว', 'success')
  }

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text()
      importData(parseImport(text))
    } catch (err) {
      toast(err instanceof Error ? err.message : 'นำเข้าไม่สำเร็จ', 'error')
    }
  }

  return (
    <div className="space-y-3">
      <BigButton icon={<Download size={18} />} title="ส่งออกข้อมูล (JSON)" desc="สำรองลิงก์ทั้งหมดเป็นไฟล์" onClick={onExport} />
      <BigButton
        icon={<Upload size={18} />}
        title="นำเข้าข้อมูล (JSON)"
        desc="กู้คืนหรือย้ายข้อมูลจากไฟล์ที่สำรองไว้"
        onClick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImportFile(f)
          e.target.value = ''
        }}
      />
      <BigButton
        icon={<Trash2 size={18} />}
        title="ล้างประวัติการเปิด"
        desc="รีเซ็ตจำนวนครั้งและเวลาที่เปิดล่าสุด"
        onClick={() => clearRecent()}
      />
      <BigButton
        icon={<RotateCcw size={18} />}
        title="รีเซ็ตทั้งหมด"
        desc="ลบลิงก์ทั้งหมดและคืนค่าเริ่มต้น"
        danger
        onClick={() => setResetting(true)}
      />
      <ConfirmDialog
        open={resetting}
        title="รีเซ็ตข้อมูลทั้งหมด?"
        message="ลิงก์ หมวดหมู่ และการตั้งค่าทั้งหมดจะถูกลบถาวร — แนะนำให้ส่งออกสำรองก่อน"
        confirmLabel="รีเซ็ต"
        danger
        onConfirm={() => {
          resetAll()
          setResetting(false)
        }}
        onCancel={() => setResetting(false)}
      />
    </div>
  )
}

/* ---------- Privacy ---------- */
function PrivacyTab() {
  const s = useHubStore((st) => st.settings)
  const update = useHubStore((st) => st.updateSettings)
  return (
    <div className="space-y-5">
      <Toggle
        label="โหลด favicon จากอินเทอร์เน็ต"
        desc="ปิดเพื่อความเป็นส่วนตัวสูงสุด — จะใช้ไอคอนตัวอักษรแทน (ไม่มีการเรียกเซิร์ฟเวอร์ภายนอก)"
        checked={s.remoteFavicons}
        onChange={(v) => update({ remoteFavicons: v })}
      />
      <Toggle
        label="เก็บสถิติการใช้งาน"
        desc="นับจำนวนครั้งและเวลาที่เปิด เพื่อทำ 'เปิดล่าสุด' และ 'ใช้บ่อยสุด' (เก็บในเครื่องเท่านั้น)"
        checked={s.usageStats}
        onChange={(v) => update({ usageStats: v })}
      />
      <div className="rounded-xl border border-line bg-bg p-4 text-sm text-muted">
        <div className="mb-1 flex items-center gap-1.5 font-medium text-fg">
          <ShieldCheck size={16} className="text-green-500" /> Local-first &amp; ปลอดภัย
        </div>
        ข้อมูลทั้งหมดเก็บใน IndexedDB ของเบราว์เซอร์นี้เท่านั้น · ไม่มีการล็อกอิน · ไม่มีเซิร์ฟเวอร์ ·
        <b> ไม่เก็บรหัสผ่านหรือ Token ใด ๆ</b>
      </div>
    </div>
  )
}

/* ---------- shared controls ---------- */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium">{label}</div>
      {children}
    </div>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-bg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${
            value === o.value ? 'bg-accent text-[color:var(--accent-fg)] shadow-soft' : 'text-muted hover:text-fg'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {desc && <span className="mt-0.5 block text-xs text-muted">{desc}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
          checked ? 'bg-accent' : 'bg-line'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  )
}

function IconBtn({
  children,
  onClick,
  title,
  danger,
  disabled,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition hover:bg-elevated disabled:opacity-30 ${
        danger ? 'text-red-500' : 'text-muted'
      }`}
    >
      {children}
    </button>
  )
}

function BigButton({
  icon,
  title,
  desc,
  onClick,
  danger,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition hover:border-accent ${
        danger ? 'border-red-500/30' : 'border-line'
      }`}
    >
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${danger ? 'text-red-500' : 'text-accent'}`} style={{ background: 'var(--accent-soft)' }}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-medium ${danger ? 'text-red-500' : ''}`}>{title}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
    </button>
  )
}
