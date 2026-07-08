// สร้าง id แบบสั้น ไม่พึ่ง crypto ที่อาจไม่มีในบางบริบท
export function uid(prefix = 'lnk'): string {
  const rnd = Math.random().toString(36).slice(2, 8)
  const t = Date.now().toString(36).slice(-5)
  return `${prefix}_${t}${rnd}`
}
