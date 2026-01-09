'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'

const cguContent = {
  fr: `# **Conditions Générales d'Utilisation — Pawder (FR)**

**Conditions Générales d'Utilisation de l'application Pawder**  
**Dernière mise à jour : 10/12/2025**

**Les présentes Conditions Générales d'Utilisation (ci-après les « CGU ») régissent l'utilisation de l'application mobile Pawder (ci-après l'« Application »), éditée par Guillaume Paul Raoul BOURLART, entrepreneur individuel, immatriculé sous le numéro SIREN 883 345 522, dont le siège est situé 1 Avenue Maurice, 92270 Bois-Colombes, France (ci-après « l'Éditeur », « nous », « notre »).**

**En installant et en utilisant l'Application, vous acceptez pleinement et sans réserve les présentes CGU. Si vous n'acceptez pas ces CGU, vous ne devez pas utiliser l'Application.**

**Portée internationale : l'Application peut être disponible dans plusieurs pays. Les présentes CGU s'appliquent, sous réserve des dispositions impératives éventuellement applicables dans votre pays de résidence.**  
**Langues : en cas de divergence entre versions, la version française prévaut.**

---

## **1. Objet de l'Application**

**Pawder est une application de divertissement permettant aux utilisateurs :**

* **de créer des fiches pour leurs animaux (photos, courte description, informations de base) ;**  
* **de découvrir des animaux, voter et interagir ;**  
* **de consulter des classements (hebdomadaires, Hall of Fame, etc.) ;**  
* **d'ajouter des animaux en favoris ;**  
* **d'accéder à des fonctionnalités supplémentaires via un abonnement Premium.**

**Pawder est une application ludique, sans promesse de gain financier ni concours avec récompenses monétaires. Les « scores », « rangs » et « classements » n'ont qu'une valeur de divertissement.**

---

## **2. Acceptation et modification des CGU**

**L'utilisation de l'Application implique l'acceptation pleine et entière des présentes CGU.**

**L'Éditeur se réserve le droit de modifier les CGU à tout moment, notamment pour les adapter à des évolutions légales, techniques ou fonctionnelles. La version applicable est celle disponible dans l'Application et/ou via le document en ligne à la date de votre utilisation.**

**En cas de modification substantielle, nous pourrons vous en informer dans l'Application. En continuant à utiliser l'Application après la mise à jour, vous êtes réputé avoir accepté les nouvelles CGU.**

---

## **3. Accès à l'Application**

**L'Application est téléchargeable gratuitement sur l'App Store d'Apple, sous réserve :**

* **de disposer d'un appareil compatible ;**  
* **d'une connexion Internet ;**  
* **d'un compte Apple valide.**

**Les coûts liés à l'accès au réseau (data, Internet) sont à votre charge.**

**L'Éditeur fait ses meilleurs efforts pour assurer l'accessibilité de l'Application, mais ne garantit pas un accès continu, sans erreur ni interruption.**

**Important : Apple n'est pas partie au contrat conclu entre vous et l'Éditeur. Apple n'est pas responsable de l'Application ni de son contenu, dans les limites prévues par la loi.**

---

## **4. Création de compte et authentification**

### **4.1 Création de compte**

**L'utilisation de l'Application nécessite la création d'un compte via :**

* **Sign in with Apple ; et/ou**  
* **Google Sign-In ;**  
  **gérés via Firebase Auth.**

**Vous vous engagez à fournir des informations exactes et à les maintenir à jour.**

### **4.2 Sécurité du compte**

**Votre compte est associé à un identifiant unique (UID) généré par Firebase et lié à votre compte Apple/Google.**

**Vous êtes responsable de la confidentialité de vos identifiants Apple/Google et de toute utilisation de votre compte dans l'Application. En cas de suspicion d'accès non autorisé :**

* **modifiez vos identifiants Apple/Google ;**  
* **contactez-nous à contact.gb.entreprise@gmail.com si vous estimez que votre compte Pawder a été compromis.**

---

## **5. Âge minimum**

**L'Application n'est pas destinée aux utilisateurs de moins de 16 ans.**

**En utilisant Pawder, vous déclarez et garantissez :**

* **être âgé d'au moins 16 ans ;**  
* **disposer de la capacité juridique de conclure un contrat.**

**Si vous êtes parent ou représentant légal et pensez qu'un enfant de moins de 16 ans utilise l'Application sans votre accord, contactez-nous à contact.gb.entreprise@gmail.com pour demander la suppression du compte et des données associées.**

---

## **6. Utilisation de l'Application**

### **6.1 Règles générales de comportement**

**Vous vous engagez à utiliser l'Application :**

* **conformément aux lois et règlements en vigueur ;**  
* **dans le respect des présentes CGU ;**  
* **sans porter atteinte aux droits de l'Éditeur, des autres utilisateurs ou de tout tiers.**

**Il est notamment interdit de :**

* **usurper l'identité d'une autre personne ou fournir de fausses informations ;**  
* **utiliser l'Application à des fins frauduleuses, malveillantes ou illégales ;**  
* **tenter de contourner les mécanismes de sécurité, quotas ou limites techniques ;**  
* **utiliser des scripts, bots, automatisations ou tout moyen non autorisé pour manipuler les votes, classements ou le fonctionnement de l'Application.**

### **6.2 Contenu utilisateur (animaux, textes, médias)**

**Vous pouvez créer des fiches d'animaux et publier du contenu (photos, vidéos, texte). En publiant ce contenu, vous certifiez que :**

* **vous êtes propriétaire du contenu ou disposez des droits nécessaires pour le publier (droits d'auteur, droit à l'image, etc.) ;**  
* **le contenu ne porte pas atteinte aux droits de tiers (personnes reconnaissables, marques, œuvres protégées, etc.) ;**  
* **le contenu respecte la loi et les présentes CGU.**

**Sont notamment interdits :**

* **contenus violents, haineux, discriminatoires, injurieux ;**  
* **contenus à caractère sexuel/pornographique, ou impliquant des animaux de manière inappropriée ;**  
* **contenus incitant à la maltraitance animale, à la violence ou à des actes illégaux ;**  
* **spam, arnaques, publicités dissimulées, chaînes ;**  
* **contenus portant atteinte à la vie privée (données personnelles, visage de personnes non consentantes, etc.).**

### **6.3 Licence sur le contenu utilisateur**

**Vous restez titulaire de vos droits sur les photos, vidéos et textes publiés.**

**Toutefois, en publiant du contenu dans l'Application, vous accordez à l'Éditeur une licence non exclusive, gratuite, mondiale et révocable, pour la durée d'existence du contenu ou de votre compte, afin de :**

* **héberger, stocker, reproduire et afficher ce contenu dans l'Application (deck, fiches, classements) ;**  
* **l'adapter légèrement pour des contraintes techniques (compression, redimensionnement, etc.).**

**Cette licence est strictement limitée au bon fonctionnement de l'Application et à sa promotion interne (par exemple, mise en avant dans les écrans de l'Application).**

**Vous pouvez supprimer à tout moment vos contenus et/ou votre compte. En cas de suppression, nous faisons nos meilleurs efforts pour retirer le contenu de l'Application et de nos systèmes, sous réserve des sauvegardes techniques temporaires ou données déjà anonymisées/agrégées.**

---

## **7. Votes, classements et quotas**

**L'Application permet :**

* **de faire défiler des animaux ;**  
* **de voter (vote simple, super vote) ;**  
* **de consulter des classements (hebdomadaires, Hall of Fame, etc.).**

**Des quotas (votes, super votes) et des limites (nombre d'animaux actifs, etc.) peuvent s'appliquer, notamment pour les comptes gratuits. Les comptes Premium peuvent bénéficier de quotas différents.**

**Les limites exactes sont indiquées dans l'Application et peuvent évoluer.**

**Les quotas, scores et classements n'ont aucune valeur contractuelle ou financière et ne donnent droit à aucun gain ni récompense réelle.**

---

## **8. Publicités et récompenses**

**L'Application peut afficher des publicités, notamment des publicités récompensées (ex : obtenir des votes supplémentaires). Ces publicités sont fournies par des services tiers (ex : Google/AdMob).**

* **Leur affichage est soumis à votre consentement (voir Politique de confidentialité).**  
* **Le visionnage d'une publicité récompensée peut donner accès à des bonus in-app, sans valeur monétaire.**  
* **L'Éditeur n'est pas responsable du contenu des publicités, dans la limite autorisée par la loi.**

---

## **9. Abonnement Premium et achats In-App**

### **9.1 Offre Premium**

**L'Application propose un abonnement Premium sous forme d'achat In-App (ex : abonnement mensuel \`com.pawder.premium_monthly\`).**

**Le prix exact est affiché par Apple dans votre devise locale au moment de l'achat.**

**Les avantages Premium peuvent inclure (à titre d'exemple) :**

* **augmentation des quotas de votes / super votes ;**  
* **augmentation ou suppression des limites sur les animaux ;**  
* **autres fonctionnalités décrites dans l'Application.**

**Les fonctionnalités Premium peuvent évoluer. Les descriptions à jour figurent dans l'Application au moment de la souscription.**

### **9.2 Gestion de l'abonnement**

**Les achats In-App et abonnements sont gérés exclusivement par Apple via l'App Store (souscription, paiement, renouvellement, résiliation, remboursements éventuels). Vous pouvez gérer votre abonnement depuis les réglages de votre compte Apple.**

### **9.3 Remboursements**

**L'Éditeur ne gère pas directement les remboursements. Toute demande doit être adressée à Apple via les procédures prévues (ex : historique d'achats).**

---

## **10. Suppression de compte**

**Vous pouvez supprimer votre compte :**

* **via les paramètres de l'Application (« Supprimer mon compte ») ; ou**  
* **en nous contactant : contact.gb.entreprise@gmail.com.**

**La suppression entraîne, dans la mesure du possible, la suppression :**

* **de votre profil ;**  
* **de vos animaux et médias associés ;**  
* **de vos votes, favoris, signalements, quotas ;**  
* **des données d'authentification sur nos systèmes (hors Apple/Google).**

**Attention : supprimer votre compte Pawder n'annule pas automatiquement votre abonnement App Store. Vous devez résilier l'abonnement via votre compte Apple pour éviter tout renouvellement.**

---

## **11. Modération et suppression de contenu**

**Un système de signalement permet de signaler un animal ou contenu inapproprié.**

**L'Éditeur se réserve le droit, à sa seule discrétion et sans préavis :**

* **de supprimer tout contenu manifestement illicite ou contraire aux CGU ;**  
* **de masquer/désactiver temporairement un contenu en attente de vérification ;**  
* **de suspendre/supprimer le compte d'un utilisateur en cas de manquement grave ou répété.**

**L'Éditeur n'est pas tenu de justifier chaque action de modération, mais s'efforcera de le faire dans la mesure du raisonnable.**

---

## **12. Propriété intellectuelle de l'Éditeur**

**Tous les éléments de l'Application (textes, graphismes, logo, interfaces, fonctionnalités, code, bases de données, etc.), à l'exception du contenu utilisateur, sont la propriété exclusive de l'Éditeur ou font l'objet d'une licence.**

**Toute reproduction, représentation, modification, exploitation ou adaptation, totale ou partielle, sans autorisation écrite préalable est interdite.**

---

## **13. Responsabilité**

### **13.1 Disponibilité**

**L'Éditeur s'efforce de maintenir l'Application accessible, mais ne garantit pas :**

* **l'absence d'erreurs, bugs, interruptions ;**  
* **la compatibilité permanente avec tout appareil ou OS ;**  
* **la continuité du service.**

**L'accès peut être temporairement suspendu pour maintenance, raisons techniques ou sécurité.**

### **13.2 Utilisation**

**L'Application est fournie « en l'état », à des fins de divertissement. Dans les limites autorisées par la loi, l'Éditeur ne saurait être tenu responsable :**

* **des dommages indirects (pertes de données, pertes de chance, pertes de revenus, etc.) ;**  
* **des conséquences liées à l'utilisation des classements, votes ou statistiques ;**  
* **des contenus publiés par les utilisateurs, dont ils restent seuls responsables.**

**Dans la limite permise par la loi, la responsabilité totale de l'Éditeur est limitée au montant éventuellement payé par l'utilisateur à l'Éditeur au cours des douze (12) derniers mois, hors montants versés à Apple.**

---

## **14. Données personnelles**

**Les traitements de données personnelles sont décrits dans la Politique de confidentialité accessible dans l'Application et/ou via un lien externe.**

**En utilisant l'Application, vous acceptez les présentes CGU et reconnaissez avoir pris connaissance de la Politique de confidentialité. Vous pouvez exercer vos droits en nous contactant : contact.gb.entreprise@gmail.com.**

---

## **15. Nullité partielle**

**Si une disposition des CGU est jugée invalide, illégale ou inapplicable, les autres dispositions demeurent pleinement applicables.**

---

## **16. Droit applicable et juridiction compétente**

**Les CGU sont soumises au droit français.**

**En cas de litige, à défaut d'accord amiable, les tribunaux compétents seront ceux du ressort de la Cour d'appel de Versailles (et plus particulièrement le tribunal compétent du ressort de Nanterre), sous réserve des règles impératives applicables aux consommateurs.**

---

## **17. Contact**

**Pour toute question concernant les CGU, l'Application ou votre compte :**  
**contact.gb.entreprise@gmail.com**

---

© 2025 Pawder. Tous droits réservés.`,

  en: `# **Terms of Use — Pawder (EN)**

**Pawder Terms of Use**  
**Last updated: 10/12/2025**

**These Terms of Use (the "Terms") govern your use of the Pawder mobile application (the "App"), published by Guillaume Paul Raoul BOURLART, acting as a sole proprietor (entrepreneur individuel), registered under SIREN 883 345 522, with its registered address at 1 Avenue Maurice, 92270 Bois-Colombes, France (the "Publisher", "we", "us").**

**By installing or using the App, you agree to these Terms. If you do not agree, you must not use the App.**

**International scope: the App may be available in multiple countries. These Terms apply subject to any mandatory consumer protection laws in your country of residence.**  
**Languages: in case of discrepancies, the French version shall prevail.**

---

## **1. Purpose of the App**

**Pawder is an entertainment app that allows users to:**

* **create pet profiles (photos, short description, basic info);**  
* **browse pets and vote for their favorites;**  
* **view rankings (weekly leaderboard, Hall of Fame, etc.);**  
* **save pets to favorites;**  
* **access additional features through a Premium subscription.**

**Pawder is purely for fun and does not promise any financial gain or monetary prizes. Scores, ranks, and leaderboards are for entertainment only.**

---

## **2. Acceptance and Updates**

**Using the App means you fully accept these Terms.**

**We may update these Terms at any time, including to reflect legal, technical, or functional changes. The version in force is the one available in the App and/or online at the time of use.**

**If we make material changes, we may notify you within the App. By continuing to use the App after an update, you are deemed to have accepted the updated Terms.**

---

## **3. Access to the App**

**The App is available for free download on Apple's App Store, provided you have:**

* **a compatible device;**  
* **an Internet connection;**  
* **a valid Apple account.**

**Network/data charges are your responsibility.**

**We strive to keep the App available, but we do not guarantee uninterrupted access, error-free operation, or continuous availability.**

**Important: Apple is not a party to the contract between you and the Publisher. Apple is not responsible for the App or its content, to the extent permitted by law.**

---

## **4. Account Creation and Authentication**

### **4.1 Creating an account**

**Using the App requires an account created via:**

* **Sign in with Apple and/or**  
* **Google Sign-In,**  
  **handled through Firebase Auth.**

**You agree to provide accurate information and keep it up to date.**

### **4.2 Account security**

**Your account is associated with a unique identifier (UID) generated by Firebase and linked to your Apple/Google account.**

**You are responsible for keeping your Apple/Google credentials confidential and for all activity under your account. If you suspect unauthorized access:**

* **change your Apple/Google credentials; and**  
* **contact us at contact.gb.entreprise@gmail.com if you believe your Pawder account has been compromised.**

---

## **5. Minimum Age**

**The App is not intended for users under 16.**

**By using the App, you represent and warrant that:**

* **you are at least 16 years old; and**  
* **you have the legal capacity to enter into a contract.**

**If you are a parent/guardian and believe a child under 16 is using the App without your permission, contact us at contact.gb.entreprise@gmail.com to request deletion of the account and associated data.**

---

## **6. Using the App**

### **6.1 General rules**

**You agree to use the App:**

* **in compliance with applicable laws;**  
* **in accordance with these Terms; and**  
* **without infringing the rights of the Publisher, other users, or third parties.**

**You must not:**

* **impersonate someone else or provide false information;**  
* **use the App for illegal, fraudulent, or harmful purposes;**  
* **attempt to bypass security measures, quotas, or technical limits;**  
* **use scripts, bots, automation, or any unauthorized means to manipulate votes, rankings, or the App.**

### **6.2 User content (pets, text, media)**

**You may create pet profiles and upload content (photos, videos, text). By posting content, you confirm that:**

* **you own it or have the necessary rights to post it (copyright, image rights, etc.);**  
* **it does not infringe third-party rights (recognizable people, trademarks, protected works, etc.);**  
* **it complies with the law and these Terms.**

**Prohibited content includes (without limitation):**

* **violent, hateful, discriminatory, or insulting content;**  
* **sexual/pornographic content or inappropriate content involving animals;**  
* **content encouraging animal abuse, violence, or illegal acts;**  
* **spam, scams, hidden advertising, chain messages;**  
* **content infringing privacy (personal data, faces of non-consenting people, etc.).**

### **6.3 License to use your content**

**You retain ownership of the rights to the content you post.**

**However, by posting content in the App, you grant the Publisher a non-exclusive, royalty-free, worldwide, revocable license, for as long as the content or your account exists, to:**

* **host, store, reproduce, and display it within the App (deck, profiles, leaderboards);**  
* **make minor technical adaptations (compression, resizing, etc.).**

**This license is strictly limited to operating the App and internal promotion within the App (e.g., showcasing content on in-app screens).**

**You may delete your content and/or your account at any time. After deletion, we will make reasonable efforts to remove content from the App and our systems, subject to temporary technical backups or already anonymized/aggregated data.**

---

## **7. Voting, Rankings, and Quotas**

**The App allows you to:**

* **browse pets;**  
* **vote (like / super vote);**  
* **view rankings (weekly leaderboard, Hall of Fame, etc.).**

**Quotas (votes, super votes) and limits (e.g., number of active pets) may apply, especially for free accounts. Premium accounts may have different quotas.**

**Current limits are shown in the App and may change over time.**

**Quotas, scores, and rankings have no contractual or financial value and do not grant any real prize or reward.**

---

## **8. Ads and Rewards**

**The App may display ads, including rewarded ads (e.g., to earn additional votes). Ads are provided by third-party services (e.g., Google/AdMob).**

* **Ads are subject to your consent (see the Privacy Policy).**  
* **Rewarded ads may grant in-app bonuses with no monetary value.**  
* **The Publisher is not responsible for ad content, to the extent permitted by law.**

---

## **9. Premium Subscription and In-App Purchases**

### **9.1 Premium offer**

**The App offers a Premium subscription via In-App Purchase (e.g., monthly subscription \`com.pawder.premium_monthly\`).**

**The exact price is displayed by Apple in your local currency at purchase time.**

**Premium benefits may include (for example):**

* **higher vote/super vote quotas;**  
* **higher or removed limits on pets;**  
* **other features described in the App.**

**Premium features may change over time. Up-to-date descriptions are shown in the App at subscription time.**

### **9.2 Subscription management**

**In-App Purchases and subscriptions are managed exclusively by Apple via the App Store (purchase, payment, auto-renewal, cancellation, and any refunds). You can manage your subscription in your Apple account settings.**

### **9.3 Refunds**

**We do not process refunds directly. Any refund request must be submitted to Apple through App Store procedures.**

---

## **10. Account Deletion**

**You can delete your account:**

* **in the App settings ("Delete my account"); or**  
* **by contacting us at contact.gb.entreprise@gmail.com.**

**Deleting your account results, where possible, in deletion of:**

* **your profile;**  
* **your pets and associated media;**  
* **your votes, favorites, reports, quotas;**  
* **your authentication data on our systems (excluding Apple/Google).**

**Note: deleting your Pawder account does not automatically cancel your App Store subscription. You must cancel Premium through your Apple account to prevent renewal.**

---

## **11. Moderation and Content Removal**

**The App provides a reporting system for inappropriate content.**

**We may, at our sole discretion and without prior notice:**

* **remove content that is clearly unlawful or violates these Terms;**  
* **temporarily hide/disable content pending review;**  
* **suspend or delete a user account for serious or repeated violations.**

**We are not required to justify every moderation decision, but we may do so when reasonable.**

---

## **12. Publisher's Intellectual Property**

**All elements of the App (texts, graphics, logo, UI, features, code, databases, etc.), excluding user content, are the exclusive property of the Publisher or licensed to the Publisher.**

**Any reproduction, representation, modification, exploitation, or adaptation, in whole or in part, without prior written permission is prohibited.**

---

## **13. Liability**

### **13.1 Availability**

**We strive to keep the App available, but we do not guarantee:**

* **no bugs, errors, or interruptions;**  
* **permanent compatibility with every device/OS version;**  
* **continuous service.**

**We may temporarily suspend access for maintenance, technical reasons, or security.**

### **13.2 Use of the App**

**The App is provided "as is" for entertainment purposes. To the extent permitted by law, we are not liable for:**

* **indirect damages (data loss, loss of opportunity, lost profits, etc.);**  
* **consequences related to rankings, votes, or statistics;**  
* **user-posted content, which remains the users' responsibility.**

**To the extent permitted by law, our total liability is limited to the amount you may have paid us in the last twelve (12) months (excluding amounts paid to Apple).**

---

## **14. Personal Data**

**Personal data processing is described in the Privacy Policy, available in the App and/or via an external link.**

**By using the App, you agree to these Terms and acknowledge that you have read the Privacy Policy. You can exercise your rights by contacting contact.gb.entreprise@gmail.com.**

---

## **15. Severability**

**If any provision of these Terms is found invalid or unenforceable, the remaining provisions remain in full force.**

---

## **16. Governing Law and Jurisdiction**

**These Terms are governed by French law.**

**In the event of a dispute and absent an amicable resolution, the competent courts will be those within the jurisdiction of the Court of Appeal of Versailles (and more specifically Nanterre), subject to any mandatory consumer jurisdiction rules.**

---

## **17. Contact**

**For any questions about these Terms, the App, or your account:**  
**contact.gb.entreprise@gmail.com**

---

© 2025 Pawder. All rights reserved.`
}

export default function CGUPage() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au portfolio
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === 'fr' ? 'Conditions Générales d\'Utilisation' : 'Terms of Use'}
              </h1>
              <p className="text-gray-600">
                {language === 'fr' ? 'Application Pawder' : 'Pawder Application'}
              </p>
            </div>
          </div>
          
          <LanguageToggle onLanguageChange={setLanguage} />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="prose prose-purple max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {cguContent[language]}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
