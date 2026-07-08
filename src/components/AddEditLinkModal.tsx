import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'
import { Modal } from './Modal'
import { ConfirmDialog } from './ConfirmDialog'
import { Favicon } from './Favicon'
import type { OpenMode } from '../types'
import { isProbablyUrl, titleFromUrl } from '../lib/url'

interface FormState {
  url: string
  title: string
  categoryId: string
  description: string
  tags: string
  note: string
  favorite: boolean
  openMode: OpenMode
}

const EMPTY: FormState = {
  url: '',
  title: '',
  categoryId: '',
  description: '',
  tags: '',
  note: '',
  favorite: false,
  openMode: 'new_tab',
}

export function AddEditLinkModal() {
  const modal = useHubStore((s) => s.modal)
  const closeModal = useHubStore((s) => s.closeModal)
  const categories = useHubStore((s) => s.categories)
  const addLink = useHubStore((s) => s.addLink)
  const updateLink = useHubStore((s) => s.updateLink)
  const deleteLink = useHubStore((s) => s.deleteLink)
  const confirmDelete = useHubStore((s) => s.settings.confirmDelete)
  const defaultOpenMode = useHubStore((s) => s.settings.defaultOpenMode)
  const toast = useHubStore((s) => s.toast)

  const isOpen = modal.kind !== 'closed'
  const isEdit = modal.kind === 'edit'
  const [form, setForm] = useState<FormState>(EMPTY)
  const [confirming, setConfirming] = useState(false)
  const [showMore, setShowMore] = useState(false)

  useEffect(() => {
    if (modal.kind === 'edit') {
      const l = modal.link
      setForm({
        url: l.url,
        title: l.title,
        categoryId: l.categoryId ?? '',
        description: l.description ?? '',
        tags: l.tags.join(', '),
        note: l.note ?? '',
        favorite: l.favorite,
        openMode: l.openMode,
      })
      setShowMore(Boolean(l.description || l.note || l.tags.length))
    } else if (modal.kind === 'add') {
      setForm({ ...EMPTY, url: modal.prefillUrl ?? '', openMode: defaultOpenMode })
      setShowMore(false)
    }
  }, [modal, defaultOpenMode])

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // URL-first: เมื่อกรอก URL แล้วยังไม่มีชื่อ ให้เดาชื่อจาก domain
  const onUrlBlur = () => {
    if (form.url && !form.title.trim()) {
      const guessed = titleFromUrl(form.url)
      if (guessed) set('title', guessed)
    }
  }

  const canSave = form.url.trim() && isProbablyUrl(form.url)

  const submit = async () => {
    if (!canSave) {
      toast('กรุณากรอก URL ที่ถูกต้อง', 'error')
      return
    }
    const tags = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const payload = {
      url: form.url.trim(),
      title: form.title.trim() || titleFromUrl(form.url) || form.url.trim(),
      categoryId: form.categoryId || undefined,
      description: form.description.trim() || undefined,
      tags,
      note: form.note.trim() || undefined,
      favorite: form.favorite,
      openMode: form.openMode,
    }
    if (modal.kind === 'edit') await updateLink(modal.link.id, payload)
    else await addLink(payload)
    closeModal()
  }

  return (
    <>
      <Modal open={isOpen} onClose={closeModal} title={isEdit ? 'แก้ไขลิงก์' : 'เพิ่มลิงก์ใหม่'}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="space-y-3"
        >
          {/* URL — พระเอกของฟอร์ม */}
          <Field label="URL">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2 focus-within:border-accent">
              {form.url && isProbablyUrl(form.url) && (
                <Favicon url={form.url} title={form.title} size={24} />
              )}
              <input
                autoFocus={!isEdit}
                value={form.url}
                onChange={(e) => set('url', e.target.value)}
                onBlur={onUrlBlur}
                placeholder="วาง URL ที่นี่ เช่น chatgpt.com"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
              />
            </div>
          </Field>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="ชื่อเว็บ">
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="เว้นว่างเพื่อเดาจาก URL"
                className="input"
              />
            </Field>
            <Field label="หมวดหมู่">
              <select
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
                className="input cursor-pointer"
              >
                <option value="">— ไม่ระบุ —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-line bg-bg px-3 py-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.favorite}
                onChange={(e) => set('favorite', e.target.checked)}
                className="h-4 w-4 accent-[color:var(--accent)]"
              />
              ปักหมุดใน Quick Access (รายการโปรด)
            </label>
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className="text-xs text-accent hover:underline"
            >
              {showMore ? 'ซ่อนตัวเลือก' : 'ตัวเลือกเพิ่มเติม'}
            </button>
          </div>

          {showMore && (
            <div className="space-y-3 border-t border-line pt-3">
              <Field label="คำอธิบายสั้น">
                <input
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="ใช้ทำอะไร…"
                  className="input"
                />
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Tags (คั่นด้วย ,)">
                  <input
                    value={form.tags}
                    onChange={(e) => set('tags', e.target.value)}
                    placeholder="AI, ใช้ทุกวัน"
                    className="input"
                  />
                </Field>
                <Field label="เปิดลิงก์">
                  <select
                    value={form.openMode}
                    onChange={(e) => set('openMode', e.target.value as OpenMode)}
                    className="input cursor-pointer"
                  >
                    <option value="new_tab">แท็บใหม่</option>
                    <option value="same_tab">หน้าเดิม</option>
                  </select>
                </Field>
              </div>
              <Field label="โน้ตส่วนตัว">
                <textarea
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  rows={2}
                  placeholder="บันทึกเพิ่มเติม…"
                  className="input resize-none"
                />
              </Field>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            {modal.kind === 'edit' ? (
              <button
                type="button"
                onClick={() => {
                  if (confirmDelete) setConfirming(true)
                  else if (modal.kind === 'edit') {
                    deleteLink(modal.link.id)
                    closeModal()
                  }
                }}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={15} /> ลบ
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-elevated"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-[color:var(--accent-fg)] transition hover:opacity-90 disabled:opacity-40"
              >
                {isEdit ? 'บันทึก' : 'เพิ่มลิงก์'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {modal.kind === 'edit' && (
        <ConfirmDialog
          open={confirming}
          title="ลบลิงก์นี้?"
          message={`"${modal.link.title}" จะถูกลบออกจาก Hub`}
          confirmLabel="ลบ"
          danger
          onConfirm={() => {
            deleteLink(modal.link.id)
            setConfirming(false)
            closeModal()
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  )
}
