# Personal Web Hub 🔗

**เว็บรวมลิงก์ส่วนตัวไว้ในที่เดียว** — local-first personal start page

หน้าแรกส่วนตัวสำหรับรวมเว็บ/ลิงก์/เครื่องมือที่ใช้ประจำ ค้นหาเร็ว แยกหมวดหมู่ ปรับแต่งได้
ข้อมูลทั้งหมดเก็บในเครื่องผู้ใช้ (IndexedDB) — **ไม่มีเซิร์ฟเวอร์ ไม่มีล็อกอิน ไม่เก็บรหัสผ่านหรือ token**

## ฟีเจอร์หลัก (MVP)

- ⌘/Ctrl-K **Command Palette** — ค้นลิงก์ เปิดเว็บ เพิ่มลิงก์ สลับธีม ค้นเว็บ ในกล่องเดียว
- ➕ **Quick-add แบบ URL-first** — วาง URL แล้วระบบเดาชื่อ + favicon ให้อัตโนมัติ
- 🗂️ หมวดหมู่ปรับแต่งเองได้ (เพิ่ม/เปลี่ยนชื่อ/ไอคอน/ซ่อน/เรียงลำดับ)
- ⭐ Favorite → แสดงใน Quick Access ด้านบน
- 🕐 เปิดล่าสุด + ใช้บ่อยสุด (สถิติเก็บในเครื่องเท่านั้น ปิดได้)
- 🌗 ธีม Light / Dark / System + เปลี่ยนสีหลัก ขนาดการ์ด ขนาดฟอนต์ ความมนขอบ
- 📤 Export / Import JSON — สำรองและย้ายข้อมูลเองได้ทุกเมื่อ
- 🔒 Privacy toggle — ปิดการโหลด favicon จากภายนอกได้ (ใช้ไอคอนตัวอักษรแทน)
- 📱 Responsive รองรับมือถือ

## Tech Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS · Zustand · Dexie (IndexedDB) · Fuse.js · lucide-react

## Development

```bash
npm install
npm run dev        # เปิด http://localhost:5173
npm run typecheck  # ตรวจ TypeScript
npm run build      # build ลง dist/
```

## Deploy

โปรเจกต์นี้เป็น static site — build แล้ว deploy `dist/` ได้ทุกที่ (Vercel auto-detect Vite ได้เลย)

> 💡 ข้อมูลผูกกับ domain ของเบราว์เซอร์ — ถ้าย้ายจาก localhost ไป production ให้ใช้ **ตั้งค่า › ข้อมูล › Export/Import JSON**

## Roadmap (Phase 2+)

PWA + offline · frecency smart sort + กด 1–9 · import `bookmarks.html` · auto-title ผ่าน serverless proxy · bookmarklet/Share Target · Spaces · drag & drop · link health check · Notes · widget strip
