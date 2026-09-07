import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Estimer votre projet',
  description: 'Estimez le budget et le délai de votre application iOS ou de votre site web avec Mobiverse Games.',
}

export default function EstimationLayout({ children }: { children: ReactNode }) {
  return children
}
