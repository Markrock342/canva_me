type Props = {
  className?: string
}

/** โลโก้จาก `public/canvame-logo.png` */
export function BrandLogo({ className = '' }: Props) {
  return (
    <img
      src="/canvame-logo.png"
      alt="Canvame"
      className={['studio-brand__logo', className].filter(Boolean).join(' ')}
      decoding="async"
    />
  )
}
