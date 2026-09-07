import { ReactNode } from 'react'

export const metadata = {
  title: 'Pawder — Assistance et documents légaux',
  description: 'Assistance et documents légaux de Pawder, une application de Mobiverse Games.',
}

export default function PawderLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <>
      {children}
    </>
  )
}
