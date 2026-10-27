'use client'

import { useState } from 'react'
import ScreenshotFrame from './ScreenshotFrame'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function AppGallery({ screenshots, name, landscape = false }: { screenshots: string[]; name: string; landscape?: boolean }) {
  const [current, setCurrent] = useState(0)
  const move = (step: number) => setCurrent(index => (index + step + screenshots.length) % screenshots.length)
  return (
    <div className="app-gallery" role="region" aria-label={`Captures de ${name}`} aria-roledescription="carrousel" onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault()
        move(event.key === 'ArrowLeft' ? -1 : 1)
      }
    }}>
      <div className={landscape ? 'app-screen app-screen-landscape' : 'app-screen'}><ScreenshotFrame landscape={landscape} src={screenshots[current]} sizes={landscape ? '(max-width: 560px) 90vw, 420px' : '(max-width: 560px) 210px, 200px'} alt={`${name} — capture ${current + 1} sur ${screenshots.length}`} /></div>
      {screenshots.length > 1 && <div className="gallery-controls">
        <button onClick={() => move(-1)} aria-label={`Capture précédente de ${name}`}><ArrowLeft size={18} aria-hidden="true" /></button>
        <span aria-live="polite" aria-atomic="true">{String(current + 1).padStart(2, '0')} <span aria-hidden="true">/</span><span className="sr-only">sur</span> {String(screenshots.length).padStart(2, '0')}</span>
        <button onClick={() => move(1)} aria-label={`Capture suivante de ${name}`}><ArrowRight size={18} aria-hidden="true" /></button>
      </div>}
    </div>
  )
}
