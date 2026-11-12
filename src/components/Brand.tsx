import { useState } from 'react'
import { brand } from '../config/brand'

/** Logo tipográfica INTEGRA + assinatura Rosa Neves. Funciona sem imagem. */
export function Wordmark({ size = 'md', signature = true }: { size?: 'sm' | 'md' | 'lg'; signature?: boolean }) {
  const big = size === 'lg'
  return (
    <span className="inline-flex flex-col leading-none">
      <span className="sr-only">{`${brand.appName}, por ${brand.signature}`}</span>
      <span className={`font-display font-bold whitespace-nowrap text-ink ${big ? 'text-4xl tracking-[0.14em]' : size === 'sm' ? 'text-[1.05rem] tracking-[0.12em]' : 'text-2xl tracking-[0.16em]'}`} aria-hidden>
        INTEGRA<span className="font-semibold tracking-normal text-rose-600"> | </span>
        <span className="font-semibold tracking-[0.04em]">Ansiedade</span>
      </span>
      {signature && <span className={`mt-1 font-sans font-medium tracking-[0.22em] text-muted uppercase ${big ? 'text-xs' : 'text-[0.62rem]'}`} aria-hidden>
        por {brand.signature}
      </span>}
    </span>
  )
}

/** Monograma RN oficial (se o arquivo existir); senão, iniciais desenhadas. */
export function Monogram({ className = 'h-10' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed)
    return (
      <span className={`grid aspect-square place-items-center rounded-full border border-ink/20 font-display font-bold text-ink ${className}`} aria-hidden>
        RN
      </span>
    )
  return <img src={brand.symbolUrl} alt="" aria-hidden className={`${className} w-auto`} onError={() => setFailed(true)} />
}

export function FullLogo({ className = 'h-28' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <p className="font-display text-3xl font-semibold tracking-[0.2em]">ROSA NEVES</p>
  return <img src={brand.logoUrl} alt="Monograma RN, Rosa Neves" className={`${className} w-auto`} onError={() => setFailed(true)} />
}

/** Foto da Rosa somente quando aprovada; caso contrário, monograma. Nunca usa imagem de terceiros. */
export function RosaPortrait({ className = '' }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!brand.photoApproved || failed) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-azul-50 via-paper to-rose-50 ${className}`}>
        <FullLogo className="h-24" />
      </div>
    )
  }
  return <img src={brand.photoUrl} alt={brand.photoAlt} className={`object-cover ${className}`} onError={() => setFailed(true)} />
}
