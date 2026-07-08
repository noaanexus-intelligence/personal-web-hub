import type { Category, Link, Space } from './types'

export const DEFAULT_SPACE: Space = { id: 'default', name: 'ส่วนตัว', icon: '🏠', order: 0 }

// หมวดหมู่เริ่มต้น (ผู้ใช้แก้ไข/เพิ่ม/ลบได้เอง)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ai', name: 'AI', icon: '✨', order: 0, hidden: false, spaceId: 'default' },
  { id: 'social', name: 'Social', icon: '💬', order: 1, hidden: false, spaceId: 'default' },
  { id: 'video', name: 'Video / Music', icon: '🎬', order: 2, hidden: false, spaceId: 'default' },
  { id: 'work', name: 'Work / Office', icon: '💼', order: 3, hidden: false, spaceId: 'default' },
  { id: 'finance', name: 'Finance', icon: '📈', order: 4, hidden: false, spaceId: 'default' },
  { id: 'shopping', name: 'Shopping', icon: '🛒', order: 5, hidden: false, spaceId: 'default' },
  { id: 'learning', name: 'Learning', icon: '📚', order: 6, hidden: false, spaceId: 'default' },
  { id: 'dev', name: 'Developer', icon: '⚡', order: 7, hidden: false, spaceId: 'default' },
  { id: 'readlater', name: 'Read Later', icon: '🔖', order: 8, hidden: false, spaceId: 'default' },
]

const now = '2026-07-08T00:00:00.000Z'

function mk(
  id: string,
  title: string,
  url: string,
  categoryId: string,
  description: string,
  favorite = false,
  tags: string[] = [],
): Link {
  return {
    id,
    title,
    url,
    description,
    categoryId,
    tags,
    favorite,
    order: 0,
    openMode: 'new_tab',
    createdAt: now,
    lastOpenedAt: null,
    openCount: 0,
    spaceId: 'default',
  }
}

// Starter pack — ผู้ใช้เลือก "เริ่มด้วยชุดนี้" ตอน onboarding
export const STARTER_LINKS: Link[] = [
  mk('s_google', 'Google', 'https://google.com', 'work', 'ค้นหาทุกอย่างบนอินเทอร์เน็ต', true, ['ค้นหา']),
  mk('s_chatgpt', 'ChatGPT', 'https://chatgpt.com', 'ai', 'ผู้ช่วย AI สำหรับคิด เขียน วิเคราะห์ วางแผน', true, ['AI', 'ใช้ทุกวัน']),
  mk('s_claude', 'Claude', 'https://claude.ai', 'ai', 'ผู้ช่วย AI จาก Anthropic', true, ['AI']),
  mk('s_youtube', 'YouTube', 'https://youtube.com', 'video', 'วิดีโอและเพลย์ลิสต์ที่ชื่นชอบ', true, ['วิดีโอ']),
  mk('s_gmail', 'Gmail', 'https://mail.google.com', 'work', 'อีเมลสำหรับงานและส่วนตัว', true, ['อีเมล']),
  mk('s_github', 'GitHub', 'https://github.com', 'dev', 'ที่เก็บโค้ดและโปรเจกต์ของฉัน', false, ['code']),
  mk('s_notion', 'Notion', 'https://notion.so', 'work', 'จดโน้ตและจัดการงานต่าง ๆ', false, ['notes']),
  mk('s_maps', 'Google Maps', 'https://maps.google.com', 'work', 'แผนที่และเส้นทาง', false),
  mk('s_fb', 'Facebook', 'https://facebook.com', 'social', 'โซเชียลเน็ตเวิร์ก', false, ['social']),
  mk('s_figma', 'Figma', 'https://figma.com', 'dev', 'ออกแบบ UI/UX และต้นแบบ', false, ['design']),
  mk('s_drive', 'Google Drive', 'https://drive.google.com', 'work', 'ไฟล์และเอกสารบนคลาวด์', false),
  mk('s_spotify', 'Spotify', 'https://open.spotify.com', 'video', 'ฟังเพลงและพอดแคสต์', false, ['เพลง']),
]
