// Helper สำหรับจัดการ URL / domain

export function normalizeUrl(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  // เติม https:// ให้อัตโนมัติถ้าดูเหมือน domain
  if (/^[\w-]+(\.[\w-]+)+/.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

export function getDomain(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

// ตัด URL ให้สั้นอ่านง่ายบนการ์ด เช่น "github.com/user/repo"
export function shortUrl(url: string): string {
  try {
    const u = new URL(normalizeUrl(url))
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
    return (u.hostname.replace(/^www\./, '') + path).slice(0, 42)
  } catch {
    return url
  }
}

export function isProbablyUrl(input: string): boolean {
  const t = input.trim()
  if (/\s/.test(t)) return false
  return /^https?:\/\//i.test(t) || /^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(t)
}

// เดาชื่อเว็บจาก domain เช่น "github.com" -> "Github"
export function titleFromUrl(url: string): string {
  const domain = getDomain(url)
  if (!domain) return ''
  const main = domain.split('.').slice(-2, -1)[0] ?? domain
  return main.charAt(0).toUpperCase() + main.slice(1)
}
