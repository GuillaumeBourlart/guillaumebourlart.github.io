'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'

const cguContent = {
  fr: {
    title: "Conditions Générales d'Utilisation — Pawder",
    subtitle: "Conditions Générales d'Utilisation de l'application Pawder",
    lastUpdate: "Dernière mise à jour : 10/12/2025",
    sections: [
      {
        title: "1. Objet de l'Application",
        content: [
          "Pawder est une application de divertissement permettant aux utilisateurs :",
          "• de créer des fiches pour leurs animaux (photos, courte description, informations de base) ;",
          "• de découvrir des animaux, voter et interagir ;",
          "• de consulter des classements (hebdomadaires, Hall of Fame, etc.) ;",
          "• de participer à une communauté centrée sur les animaux de compagnie.",
          "L'Application est destinée à un usage personnel et non commercial."
        ]
      },
      {
        title: "2. Conditions d'accès",
        content: [
          "L'Application est gratuite mais peut inclure des fonctionnalités payantes (abonnement Premium).",
          "Pour accéder à certaines fonctionnalités, vous devez :",
          "• avoir au moins 16 ans ;",
          "• créer un compte via Apple ou Google (Firebase Auth) ;",
          "• accepter les présentes CGU."
        ]
      },
      {
        title: "3. Contenu utilisateur",
        content: [
          "Vous restez propriétaire du contenu que vous publiez (photos, vidéos, textes concernant vos animaux).",
          "En publiant du contenu, vous accordez à l'Éditeur une licence d'utilisation pour faire fonctionner le Service.",
          "Vous êtes responsable du contenu que vous publiez et vous vous engagez à ne pas publier de contenu :",
          "• illégal, haineux, discriminatoire ou offensant ;",
          "• inapproprié, violent ou pornographique ;",
          "• violant les droits de tiers (droits d'auteur, vie privée, etc.) ;",
          "• frauduleux ou trompeur."
        ]
      },
      {
        title: "4. Abonnement Premium",
        content: [
          "L'Application propose un abonnement Premium avec des fonctionnalités supplémentaires.",
          "L'abonnement est géré via l'App Store (Apple) ou Google Play.",
          "Le paiement est débité automatiquement à chaque renouvellement sauf résiliation de votre part.",
          "Aucun remboursement n'est prévu pour les périodes en cours, sauf obligation légale."
        ]
      },
      {
        title: "5. Publicités",
        content: [
          "L'Application peut afficher des publicités pour financer le service gratuit.",
          "Les publicités sont fournies par des réseaux tiers (ex: Google AdMob).",
          "Vous pouvez consentir ou refuser les publicités personnalisées via les réglages.",
          "Certaines publicités récompensées peuvent donner des avantages dans l'Application."
        ]
      },
      {
        title: "6. Propriété intellectuelle",
        content: [
          "L'Application, son interface, ses fonctionnalités et son contenu original sont protégés par le droit d'auteur.",
          "Vous ne pouvez pas copier, modifier, reverse-engineer ou distribuer l'Application sans autorisation.",
          "Les marques et logos utilisés sont la propriété de leurs détenteurs respectifs."
        ]
      },
      {
        title: "7. Responsabilité",
        content: [
          "L'Éditeur s'efforce de fournir un service fiable mais ne garantit pas une disponibilité continue.",
          "L'Éditeur n'est pas responsable des :",
          "• pertes de données ou contenus utilisateur ;",
          "• dommages indirects résultant de l'utilisation de l'Application ;",
          "• contenus publiés par les utilisateurs ;",
          "• problèmes techniques temporaires."
        ]
      },
      {
        title: "8. Modification et résiliation",
        content: [
          "L'Éditeur peut modifier les CGU et les fonctionnalités de l'Application.",
          "Les modifications importantes seront notifiées aux utilisateurs.",
          "Vous pouvez résilier votre compte à tout moment via les réglages de l'Application.",
          "L'Éditeur peut suspendre ou résilier les comptes violant les CGU."
        ]
      },
      {
        title: "9. Loi applicable",
        content: [
          "Les présentes CGU sont soumises au droit français.",
          "Tout litige sera soumis aux tribunaux compétents de France."
        ]
      },
      {
        title: "10. Contact",
        content: [
          "Pour toute question relative aux CGU :",
          "Guillaume BOURLART",
          "📧 contact.gb.entreprise@gmail.com"
        ]
      }
    ],
    footer: "© 2025 Pawder. Tous droits réservés."
  },
  en: {
    title: "Terms of Use — Pawder",
    subtitle: "Pawder Terms of Use",
    lastUpdate: "Last updated: 10/12/2025",
    sections: [
      {
        title: "1. Purpose of the App",
        content: [
          "Pawder is an entertainment app allowing users to:",
          "• create profiles for their pets (photos, short description, basic information);",
          "• discover pets, vote and interact;",
          "• view rankings (weekly, Hall of Fame, etc.);",
          "• participate in a community centered on pets.",
          "The App is intended for personal, non-commercial use."
        ]
      },
      {
        title: "2. Access Conditions",
        content: [
          "The App is free but may include paid features (Premium subscription).",
          "To access certain features, you must:",
          "• be at least 16 years old;",
          "• create an account via Apple or Google (Firebase Auth);",
          "• accept these Terms of Use."
        ]
      },
      {
        title: "3. User Content",
        content: [
          "You remain the owner of content you publish (photos, videos, texts about your pets).",
          "By publishing content, you grant the Publisher a license to use it to operate the Service.",
          "You are responsible for the content you publish and undertake not to publish content that is:",
          "• illegal, hateful, discriminatory or offensive;",
          "• inappropriate, violent or pornographic;",
          "• infringing third-party rights (copyright, privacy, etc.);",
          "• fraudulent or misleading."
        ]
      },
      {
        title: "4. Premium Subscription",
        content: [
          "The App offers a Premium subscription with additional features.",
          "The subscription is managed via the App Store (Apple) or Google Play.",
          "Payment is automatically charged at each renewal unless you cancel.",
          "No refund is provided for current periods, except as required by law."
        ]
      },
      {
        title: "5. Advertising",
        content: [
          "The App may display ads to fund the free service.",
          "Ads are provided by third-party networks (ex: Google AdMob).",
          "You can consent to or refuse personalized ads via settings.",
          "Some rewarded ads may provide benefits in the App."
        ]
      },
      {
        title: "6. Intellectual Property",
        content: [
          "The App, its interface, features and original content are protected by copyright.",
          "You may not copy, modify, reverse-engineer or distribute the App without authorization.",
          "Trademarks and logos used are the property of their respective owners."
        ]
      },
      {
        title: "7. Liability",
        content: [
          "The Publisher strives to provide a reliable service but does not guarantee continuous availability.",
          "The Publisher is not responsible for:",
          "• loss of data or user content;",
          "• indirect damages resulting from use of the App;",
          "• content published by users;",
          "• temporary technical issues."
        ]
      },
      {
        title: "8. Modifications and Termination",
        content: [
          "The Publisher may modify the Terms and App features.",
          "Significant changes will be notified to users.",
          "You can terminate your account at any time via App settings.",
          "The Publisher may suspend or terminate accounts violating the Terms."
        ]
      },
      {
        title: "9. Governing Law",
        content: [
          "These Terms are governed by French law.",
          "Any dispute will be submitted to the competent courts of France."
        ]
      },
      {
        title: "10. Contact",
        content: [
          "For any question about the Terms:",
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

export default function CGUPage() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const content = cguContent[language]

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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {language === 'fr' ? "Conditions Générales d'Utilisation" : 'Terms of Use'}
              </h1>
              <p className="text-gray-300">
                {language === 'fr' ? 'Application Pawder' : 'Pawder Application'}
              </p>
            </div>
          </div>
          
          <LanguageToggle onLanguageChange={setLanguage} />
        </div>

        {/* Portfolio Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          {language === 'fr' ? 'Voir mon portfolio' : 'See my portfolio'}
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
