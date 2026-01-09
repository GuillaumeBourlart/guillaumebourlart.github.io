'use client'

import { motion } from 'framer-motion'
import { Smartphone, Sparkles } from 'lucide-react'
import { apps } from '@/data/apps'
import AppCard from './AppCard'

export default function AppsSection() {
  const featuredApps = apps.filter((app) => app.featured)
  const otherApps = apps.filter((app) => !app.featured)

  return (
    <section
      id="apps"
      className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Smartphone className="w-12 h-12 text-blue-400 mx-auto" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Mes Applications
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Découvrez les applications iOS que j'ai créées, chacune avec son
            propre style et ses fonctionnalités uniques
          </p>
        </motion.div>

        {/* Featured Apps */}
        {featuredApps.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-2 mb-8"
            >
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="text-2xl font-semibold text-white">
                Applications en vedette
              </h3>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredApps.map((app, index) => (
                <AppCard key={app.id} app={app} index={index} />
              ))}
            </div>
          </div>
        )}

        {/* Other Apps */}
        {otherApps.length > 0 && (
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-semibold text-white mb-8"
            >
              Autres Applications
            </motion.h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherApps.map((app, index) => (
                <AppCard
                  key={app.id}
                  app={app}
                  index={featuredApps.length + index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {apps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Smartphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              Ajoutez vos applications dans le fichier{' '}
              <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">
                data/apps.ts
              </code>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

