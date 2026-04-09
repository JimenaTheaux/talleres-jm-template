import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'

interface Props {
  src?: string | null
  alt?: string
  iconSize?: number
  className?: string
}

/**
 * Muestra la foto de un producto. Si la URL falla (ej: bucket privado,
 * recurso eliminado) cae al ícono ShoppingBag silenciosamente.
 */
export default function ProductoThumb({ src, alt = '', iconSize = 14, className = 'w-full h-full object-cover' }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <ShoppingBag size={iconSize} className="text-text-muted" />
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
