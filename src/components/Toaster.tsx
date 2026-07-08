import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'

const ICON = {
  success: <CheckCircle2 size={18} className="text-green-500" />,
  error: <XCircle size={18} className="text-red-500" />,
  info: <Info size={18} className="text-accent" />,
}

export function Toaster() {
  const toasts = useHubStore((s) => s.toasts)
  const dismiss = useHubStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className="pointer-events-auto flex animate-scale-in items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 text-sm shadow-pop"
        >
          {ICON[t.kind]}
          {t.message}
        </button>
      ))}
    </div>
  )
}
