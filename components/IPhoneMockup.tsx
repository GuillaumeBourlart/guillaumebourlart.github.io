'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface IPhoneMockupProps {
  screenshots: string[]
  alt: string
  className?: string
}

export default function IPhoneMockup({
  screenshots,
  alt,
  className = '',
}: IPhoneMockupProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasMultipleScreenshots = screenshots && screenshots.length > 1

  // Auto-play toutes les 5 secondes
  useEffect(() => {
    if (!hasMultipleScreenshots) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [hasMultipleScreenshots, screenshots.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length)
  }

  const currentScreenshot = screenshots[currentIndex] || screenshots[0]

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      transition={{ duration: 0.3 }}
      style={{ perspective: '1000px' }}
    >
      {/* iPhone Frame */}
      <div className="relative mx-auto">
        {/* Phone Body */}
        <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
          {/* Screen Bezel */}
          <div className="bg-black rounded-[2.5rem] p-1">
            {/* Screen */}
            <div className="relative bg-black rounded-[2.3rem] overflow-hidden aspect-[9/19.5]">
              {/* Screenshot avec transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {currentScreenshot ? (
                    <Image
                      src={currentScreenshot}
                      alt={`${alt} - ${currentIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-sm">Screenshot</span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Side Buttons */}
          <div className="absolute left-0 top-16 w-1 h-12 bg-gray-700 rounded-r-sm" />
          <div className="absolute left-0 top-32 w-1 h-6 bg-gray-700 rounded-r-sm" />
          <div className="absolute right-0 top-20 w-1 h-16 bg-gray-700 rounded-l-sm" />
        </div>
        
        {/* Navigation Arrows */}
        {hasMultipleScreenshots && (
          <>
            {/* Flèche gauche */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-20 bg-slate-800/90 hover:bg-slate-700 rounded-full p-2 shadow-lg transition-all group"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>

            {/* Flèche droite */}
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-20 bg-slate-800/90 hover:bg-slate-700 rounded-full p-2 shadow-lg transition-all group"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}
        
        {/* Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-[3rem] pointer-events-none" />
      </div>
    </motion.div>
  )
}

