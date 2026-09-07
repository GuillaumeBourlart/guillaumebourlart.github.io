'use client'

import { motion } from 'framer-motion'
import { GraduationCap, School, Award, Briefcase } from 'lucide-react'

interface TimelineItem {
  id: string
  icon: typeof GraduationCap
  title: string
  subtitle: string
  description: string
  period: string
  color: string
}

const timelineItems: TimelineItem[] = [
  {
    id: '1',
    icon: GraduationCap,
    title: 'BTS SIO',
    subtitle: 'École IRIS',
    description: 'Services Informatique aux Organisations',
    period: '2018 - 2020',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '2',
    icon: School,
    title: 'Bachelor',
    subtitle: 'École IRIS',
    description: 'Développeur de solutions digitales',
    period: '2021',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '3',
    icon: Award,
    title: 'Formation dev iOS',
    subtitle: 'OpenClassrooms',
    description: 'Diplôme équivalent bac+3, reconnu par l\'État',
    period: '2021 - 2022',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: '4',
    icon: Briefcase,
    title: 'Développeur iOS',
    subtitle: 'Auto-entrepreneur',
    description: 'Applications iOS principalement, sites web occasionnellement selon le contexte',
    period: 'Depuis 2023',
    color: 'from-green-500 to-emerald-500',
  },
]

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 px-4 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Le parcours derrière le studio
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Mobiverse Games est porté par un développeur indépendant formé au web
            et à iOS. Un parcours au service de projets pensés avec soin, de l'idée
            à leur réalisation.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Ligne verticale de la timeline */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-green-500 transform md:-translate-x-1/2" />

          {/* Items de la timeline */}
          <div className="space-y-12">
            {timelineItems.map((item, index) => {
              const isEven = index % 2 === 0

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Cercle avec date sur la ligne */}
                  <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} p-1 shadow-lg`}
                    >
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                        <span className="text-white text-xs font-bold text-center leading-tight px-1">
                          {item.period}
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Contenu */}
                  <div
                    className={`w-full md:w-5/12 ml-24 md:ml-0 ${
                      isEven ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      className={`bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg`}
                    >
                      <div className="flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-300 text-sm font-medium mb-2">
                          {item.subtitle}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
