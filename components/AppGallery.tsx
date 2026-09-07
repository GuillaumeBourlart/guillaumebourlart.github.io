'use client'

import { useState } from 'react'
import IPhoneMockup from './IPhoneMockup'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function AppGallery({ screenshots, name }: { screenshots: string[]; name: string }) {
  const [current, setCurrent] = useState(0)
  const move = (step: number) => setCurrent(index => (index + step + screenshots.length) % screenshots.length)
  return (
    <div className="app-gallery" role="region" aria-label={`Captures de ${name}`} aria-roledescription="carrousel" onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowLeft' ? -1 : 1)
      }
    }}>
      <div className="app-screen"><IPhoneMockup src={screenshots[current]} sizes="(max-width: 560px) 210px, 200px" alt={`${name} — capture ${current + 1} sur ${screenshots.length}`} /></div>
      {screenshots.length > 1 && <div className="gallery-controls">
        <button onClick={() => move(-1)} aria-label={`Capture précédente de ${name}`}><ArrowLeft size={18} aria-hidden="true" /></button>
        <span aria-live="polite" aria-atomic="true">{String(current + 1).padStart(2, '0')} <span aria-hidden="true">/</span><span className="sr-only">sur</span> {String(screenshots.length).padStart(2, '0')}</span>
        <button onClick={() => move(1)} aria-label={`Capture suivante de ${name}`}><ArrowRight size={18} aria-hidden="true" /></button>
      </div>}
    </div>
  )
}
