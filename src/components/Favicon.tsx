import { useState } from 'react'
import { faviconUrl, monogramColor, monogramLetter } from '../lib/favicon'
import { useHubStore } from '../store/useHubStore'

interface Props {
  url: string
  title: string
  iconUrl?: string
  size?: number
  className?: string
}

// แสดง favicon; ถ้า remoteFavicons ปิด หรือโหลดรูปไม่ได้ -> ใช้ monogram (ตัวอักษร)
export function Favicon({ url, title, iconUrl, size = 40, className = '' }: Props) {
  const remote = useHubStore((s) => s.settings.remoteFavicons)
  const [failed, setFailed] = useState(false)

  const src = iconUrl || (remote ? faviconUrl(url, 64) : '')
  const showImg = src && !failed

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-xl shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: showImg ? 'var(--elevated)' : monogramColor(title || url),
      }}
    >
      {showImg ? (
        <img
          src={src}
          alt=""
          width={size * 0.6}
          height={size * 0.6}
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-contain"
        />
      ) : (
        <span className="font-semibold text-white" style={{ fontSize: size * 0.42 }}>
          {monogramLetter(title, url)}
        </span>
      )}
    </div>
  )
}
