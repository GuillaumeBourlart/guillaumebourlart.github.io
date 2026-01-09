'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Star } from 'lucide-react'
import { App } from '@/data/apps'
import Image from 'next/image'
import IPhoneMockup from './IPhoneMockup'

interface AppCardProps {
  app: App
  index: number
}

export default function AppCard({ app, index }: AppCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group relative"
    >
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-3xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all overflow-hidden h-full flex flex-col">
        {/* Featured badge */}
        {app.featured && (
          <div className="absolute top-4 right-4 z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <Star className="w-3 h-3 fill-current" />
              Featured
            </motion.div>
          </div>
        )}

        {/* iPhone Mockup */}
        <div className="mb-6 flex justify-center">
          {app.screenshots && app.screenshots.length > 0 ? (
            // Mockup iPhone avec toutes les captures d'écran
            <div className="w-48 h-auto">
              <IPhoneMockup
                screenshots={app.screenshots}
                alt={`${app.name} - Capture d'écran`}
              />
            </div>
          ) : (
            // Fallback : afficher seulement l'icône de l'app
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-1 shadow-lg"
            >
              {app.iconUrl ? (
                <Image
                  src={app.iconUrl}
                  alt={app.name}
                  fill
                  className="rounded-xl object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold">
                  {app.name.charAt(0)}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* App Info */}
        <div className="flex-1">
          <div className="mb-2">
            <span className="text-xs text-blue-400 font-semibold">
              {app.category}
            </span>
          </div>
          {/* Titre avec icône à gauche */}
          <div className="flex items-center gap-3 mb-3">
            {app.iconUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-0.5 shadow-md flex-shrink-0"
              >
                <Image
                  src={app.iconUrl}
                  alt={`${app.name} icon`}
                  fill
                  className="rounded-lg object-cover"
                />
              </motion.div>
            )}
            <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
              {app.name}
            </h3>
          </div>
          <p className="text-gray-400 mb-6 line-clamp-3">
            {app.description}
          </p>
        </div>

        {/* App Store Button */}
        <motion.a
          href={app.appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all group/button"
        >
          Voir sur l'App Store
          <ExternalLink className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
        </motion.a>

        {/* Hover effect glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
      </div>
    </motion.div>
  )
}

