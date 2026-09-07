import Image from 'next/image'

interface IPhoneMockupProps {
  src: string
  alt: string
  sizes: string
  priority?: boolean
}

/** The original transparent iPhone frame sits above the complete app screenshot. */
export default function IPhoneMockup({ src, alt, sizes, priority = false }: IPhoneMockupProps) {
  return (
    <div className="iphone-mockup">
      <div className="iphone-display">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="iphone-screenshot" />
      </div>
      <Image
        src="/mockup_iphone.png"
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        priority={priority}
        className="iphone-frame"
      />
    </div>
  )
}
