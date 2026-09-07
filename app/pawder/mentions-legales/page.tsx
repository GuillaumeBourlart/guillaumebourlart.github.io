'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'

const mentionsContent = {
  fr: {
    title: "Mentions légales — Pawder",
    subtitle: "Mentions légales – Pawder",
    lastUpdate: "Dernière mise à jour : 10/12/2025",
    sections: [
      {
        title: "Introduction",
        content: [
          "Les présentes mentions légales s'appliquent à l'application mobile Pawder et, le cas échéant, à toute page web ou site associé au service Pawder (ci-après le « Service »).",
          "Portée internationale : le Service peut être accessible depuis plusieurs pays. Les présentes mentions légales s'appliquent, sous réserve des dispositions impératives éventuellement applicables dans votre pays de résidence.",
          "Langues : en cas de divergence entre versions, la version française prévaut."
        ]
      },
      {
        title: "1. Éditeur du Service",
        content: [
          "Le Service Pawder est édité par :",
          "Guillaume Paul Raoul BOURLART",
          "Entrepreneur individuel",
          "Immatriculé au RNE sous le numéro SIREN 883 345 522",
          "SIRET : 883 345 522 00022",
          "Code APE : 5829C – Édition de logiciels applicatifs",
          "Adresse : 1 Avenue Maurice, 92270 Bois-Colombes – France",
          "Email de contact (support & informations légales) : 📧 contact.gb.entreprise@gmail.com",
          "Directeur de la publication : Guillaume BOURLART"
        ]
      },
      {
        title: "2. Hébergement",
        content: [
          "L'Application et certaines ressources techniques (API, base de données, stockage de fichiers, etc.) sont hébergées par :",
          "Google Cloud Platform / Firebase (Google LLC)",
          "1600 Amphitheatre Parkway",
          "Mountain View, CA 94043",
          "États-Unis",
          "Des pages web associées au Service peuvent être hébergées via Firebase Hosting (par exemple sous un domaine *.web.app ou toute autre URL utilisée par l'Éditeur)."
        ]
      },
      {
        title: "3. Propriété intellectuelle",
        content: [
          "L'ensemble des éléments composant le Service Pawder, notamment (liste non exhaustive) : l'Application, le logo, la charte graphique, les textes, interfaces, fonctionnalités, icônes, images (hors contenus publiés par les utilisateurs), ainsi que le code source et les bases de données, est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.",
          "Sauf autorisation écrite préalable de l'Éditeur, toute reproduction, représentation, adaptation, modification, traduction, diffusion ou exploitation (commerciale ou non), intégrale ou partielle, de ces éléments est strictement interdite et est susceptible de constituer une contrefaçon.",
          "Les contenus publiés par les utilisateurs (photos, vidéos, textes, etc.) restent la propriété de leurs auteurs, sous réserve de la licence d'utilisation accordée à l'Éditeur pour le bon fonctionnement du Service, telle que décrite dans les Conditions Générales d'Utilisation."
        ]
      },
      {
        title: "4. Données personnelles",
        content: [
          "Dans le cadre de l'utilisation de l'Application, des données personnelles peuvent être collectées et traitées (compte utilisateur, animaux créés, votes, favoris, statistiques, données techniques, etc.).",
          "Les modalités de traitement (finalités, bases légales, destinataires, durées de conservation, transferts éventuels, droits des utilisateurs) sont détaillées dans la :",
          "➡ Politique de confidentialité de Pawder",
          "Cette politique est accessible depuis l'Application et/ou via un document en ligne mis à disposition par l'Éditeur.",
          "Pour toute demande relative aux données personnelles ou pour exercer vos droits, vous pouvez contacter l'Éditeur : 📧 contact.gb.entreprise@gmail.com"
        ]
      },
      {
        title: "5. Conditions d'utilisation",
        content: [
          "L'utilisation de l'Application Pawder est régie par les :",
          "➡ Conditions Générales d'Utilisation (CGU)",
          "Les CGU précisent notamment :",
          "• les règles d'accès et d'utilisation du Service ;",
          "• les conditions de création de compte ;",
          "• les règles relatives au contenu utilisateur et à la modération ;",
          "• les modalités de l'abonnement Premium et des achats In-App ;",
          "• les limitations de responsabilité de l'Éditeur.",
          "En installant et en utilisant l'Application, l'utilisateur reconnaît avoir pris connaissance des CGU et les accepter."
        ]
      },
      {
        title: "6. Responsabilité",
        content: [
          "L'Éditeur s'efforce de fournir un Service fiable et sécurisé, mais ne peut garantir l'absence totale d'erreurs, d'interruptions, de bugs ou de vulnérabilités.",
          "Dans les limites autorisées par la loi, l'Éditeur ne saurait être tenu responsable :",
          "• des dysfonctionnements, interruptions ou indisponibilités temporaires du Service ;",
          "• des dommages résultant de l'utilisation du Service ou de l'impossibilité de l'utiliser ;",
          "• des contenus publiés par les utilisateurs, dont ils assument seuls la responsabilité."
        ]
      },
      {
        title: "7. Droit applicable",
        content: [
          "Les présentes mentions légales sont soumises au droit français.",
          "En cas de litige relatif à leur interprétation ou à leur exécution, et à défaut de résolution amiable, les tribunaux français compétents seront saisis, sous réserve des règles de compétence impératives applicables aux consommateurs."
        ]
      },
      {
        title: "8. Contact",
        content: [
          "Pour toute question relative au Service, aux présentes mentions légales, aux CGU ou à la politique de confidentialité :",
          "Guillaume BOURLART",
          "📧 contact.gb.entreprise@gmail.com"
        ]
      }
    ],
    footer: "© 2025 Pawder. Tous droits réservés."
  },
  en: {
    title: "Legal Notice — Pawder",
    subtitle: "Pawder — Legal Notice",
    lastUpdate: "Last updated: 10/12/2025",
    sections: [
      {
        title: "Introduction",
        content: [
          "This Legal Notice applies to the Pawder mobile application and, where applicable, to any website or web pages associated with the Pawder service (the \"Service\").",
          "International scope: the Service may be accessible from multiple countries. This Legal Notice applies subject to any mandatory laws applicable in your country of residence.",
          "Languages: in case of discrepancies, the French version shall prevail."
        ]
      },
      {
        title: "1. Publisher",
        content: [
          "The Pawder Service is published by:",
          "Guillaume Paul Raoul BOURLART",
          "Sole proprietor (entrepreneur individuel)",
          "Registered in France under SIREN 883 345 522",
          "SIRET: 883 345 522 00022",
          "Business activity code (APE): 5829C – Application software publishing",
          "Registered address: 1 Avenue Maurice, 92270 Bois-Colombes – France",
          "Contact email (support & legal matters): 📧 contact.gb.entreprise@gmail.com",
          "Publication director: Guillaume BOURLART"
        ]
      },
      {
        title: "2. Hosting",
        content: [
          "The App and certain technical resources (API, database, file storage, etc.) are hosted by:",
          "Google Cloud Platform / Firebase (Google LLC)",
          "1600 Amphitheatre Parkway",
          "Mountain View, CA 94043",
          "United States",
          "Service-related web pages may be hosted using Firebase Hosting (for example under a *.web.app domain or any other URL used by the Publisher)."
        ]
      },
      {
        title: "3. Intellectual Property",
        content: [
          "All elements that make up the Pawder Service, including (non-exhaustive): the App, logo, visual identity, texts, interfaces, features, icons, images (excluding user-posted content), source code, and databases, are protected by French and international intellectual property laws.",
          "Unless you have prior written authorization from the Publisher, any reproduction, representation, adaptation, modification, translation, distribution, or exploitation (commercial or non-commercial), in whole or in part, is strictly prohibited and may constitute infringement.",
          "User-posted content (photos, videos, texts, etc.) remains the property of its authors, subject to the license granted to the Publisher to operate the Service, as described in the Terms of Use."
        ]
      },
      {
        title: "4. Personal Data",
        content: [
          "Personal data may be collected and processed when you use the App (user account, created pets, votes, favorites, statistics, technical data, etc.).",
          "Full details (purposes, legal bases, recipients, retention periods, potential international transfers, and user rights) are described in the:",
          "➡ Pawder Privacy Policy",
          "The Privacy Policy is available within the App and/or via an online document provided by the Publisher.",
          "For any privacy-related request or to exercise your rights, contact: 📧 contact.gb.entreprise@gmail.com"
        ]
      },
      {
        title: "5. Terms of Use",
        content: [
          "Use of the Pawder App is governed by the:",
          "➡ Pawder Terms of Use",
          "The Terms of Use describe, in particular:",
          "• access and use rules;",
          "• account creation;",
          "• user content and moderation rules;",
          "• Premium subscription and In-App Purchases;",
          "• limitations of Publisher's liability.",
          "By installing and using the App, you acknowledge that you have read and accepted the Terms of Use."
        ]
      },
      {
        title: "6. Liability",
        content: [
          "We strive to provide a reliable and secure Service, but we cannot guarantee that it will be free from errors, interruptions, bugs, or vulnerabilities.",
          "To the extent permitted by law, the Publisher shall not be liable for:",
          "• temporary malfunctions, interruptions, or unavailability of the Service;",
          "• damages resulting from use of the Service or inability to use it;",
          "• user-posted content, which remains the sole responsibility of users."
        ]
      },
      {
        title: "7. Governing Law",
        content: [
          "This Legal Notice is governed by French law.",
          "In case of a dispute regarding its interpretation or execution, and failing amicable resolution, the competent French courts shall have jurisdiction, subject to any mandatory consumer jurisdiction rules."
        ]
      },
      {
        title: "8. Contact",
        content: [
          "For any questions regarding the Service, this Legal Notice, the Terms of Use, or the Privacy Policy:",
          "Guillaume BOURLART",
          "📧 contact.gb.entreprise@gmail.com"
        ]
      }
    ],
    footer: "© 2025 Pawder. All rights reserved."
  }
}

function ContentSection({ title, content }: { title: string; content: string[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {content.map((paragraph, index) => (
          <p key={index} className="text-gray-300 leading-relaxed">
            {paragraph.startsWith('•') || paragraph.startsWith('➡') ? (
              <span className="inline-block ml-4">{paragraph}</span>
            ) : (
              paragraph
            )}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function MentionsLegalesPage() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const content = mentionsContent[language]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto py-20"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {language === 'fr' ? 'Mentions légales' : 'Legal Notice'}
              </h1>
              <p className="text-gray-300">
                {language === 'fr' ? 'Application Pawder' : 'Pawder Application'}
              </p>
            </div>
          </div>
          
          <LanguageToggle onLanguageChange={setLanguage} />
        </div>

        {/* Mobiverse Games link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          {language === 'fr' ? 'Découvrir Mobiverse Games' : 'Discover Mobiverse Games'}
        </Link>
      </div>

      {/* Last Update */}
      <div className="mb-6">
        <p className="text-gray-400 text-sm">{content.lastUpdate}</p>
      </div>

      {/* Content */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-xl p-8">
        <div className="space-y-8">
          {content.sections.map((section, index) => (
            <ContentSection 
              key={index} 
              title={section.title} 
              content={section.content} 
            />
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-gray-400 text-center">{content.footer}</p>
        </div>
      </div>
    </motion.div>
  )
}
