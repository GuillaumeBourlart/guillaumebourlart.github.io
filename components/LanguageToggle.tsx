'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'

interface LanguageToggleProps {
  onLanguageChange: (language: 'fr' | 'en') => void
}

export default function LanguageToggle({ onLanguageChange }: LanguageToggleProps) {
  const [currentLang, setCurrentLang] = useState<'fr' | 'en'>('fr')

  const handleLanguageChange = (language: 'fr' | 'en') => {
    setCurrentLang(language)
    onLanguageChange(language)
  }

  return (
    <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-200">
      <Globe className="w-4 h-4 text-gray-600 ml-2" />
      <button
        onClick={() => handleLanguageChange('fr')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLang === 'fr'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        FR
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          currentLang === 'en'
            ? 'bg-purple-100 text-purple-700'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
    </div>
  )
}
