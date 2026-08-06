'use client'

import { useEffect, useState } from 'react'

export default function InAppBrowserBanner() {
  const [isInApp, setIsInApp] = useState(false)

  useEffect(() => {
    const ua = navigator.userAgent || ''
    setIsInApp(/FBAN|FBAV|Instagram|Line|MicroMessenger/i.test(ua))
  }, [])

  if (!isInApp) return null

  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : ''

  return (
    <div className="w-full bg-amber-100 text-amber-900 text-sm px-4 py-3 text-center">
      لو واجهت مشكلة في تسجيل الدخول، افتح الرابط في المتصفح الأساسي:
      دوس على{' '}
      <span className="font-semibold">⋯</span> فوق وبعدها{' '}
      <span className="font-semibold">Open in Browser</span>.
      {currentUrl && (
        <div className="mt-1 break-all text-xs opacity-80">{currentUrl}</div>
      )}
    </div>
  )
}
