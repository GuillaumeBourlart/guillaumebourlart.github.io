'use client'

import { motion } from 'framer-motion'
import { Code, Smartphone, Zap, Heart } from 'lucide-react'

export default function About() {
  const skills = [
    {
      icon: Code,
      title: 'Swift & SwiftUI',
      description: 'Développement moderne avec les dernières technologies Apple',
    },
    {
      icon: Smartphone,
      title: 'Design UI/UX',
      description: 'Création d\'interfaces intuitives et élégantes',
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Optimisation pour des apps rapides et fluides',
    },
    {
      icon: Heart,
      title: 'Passion',
      description: 'Développement avec attention aux détails',
    },
  ]

  return (
    <section
      id="about"
      className="py-20 px-4 bg-gradient-to-b from-slate-900 to-slate-800"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              À propos
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Passionné par le développement iOS, je crée des applications qui
            allient esthétique et fonctionnalité
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <skill.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {skill.title}
              </h3>
              <p className="text-gray-400">{skill.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

