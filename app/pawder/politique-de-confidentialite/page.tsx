'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'

const privacyContent = {
  fr: {
    title: "Politique de confidentialité — Pawder",
    subtitle: "Politique de confidentialité de l'application Pawder",
    lastUpdate: "Dernière mise à jour : 10/12/2025",
    sections: [
      {
        title: "Introduction",
        content: [
          "L'application mobile Pawder (ci-après « l'Application ») est éditée par Guillaume Paul Raoul BOURLART, entrepreneur individuel, immatriculé sous le numéro SIREN 883 345 522, dont le siège est situé 1 Avenue Maurice, 92270 Bois-Colombes, France (ci-après « l'Éditeur », « nous »).",
          "La présente politique de confidentialité (la « Politique ») explique de manière claire quelles données personnelles sont collectées via l'Application, pour quelles finalités, sur quelle base juridique, avec qui elles sont partagées et quels sont vos droits.",
          "En utilisant l'Application, vous reconnaissez avoir pris connaissance de la présente Politique. Lorsque certains traitements nécessitent un consentement (par exemple Analytics ou publicités), celui-ci vous est demandé séparément.",
          "Portée internationale : l'Application est accessible dans plusieurs pays. Si des lois locales vous accordent des droits supplémentaires, ces droits s'appliquent également."
        ]
      },
      {
        title: "1. Responsable du traitement",
        content: [
          "Responsable du traitement",
          "Guillaume Paul Raoul BOURLART",
          "1 Avenue Maurice",
          "92270 Bois-Colombes – France",
          "Email de contact (support & données personnelles) : contact.gb.entreprise@gmail.com",
          "L'Éditeur détermine les finalités et les moyens des traitements de données mis en œuvre via l'Application."
        ]
      },
      {
        title: "2. Données collectées",
        content: [
          "Nous ne collectons que les données nécessaires au fonctionnement de l'Application, à la fourniture de ses fonctionnalités (création d'animaux, votes, classements), à la gestion de l'abonnement Premium et, si vous y consentez, à la mesure d'audience et à l'affichage de publicités."
        ]
      },
      {
        title: "2.1 Données de compte",
        content: [
          "Lors de la création et de l'utilisation de votre compte via Apple ou Google (via Firebase Auth), nous pouvons traiter notamment :",
          "• Identifiant unique utilisateur (UID Firebase)",
          "• Adresse e-mail (si fournie par Apple/Google)",
          "• Nom d'affichage (displayName, si fourni)",
          "• Identifiant technique d'appareil (deviceId, par ex. ios-{UUID})",
          "• Informations techniques liées à l'authentification transmises indirectement par Apple/Google à Firebase",
          "Ces données sont nécessaires pour :",
          "• créer et gérer votre compte utilisateur ;",
          "• vous permettre de vous connecter ;",
          "• lier vos animaux, votes et favoris à votre profil."
        ]
      },
      {
        title: "2.2 Données relatives à vos animaux (contenu utilisateur)",
        content: [
          "Lorsque vous créez ou modifiez une fiche d'animal, vous nous fournissez volontairement :",
          "• Nom de l'animal",
          "• Espèce (chat, chien, etc., parmi une liste prédéfinie)",
          "• Race (facultatif)",
          "• Date de naissance (facultative)",
          "• Pays (code ISO2, par défaut « France »)",
          "• Sexe (mâle, femelle, non déterminé)",
          "• Description courte (texte limité en longueur)",
          "• Médias : au moins une photo de couverture et, éventuellement, jusqu'à deux médias supplémentaires (photos ou courtes vidéos)",
          "Ces données constituent du contenu utilisateur que vous choisissez de publier. Selon l'état de validation et les paramètres de visibilité, ces fiches peuvent être :",
          "• visibles par les autres utilisateurs de l'Application (mode public) ;",
          "• visibles uniquement par vous (par exemple en cas de brouillon ou de mise en revue/modération)."
        ]
      },
      {
        title: "3. Finalités et bases juridiques",
        content: [
          "Fourniture de l'Application et exécution du contrat",
          "Base juridique : exécution du contrat (article 6(1)(b) RGPD)",
          "• Création, gestion et suppression de compte",
          "• Gestion des animaux, votes, favoris, classements",
          "• Gestion des quotas et du statut gratuit / Premium",
          "• Synchronisation des données entre appareils",
          "• Gestion technique (stockage médias, affichage, etc.)",
          "Sans ces traitements, l'Application ne peut pas fonctionner."
        ]
      },
      {
        title: "4. Destinataires et sous-traitants",
        content: [
          "Vos données peuvent être transmises aux destinataires suivants, en tant que sous-traitants ou partenaires techniques :",
          "• Google Firebase / Google Cloud Platform : Auth, Firestore, Storage, Cloud Functions, FCM, Analytics (si consentement)",
          "• Google Mobile Ads (AdMob) : publicités (si consentement)",
          "• Apple : Sign in with Apple, StoreKit, gestion des achats et paiements",
          "Nous ne revendons pas vos données. Nous ne les partageons qu'aux prestataires nécessaires au fonctionnement du service, dans un cadre contractuel."
        ]
      },
      {
        title: "5. Durée de conservation",
        content: [
          "Nous conservons vos données pendant des durées limitées :",
          "• Compte / profil : pendant la durée de vie du compte, puis suppression après suppression du compte ou demande, sauf obligations légales ou intérêts légitimes (ex. sécurité)",
          "• Animaux / votes / favoris : pendant l'existence du compte ou de la fiche concernée",
          "• Données techniques / logs : conservation limitée, notamment pour diagnostic et sécurité (durées variables selon les politiques des prestataires)",
          "• Statut Premium : le temps nécessaire à la gestion du statut (actif/expiré) et aux vérifications liées aux transactions via Apple",
          "• Consentements (Analytics / Publicités) : tant que votre compte existe ou jusqu'à modification/suppression",
          "En cas de suppression de compte, nous procédons à la suppression des données liées à votre profil, animaux, votes, favoris, signalements et médias selon les mécanismes prévus. Certaines données agrégées ou anonymisées peuvent être conservées."
        ]
      },
      {
        title: "6. Vos droits",
        content: [
          "Conformément au RGPD et à la législation française applicable, vous disposez notamment des droits suivants :",
          "• Accès, rectification, effacement",
          "• Limitation du traitement",
          "• Opposition (notamment aux traitements fondés sur l'intérêt légitime)",
          "• Portabilité (dans les conditions prévues)",
          "• Retrait du consentement à tout moment pour les traitements fondés sur le consentement",
          "Vous pouvez :",
          "• supprimer votre compte via les paramètres de l'Application ; ou",
          "• nous contacter : contact.gb.entreprise@gmail.com",
          "Nous pourrons demander des informations complémentaires pour vérifier votre identité.",
          "Vous pouvez également déposer une réclamation auprès de l'autorité compétente (en France : CNIL)."
        ]
      },
      {
        title: "7. Enfants et âge minimum",
        content: [
          "L'Application n'est pas destinée aux utilisateurs de moins de 16 ans.",
          "En utilisant l'Application, vous déclarez être âgé d'au moins 16 ans.",
          "Si vous êtes parent ou représentant légal et pensez qu'un enfant nous a fourni des données personnelles, contactez-nous à contact.gb.entreprise@gmail.com afin de demander la suppression du compte et des données associées."
        ]
      },
      {
        title: "8. Consentement et réglages de confidentialité",
        content: [
          "Lors de votre première connexion, un écran de consentement vous permet :",
          "• d'accepter ou refuser la mesure d'audience (Analytics) ;",
          "• d'accepter ou refuser les publicités (AdMob) ;",
          "• de choisir d'accepter tout, partiellement, ou de refuser tout.",
          "Le refus n'empêche pas l'utilisation de l'Application, mais peut désactiver certaines fonctionnalités (ex. publicités récompensées, statistiques).",
          "Vous pouvez modifier vos choix (si disponible dans l'Application) ou nous contacter : contact.gb.entreprise@gmail.com."
        ]
      },
      {
        title: "9. Sécurité",
        content: [
          "Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables : services sécurisés, chiffrement TLS, règles d'accès (Firestore Security Rules), suppression lors de la suppression de compte, etc.",
          "Aucun système n'étant parfaitement sécurisé, nous ne pouvons garantir une sécurité absolue."
        ]
      },
      {
        title: "10. Modifications de la Politique",
        content: [
          "Nous pouvons modifier cette Politique pour tenir compte d'évolutions techniques, fonctionnelles ou légales.",
          "En cas de modification importante, nous vous informerons via l'Application et/ou tout moyen approprié. La version la plus récente reste disponible via l'Application et/ou l'URL de référence."
        ]
      },
      {
        title: "11. Contact",
        content: [
          "Pour toute question relative à cette Politique ou à vos données personnelles :",
          "contact.gb.entreprise@gmail.com"
        ]
      }
    ],
    footer: "© 2025 Pawder. Tous droits réservés."
  },
  en: {
    title: "Privacy Policy — Pawder",
    subtitle: "Pawder Privacy Policy",
    lastUpdate: "Last updated: 10/12/2025",
    sections: [
      {
        title: "Introduction",
        content: [
          "The Pawder mobile application (the \"App\") is published by Guillaume Paul Raoul BOURLART, acting as a sole proprietor (entrepreneur individuel), registered under SIREN 883 345 522, with its registered address at 1 Avenue Maurice, 92270 Bois-Colombes, France (the \"Publisher\", \"we\", \"us\").",
          "This Privacy Policy (the \"Policy\") explains what personal data is collected through the App, for what purposes, on what legal basis, with whom it may be shared, and what rights you have.",
          "By using the App, you acknowledge that you have read this Policy. Where a specific processing activity requires your consent (for example, Analytics or advertising), we will request it separately.",
          "International scope: the App may be available in multiple countries. If local laws grant you additional rights, those rights remain applicable."
        ]
      },
      {
        title: "1. Data Controller",
        content: [
          "Data Controller",
          "Guillaume Paul Raoul BOURLART",
          "1 Avenue Maurice",
          "92270 Bois-Colombes – France",
          "Contact email (support & privacy): contact.gb.entreprise@gmail.com",
          "The Publisher determines the purposes and means of the data processing carried out through the App."
        ]
      },
      {
        title: "2. Data We Collect",
        content: [
          "We only collect data that is necessary to operate the App, provide its features (pet profiles, voting, rankings), manage the Premium subscription, and—if you consent—measure usage and display ads."
        ]
      },
      {
        title: "2.1 Account Data",
        content: [
          "When you create and use an account via Apple or Google (through Firebase Auth), we may process:",
          "• Unique user identifier (Firebase UID)",
          "• Email address (if provided by Apple/Google)",
          "• Display name (if provided)",
          "• Technical device identifier (deviceId, e.g., ios-{UUID})",
          "• Technical authentication information indirectly transmitted by Apple/Google to Firebase",
          "This data is required to:",
          "• create and manage your user account;",
          "• allow you to sign in;",
          "• link your pets, votes, and favorites to your profile."
        ]
      },
      {
        title: "3. Purposes and Legal Bases",
        content: [
          "Providing the App and Performing the Contract",
          "Legal basis: performance of a contract (GDPR Art. 6(1)(b))",
          "• Account creation, management, and deletion",
          "• Managing pets, votes, favorites, rankings",
          "• Applying quotas and Free/Premium status",
          "• Sync across devices",
          "• Technical operations (media storage, display, etc.)",
          "Without these processes, the App cannot function."
        ]
      },
      {
        title: "4. Recipients and Processors",
        content: [
          "Your data may be shared with the following service providers (processors) as necessary:",
          "• Google Firebase / Google Cloud Platform: Auth, Firestore, Storage, Cloud Functions, FCM, Analytics (if consented)",
          "• Google Mobile Ads (AdMob): ads (if consented)",
          "• Apple: Sign in with Apple, StoreKit, subscription and payment management",
          "We do not sell your personal data. We share it only with providers required to operate the service, under contractual safeguards."
        ]
      },
      {
        title: "5. Data Retention",
        content: [
          "We retain data for limited periods:",
          "• Account/profile: for as long as your account exists, then deleted upon account deletion or request, subject to legal obligations or legitimate interests (e.g., security)",
          "• Pets/votes/favorites: while your account or the relevant profile exists",
          "• Technical data/logs: limited retention for diagnostics and security (durations vary by provider policies)",
          "• Premium status: as needed to manage active/expired status and verify App Store transactions",
          "• Consents (Analytics/Ads): while your account exists or until you change/delete them",
          "Upon account deletion, we delete your profile data, pets, votes, favorites, reports, and media according to our automated processes. Aggregated or anonymized data may be retained."
        ]
      },
      {
        title: "6. Your Rights",
        content: [
          "Under the GDPR and applicable French law, you may have rights including:",
          "• access, rectification, deletion",
          "• restriction",
          "• objection (notably to legitimate-interest processing)",
          "• portability (where applicable)",
          "• withdrawal of consent at any time for consent-based processing",
          "You can:",
          "• delete your account in the App settings; or",
          "• contact us at contact.gb.entreprise@gmail.com",
          "We may request additional information to verify your identity.",
          "You may also lodge a complaint with the competent authority (in France: CNIL)."
        ]
      },
      {
        title: "7. Children and Minimum Age",
        content: [
          "The App is not intended for users under 16. By using the App, you confirm you are at least 16.",
          "We do not knowingly collect personal data from children under 13.",
          "If you are a parent/guardian and believe a child has provided us with personal data, contact us at contact.gb.entreprise@gmail.com to request deletion of the account and associated data."
        ]
      },
      {
        title: "8. Consent and Privacy Settings",
        content: [
          "On first sign-in, a consent screen allows you to:",
          "• allow or refuse Analytics;",
          "• allow or refuse Ads (AdMob);",
          "• accept all, partially accept, or refuse all.",
          "Refusing does not prevent use of the App, but may disable certain features (e.g., rewarded ads, advanced stats).",
          "You can change your choices (where available in the App) or contact us at contact.gb.entreprise@gmail.com."
        ]
      },
      {
        title: "9. Security",
        content: [
          "We implement reasonable technical and organizational measures (secure providers, TLS encryption, access rules, deletion on account deletion, etc.).",
          "No system is perfectly secure; we cannot guarantee absolute security."
        ]
      },
      {
        title: "10. Changes to This Policy",
        content: [
          "We may update this Policy to reflect technical, functional, or legal changes.",
          "If changes are significant, we will notify you in the App and/or by appropriate means. The latest version remains available in the App and/or via the reference URL."
        ]
      },
      {
        title: "11. Contact",
        content: [
          "For any questions about this Policy or your personal data:",
          "contact.gb.entreprise@gmail.com"
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

export default function PolitiqueConfidentialitePage() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const content = privacyContent[language]

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
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {language === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
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
