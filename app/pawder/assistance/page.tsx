'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'

const assistanceContent = {
  fr: {
    title: "Assistance Pawder",
    subtitle: "Guide d'utilisation et FAQ",
    sections: [
      {
        title: "À propos de Pawder",
        content: [
          "Pawder est une application communautaire qui permet de voter pour les plus beaux animaux et de créer le profil de votre compagnon. Participez aux classements hebdomadaires et au Hall of Fame pour faire monter votre animal dans les rangs !"
        ]
      },
      {
        title: "Guide d'utilisation",
        content: [
          "Comment voter pour un animal ?",
          "• Swipe à droite : voter pour l'animal (+1 point d'aura)",
          "• Swipe à gauche : passer cet animal (0 point)",
          "• Swipe vers le haut : super vote (+10 points d'aura) — nécessite un super vote disponible",
          "",
          "Comment créer le profil de mon animal ?",
          "1. Allez dans l'onglet \"Mes animaux\"",
          "2. Appuyez sur le bouton \"+\" pour ajouter un animal",
          "3. Remplissez les informations : nom, espèce, race, date de naissance, pays, sexe",
          "4. Ajoutez au moins une photo (obligatoire) et jusqu'à 3 médias au total",
          "5. Rédigez une courte description",
          "6. Validez pour soumettre à la modération",
          "",
          "Comment fonctionne le classement ?",
          "• Chaque vote rapporte des points d'aura à l'animal",
          "• Les super votes rapportent 10x plus de points",
          "• Les classements sont mis à jour en temps réel",
          "• Un classement hebdomadaire récompense les meilleurs chaque semaine",
          "• Le Hall of Fame immortalise les animaux légendaires"
        ]
      },
      {
        title: "Fonctionnalités Premium",
        content: [
          "Qu'est-ce que l'abonnement Premium ?",
          "• Votes illimités (plus de quotas journaliers)",
          "• Super votes bonus chaque jour",
          "• Accès aux statistiques détaillées",
          "• Badge Premium sur votre profil",
          "• Priorité dans les classements",
          "",
          "Comment s'abonner ?",
          "1. Allez dans l'onglet \"Profil\"",
          "2. Appuyez sur \"Passer Premium\"",
          "3. Choisissez votre formule (mensuel/annuel)",
          "4. Confirmez via l'App Store ou Google Play",
          "",
          "Comment résilier ?",
          "• Allez dans les réglages de votre téléphone (App Store / Google Play)",
          "• Gérez vos abonnements et résiliez Pawder Premium"
        ]
      },
      {
        title: "Publicités et récompenses",
        content: [
          "Comment fonctionnent les publicités ?",
          "• Des publicités peuvent s'afficher entre les votes",
          "• Les publicités récompensées donnent des bonus en jeu",
          "• Vous pouvez regarder des pubs pour gagner des super votes",
          "• Les publicités aident à maintenir l'application gratuite",
          "",
          "Comment gérer les publicités ?",
          "• Les utilisateurs Premium n'ont pas de publicités",
          "• Vous pouvez limiter les pubs dans les réglages",
          "• Certaines publicités sont optionnelles pour des récompenses"
        ]
      },
      {
        title: "Modération et sécurité",
        content: [
          "Comment fonctionne la modération ?",
          "• Tous les profils sont vérifiés avant publication",
          "• Signalez tout contenu inapproprié avec le bouton de signalement",
          "• Notre équipe modère les signalements rapidement",
          "• Les comptes violant les règles peuvent être suspendus",
          "",
          "Règles de la communauté :",
          "• Respectez les autres utilisateurs",
          "• Ne publiez que des photos d'animaux vous appartenant",
          "• Pas de contenu violent, inapproprié ou offensant",
          "• Pas de harcèlement ou d'insultes",
          "• Respectez la vie privée des animaux et des personnes"
        ]
      },
      {
        title: "Problèmes techniques",
        content: [
          "L'application ne se lance pas ?",
          "• Vérifiez que votre système est à jour (iOS 14+ / Android 8+)",
          "• Redémarrez votre téléphone",
          "• Réinstallez l'application (vos données sont sauvegardées)",
          "",
          "Problèmes de connexion ?",
          "• Vérifiez votre connexion internet",
          "• Essayez de vous reconnecter avec Apple/Google",
          "• Contactez-nous si le problème persiste",
          "",
          "Photos qui ne s'affichent pas ?",
          "• Vérifiez que vous avez autorisé l'accès aux photos",
          "• Essayez avec une autre photo",
          "• Les photos trop lourdes peuvent mettre du temps à charger"
        ]
      },
      {
        title: "FAQ - Questions fréquentes",
        content: [
          "Q: Mon animal n'apparaît pas dans le classement ?",
          "R: Les nouveaux animaux apparaissent après validation par la modération (24-48h max).",
          "",
          "Q: J'ai oublié mon mot de passe ?",
          "R: Utilisez la connexion Apple/Google, pas de mot de passe à mémoriser.",
          "",
          "Q: Comment supprimer mon compte ?",
          "R: Allez dans Profil > Réglages > Supprimer le compte.",
          "",
          "Q: Les votes sont-ils anonymes ?",
          "R: Oui, personne ne voit qui a voté pour quel animal.",
          "",
          "Q: Puis-je modifier le profil de mon animal ?",
          "R: Oui, allez dans \"Mes animaux\" et modifiez les informations souhaitées."
        ]
      }
    ]
  },
  en: {
    title: "Pawder Help",
    subtitle: "User Guide & FAQ",
    sections: [
      {
        title: "About Pawder",
        content: [
          "Pawder is a community app that lets you vote for the most beautiful pets and create your companion's profile. Participate in weekly rankings and the Hall of Fame to boost your pet up the ranks!"
        ]
      },
      {
        title: "User Guide",
        content: [
          "How to vote for a pet?",
          "• Swipe right: vote for the pet (+1 aura point)",
          "• Swipe left: skip this pet (0 points)",
          "• Swipe up: super vote (+10 aura points) — requires available super vote",
          "",
          "How to create my pet's profile?",
          "1. Go to the \"My Pets\" tab",
          "2. Press the \"+\" button to add a pet",
          "3. Fill in the information: name, species, breed, birth date, country, gender",
          "4. Add at least one photo (required) and up to 3 media total",
          "5. Write a short description",
          "6. Submit for moderation review",
          "",
          "How do rankings work?",
          "• Each vote gives aura points to the pet",
          "• Super votes give 10x more points",
          "• Rankings are updated in real-time",
          "• A weekly ranking rewards the best each week",
          "• The Hall of Fame immortalizes legendary pets"
        ]
      },
      {
        title: "Premium Features",
        content: [
          "What is Premium subscription?",
          "• Unlimited votes (no daily quotas)",
          "• Bonus super votes every day",
          "• Access to detailed statistics",
          "• Premium badge on your profile",
          "• Priority in rankings",
          "",
          "How to subscribe?",
          "1. Go to the \"Profile\" tab",
          "2. Press \"Go Premium\"",
          "3. Choose your plan (monthly/yearly)",
          "4. Confirm via App Store or Google Play",
          "",
          "How to cancel?",
          "• Go to your phone settings (App Store / Google Play)",
          "• Manage your subscriptions and cancel Pawder Premium"
        ]
      },
      {
        title: "Ads and Rewards",
        content: [
          "How do ads work?",
          "• Ads may display between votes",
          "• Rewarded ads give in-game bonuses",
          "• You can watch ads to earn super votes",
          "• Ads help keep the app free",
          "",
          "How to manage ads?",
          "• Premium users have no ads",
          "• You can limit ads in settings",
          "• Some ads are optional for rewards"
        ]
      },
      {
        title: "Moderation and Safety",
        content: [
          "How does moderation work?",
          "• All profiles are verified before publication",
          "• Report any inappropriate content with the report button",
          "• Our team moderates reports quickly",
          "• Accounts violating rules may be suspended",
          "",
          "Community rules:",
          "• Respect other users",
          "• Only post photos of pets you own",
          "• No violent, inappropriate or offensive content",
          "• No harassment or insults",
          "• Respect the privacy of pets and people"
        ]
      },
      {
        title: "Technical Issues",
        content: [
          "App won't launch?",
          "• Check your system is updated (iOS 14+ / Android 8+)",
          "• Restart your phone",
          "• Reinstall the app (your data is saved)",
          "",
          "Connection issues?",
          "• Check your internet connection",
          "• Try reconnecting with Apple/Google",
          "• Contact us if the problem persists",
          "",
          "Photos not displaying?",
          "• Check you've authorized photo access",
          "• Try with another photo",
          "• Heavy photos may take time to load"
        ]
      },
      {
        title: "FAQ - Common Questions",
        content: [
          "Q: My pet doesn't appear in rankings?",
          "A: New pets appear after moderation approval (max 24-48h).",
          "",
          "Q: I forgot my password?",
          "A: Use Apple/Google login, no password to remember.",
          "",
          "Q: How to delete my account?",
          "A: Go to Profile > Settings > Delete Account.",
          "",
          "Q: Are votes anonymous?",
          "A: Yes, nobody sees who voted for which pet.",
          "",
          "Q: Can I edit my pet's profile?",
          "A: Yes, go to \"My Pets\" and modify the desired information."
        ]
      }
    ]
  }
}

function ContentSection({ title, content }: { title: string; content: string[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {content.map((paragraph, index) => (
          <p key={index} className="text-gray-300 leading-relaxed">
            {paragraph.startsWith('•') || paragraph.startsWith('Q:') || paragraph.startsWith('A:') ? (
              <span className="inline-block ml-4">{paragraph}</span>
            ) : paragraph === '' ? (
              <br />
            ) : (
              paragraph
            )}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function AssistancePage() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const content = assistanceContent[language]

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
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {language === 'fr' ? 'Assistance Pawder' : 'Pawder Help'}
              </h1>
              <p className="text-gray-300">
                {language === 'fr' ? 'Guide d\'utilisation et FAQ' : 'User Guide & FAQ'}
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
          <p className="text-gray-400 text-center">
            {language === 'fr' 
              ? 'Pour plus d\'aide, contactez-nous : 📧 contact.gb.entreprise@gmail.com'
              : 'For more help, contact us: 📧 contact.gb.entreprise@gmail.com'
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}
