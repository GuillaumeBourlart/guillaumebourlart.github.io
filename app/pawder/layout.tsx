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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
