import { Modal } from './Modal'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  danger = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Modal open={open} onClose={onCancel} maxWidth="max-w-sm">
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="mb-5 text-sm text-muted">{message}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2 text-sm font-medium hover:bg-elevated"
        >
          ยกเลิก
        </button>
        <button
          onClick={onConfirm}
          className={`rounded-xl px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 ${
            danger ? 'bg-red-500' : 'bg-accent'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
