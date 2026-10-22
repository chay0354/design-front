import type { ReactNode } from 'react'

export function Sparkle({ className = 'h-3 w-3 text-[#A88A72]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true">
      <path
        fill="currentColor"
        d="M8 0.8c.35 3.4 1.4 5.6 7.2 7.2-5.8 1.6-6.85 3.8-7.2 7.2-.35-3.4-1.4-5.6-7.2-7.2C6.6 6.4 7.65 4.2 8 0.8z"
      />
    </svg>
  )
}

export function BrushMark({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block px-2 ${className}`}>
      <img
        src="/assets/title-brush.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 h-[135%] w-[118%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none"
      />
      <span className="relative">{children}</span>
    </span>
  )
}

export function BrushTitle({
  children,
  as: Tag = 'h2',
  sparkles = true,
  className = 'text-2xl sm:text-[1.7rem]',
}: {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  sparkles?: boolean
  className?: string
}) {
  return (
    <Tag className={`flex items-center justify-center gap-4 text-center font-light text-[#3C3834] ${className}`}>
      {sparkles && <Sparkle />}
      <BrushMark>{children}</BrushMark>
      {sparkles && <Sparkle />}
    </Tag>
  )
}
