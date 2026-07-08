import { Sparkles, Plus, Package } from 'lucide-react'
import { useHubStore } from '../store/useHubStore'

// หน้าจอเริ่มต้น — ให้ผู้ใช้เลือกวิธีเริ่มต้น (starter pack หรือเริ่มเปล่า)
export function Onboarding() {
  const seedStarter = useHubStore((s) => s.seedStarter)
  const openAdd = useHubStore((s) => s.openAdd)
  const updateSettings = useHubStore((s) => s.updateSettings)

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-[color:var(--accent-fg)] shadow-soft">
        <Sparkles size={30} />
      </div>
      <h1 className="text-2xl font-bold">ยินดีต้อนรับสู่ Kiw HQ</h1>
      <p className="mx-auto mt-2 max-w-md text-muted">
        รวมเว็บและลิงก์ที่ใช้ประจำไว้ในที่เดียว — เก็บในเครื่องคุณเอง ไม่ต้องล็อกอิน ไม่มีเซิร์ฟเวอร์
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => seedStarter()}
          className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-pop"
        >
          <Package size={22} className="text-accent" />
          <span className="font-semibold">เริ่มด้วยชุดยอดนิยม</span>
          <span className="text-sm text-muted">
            เพิ่ม Google, ChatGPT, YouTube, Gmail และอีก 12 เว็บให้ทันที
          </span>
        </button>
        <button
          onClick={() => {
            updateSettings({ onboarded: true })
            openAdd()
          }}
          className="flex flex-col items-start gap-2 rounded-2xl border border-line bg-card p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:border-accent hover:shadow-pop"
        >
          <Plus size={22} className="text-accent" />
          <span className="font-semibold">เริ่มจากศูนย์</span>
          <span className="text-sm text-muted">เพิ่มลิงก์ของคุณเองทีละอัน แล้วจัดหมวดตามใจ</span>
        </button>
      </div>

      <button
        onClick={() => updateSettings({ onboarded: true })}
        className="mt-6 text-sm text-muted hover:text-fg hover:underline"
      >
        ข้ามไปก่อน
      </button>
    </div>
  )
}
