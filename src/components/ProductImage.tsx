import { useState } from 'react'
import { productImagePreviewSrc } from '../utils/productImage'

const PLACEHOLDER = '/assets/packages/item-decor.svg'

interface ProductImageProps {
  src: string
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(
    src && src !== PLACEHOLDER ? productImagePreviewSrc(src) : PLACEHOLDER,
  )

  return (
    <img
      src={imageSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setImageSrc(PLACEHOLDER)}
      className={className}
    />
  )
}
