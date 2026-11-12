import { useState, type ImgHTMLAttributes } from 'react'

// Image with a soft gray placeholder that fades in once loaded — no empty white boxes while loading.
export function FadeImg({ className = '', onLoad, ...rest }: ImgHTMLAttributes<HTMLImageElement>) {
  const [ok, setOk] = useState(false)
  return (
    <img
      {...rest}
      ref={(el) => { if (el?.complete && el.naturalWidth && !ok) setOk(true) }}
      onLoad={(e) => { setOk(true); onLoad?.(e) }}
      className={`bg-[#EEF0F3] transition-opacity duration-500 ease-out ${ok ? '' : 'opacity-0'} ${className}`}
    />
  )
}
