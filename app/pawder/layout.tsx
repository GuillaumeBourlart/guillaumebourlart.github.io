import { ReactNode } from 'react'

export const metadata = {
  title: 'Pawder - Documents légaux',
  description: 'Documents légaux de l\'application Pawder',
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
