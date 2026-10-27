import Image from 'next/image'
import IPhoneMockup from './IPhoneMockup'

interface ScreenshotFrameProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  landscape?: boolean
}

/** A portrait screenshot goes in the iPhone frame; a landscape one (a game played sideways) in a rounded screen. */
export default function ScreenshotFrame({ landscape = false, ...props }: ScreenshotFrameProps) {
  if (!landscape) return <IPhoneMockup {...props} />
  return (
    <div className="landscape-shot">
      <Image src={props.src} alt={props.alt} fill sizes={props.sizes} priority={props.priority} className="landscape-shot-image" />
    </div>
  )
}
