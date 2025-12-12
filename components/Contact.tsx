'use client'

import { motion } from 'framer-motion'
import { Mail, Linkedin, Github, Twitter } from 'lucide-react'

export default function Contact() {
  const socialLinks = [
    {
      icon: Mail,
      label: 'Email',
      href: 'mailto:contact@email.com',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Github,
      label: 'GitHub',
      href: 'https://github.com/guillaumebourlart',
      color: 'from-gray-700 to-gray-800',
    },
  ]

  return (
    <section
      id="contact"
      className="py-20 px-4 bg-gradient-to-b from-slate-900 to-black"
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Restons en contact
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-12">
            N'hésitez pas à me contacter pour discuter de projets ou de
            collaborations
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative bg-gradient-to-r ${social.color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
              >
                <social.icon className="w-8 h-8 text-white mb-2" />
                <p className="text-white font-semibold">{social.label}</p>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-slate-800"
        >
          <p className="text-gray-500">
            © {new Date().getFullYear()} Guillaume Bourlart. Tous droits
            réservés.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

