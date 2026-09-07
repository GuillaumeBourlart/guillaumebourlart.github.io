# **Politique de confidentialité — Pawder (FR)**

**Politique de confidentialité de l’application Pawder**  
**Dernière mise à jour : 10/12/2025**

**L’application mobile Pawder (ci-après « l’Application ») est éditée par Guillaume Paul Raoul BOURLART, entrepreneur individuel, immatriculé sous le numéro SIREN 883 345 522, dont le siège est situé 1 Avenue Maurice, 92270 Bois-Colombes, France (ci-après « l’Éditeur », « nous »).**

**La présente politique de confidentialité (la « Politique ») explique de manière claire quelles données personnelles sont collectées via l’Application, pour quelles finalités, sur quelle base juridique, avec qui elles sont partagées et quels sont vos droits.**

**En utilisant l’Application, vous reconnaissez avoir pris connaissance de la présente Politique. Lorsque certains traitements nécessitent un consentement (par exemple Analytics ou publicités), celui-ci vous est demandé séparément.**

**Portée internationale : l’Application est accessible dans plusieurs pays. Si des lois locales vous accordent des droits supplémentaires, ces droits s’appliquent également.**

---

## **1\. Responsable du traitement**

**Responsable du traitement**  
**Guillaume Paul Raoul BOURLART**  
**1 Avenue Maurice**  
**92270 Bois-Colombes – France**  
**Email de contact (support & données personnelles) : contact.gb.entreprise@gmail.com**

**L’Éditeur détermine les finalités et les moyens des traitements de données mis en œuvre via l’Application.**

---

## **2\. Données collectées**

**Nous ne collectons que les données nécessaires au fonctionnement de l’Application, à la fourniture de ses fonctionnalités (création d’animaux, votes, classements), à la gestion de l’abonnement Premium et, si vous y consentez, à la mesure d’audience et à l’affichage de publicités.**

### **2.1 Données de compte**

**Lors de la création et de l’utilisation de votre compte via Apple ou Google (via Firebase Auth), nous pouvons traiter notamment :**

* **Identifiant unique utilisateur (UID Firebase)**  
* **Adresse e-mail (si fournie par Apple/Google)**  
* **Nom d’affichage (displayName, si fourni)**  
* **Identifiant technique d’appareil (deviceId, par ex. `ios-{UUID}`)**  
* **Informations techniques liées à l’authentification transmises indirectement par Apple/Google à Firebase**

**Ces données sont nécessaires pour :**

* **créer et gérer votre compte utilisateur ;**  
* **vous permettre de vous connecter ;**  
* **lier vos animaux, votes et favoris à votre profil.**

### **2.2 Données relatives à vos animaux (contenu utilisateur)**

**Lorsque vous créez ou modifiez une fiche d’animal, vous nous fournissez volontairement :**

* **Nom de l’animal**  
* **Espèce (chat, chien, etc., parmi une liste prédéfinie)**  
* **Race (facultatif)**  
* **Date de naissance (facultative)**  
* **Pays (code ISO2, par défaut « France »)**  
* **Sexe (mâle, femelle, non déterminé)**  
* **Description courte (texte limité en longueur)**  
* **Médias : au moins une photo de couverture et, éventuellement, jusqu’à deux médias supplémentaires (photos ou courtes vidéos)**

**Ces données constituent du contenu utilisateur que vous choisissez de publier. Selon l’état de validation et les paramètres de visibilité, ces fiches peuvent être :**

* **visibles par les autres utilisateurs de l’Application (mode public) ;**  
* **visibles uniquement par vous (par exemple en cas de brouillon ou de mise en revue/modération).**

### **2.3 Données d’usage et de fonctionnement**

**Pour faire fonctionner le système de vote et de classement, nous stockons notamment :**

* **Vos votes sur les animaux (pass, vote simple, super vote)**  
* **Vos favoris**  
* **Votre historique de votes (date/heure, animal concerné)**  
* **Statistiques relatives aux animaux (votes, super votes, score d’« aura », rangs, etc.)**  
* **Compteurs d’impressions (nombre de fois où un animal a été vu)**  
* **Vos quotas (votes restants, super votes restants, visionnage de publicités, limites Premium, etc.)**

### **2.4 Données techniques**

**Nous traitons par ailleurs certaines données techniques, telles que :**

* **Identifiant technique d’appareil (deviceId) généré par l’Application et conservé localement et côté serveur tant que le compte existe**  
* **Token de notification (FCM token) permettant l’envoi de notifications push**  
* **Horodatages (création, modification, dernière ouverture, dates de votes, etc.)**  
* **Données techniques générées par Firebase (identifiants internes, journaux techniques)**

**Ces données sont utilisées pour assurer le bon fonctionnement technique du service, la stabilité des opérations (par exemple éviter des doublons) et, le cas échéant, l’envoi de notifications.**

### **2.5 Données relatives aux achats In-App (abonnement Premium)**

**Lorsque vous souscrivez un abonnement Premium via l’App Store :**

* **nous récupérons l’identifiant du produit (ex. `com.pawder.premium_monthly`) ;**  
* **un reçu chiffré (receipt) fourni par Apple peut être transmis à notre backend afin de vérifier la validité de l’abonnement ;**  
* **nous enregistrons un indicateur de statut Premium (ex. `isPremium`) dans votre profil utilisateur.**

**Les informations de paiement (ex. carte bancaire) sont traitées exclusivement par Apple. Nous n’y avons jamais accès.**

### **2.6 Signalements et modération**

**Lorsque vous signalez un contenu ou un animal, nous collectons :**

* **votre UID**  
* **l’identifiant de l’animal signalé**  
* **une catégorie de signalement (contenu inapproprié, abus, spam, etc.)**  
* **un commentaire optionnel**  
* **des informations de suivi (statut, date, décision, éventuellement identifiant du modérateur)**

**Ces données servent à la modération et à la lutte contre les abus.**

---

## **3\. Finalités et bases juridiques**

### **3.1 Fourniture de l’Application et exécution du contrat**

**Base juridique : exécution du contrat (article 6(1)(b) RGPD)**

* **Création, gestion et suppression de compte**  
* **Gestion des animaux, votes, favoris, classements**  
* **Gestion des quotas et du statut gratuit / Premium**  
* **Synchronisation des données entre appareils**  
* **Gestion technique (stockage médias, affichage, etc.)**

**Sans ces traitements, l’Application ne peut pas fonctionner.**

### **3.2 Sécurité et prévention des abus**

**Base juridique : intérêt légitime (article 6(1)(f) RGPD)**

* **Protection contre les abus (automatisations, multi-votes massifs, etc.)**  
* **Sécurité (ex. Firebase App Check, deviceId)**  
* **Gestion des signalements et modération**  
* **Journaux techniques temporaires pour diagnostic et sécurité**

### **3.3 Mesure d’audience (Analytics)**

**Base juridique : consentement (article 6(1)(a) RGPD)**  
**Nous pouvons utiliser Firebase Analytics pour mesurer l’audience et améliorer l’Application.**  
**Ce traitement n’est activé que si vous l’autorisez via l’écran de consentement.**  
**Vous pouvez refuser ; l’Application reste utilisable.**

### **3.4 Publicités (AdMob) et suivi publicitaire**

**Base juridique : consentement \+ App Tracking Transparency (ATT) d’Apple**  
**Nous utilisons Google Mobile Ads (AdMob) pour afficher des publicités (notamment récompensées).**  
**Les publicités ne sont chargées que si :**

* **vous avez consenti aux publicités dans l’écran de consentement, et**  
* **vous avez répondu à la fenêtre ATT d’Apple (ce qui détermine le niveau de personnalisation possible).**

**En cas de refus, nous limitons l’utilisation des services publicitaires et, lorsque applicable, privilégions des publicités non personnalisées.**

### **3.5 Notifications push**

**Base juridique : intérêt légitime et/ou consentement (selon votre appareil)**  
**Nous utilisons Firebase Cloud Messaging (FCM) pour vous envoyer des notifications (activité de vos animaux, nouveautés, etc.).**  
**Vous pouvez désactiver les notifications à tout moment dans les réglages iOS.**

---

## **4\. Destinataires et sous-traitants**

**Vos données peuvent être transmises aux destinataires suivants, en tant que sous-traitants ou partenaires techniques :**

* **Google Firebase / Google Cloud Platform : Auth, Firestore, Storage, Cloud Functions, FCM, Analytics (si consentement)**  
* **Google Mobile Ads (AdMob) : publicités (si consentement)**  
* **Apple : Sign in with Apple, StoreKit, gestion des achats et paiements**

**Nous ne revendons pas vos données. Nous ne les partageons qu’aux prestataires nécessaires au fonctionnement du service, dans un cadre contractuel.**

---

## **5\. Durée de conservation**

**Nous conservons vos données pendant des durées limitées :**

* **Compte / profil : pendant la durée de vie du compte, puis suppression après suppression du compte ou demande, sauf obligations légales ou intérêts légitimes (ex. sécurité)**  
* **Animaux / votes / favoris : pendant l’existence du compte ou de la fiche concernée**  
* **Données techniques / logs : conservation limitée, notamment pour diagnostic et sécurité (durées variables selon les politiques des prestataires)**  
* **Statut Premium : le temps nécessaire à la gestion du statut (actif/expiré) et aux vérifications liées aux transactions via Apple**  
* **Consentements (Analytics / Publicités) : tant que votre compte existe ou jusqu’à modification/suppression**

**En cas de suppression de compte, nous procédons à la suppression des données liées à votre profil, animaux, votes, favoris, signalements et médias selon les mécanismes prévus. Certaines données agrégées ou anonymisées peuvent être conservées.**

---

## **6\. Transferts hors de l’Union européenne**

**Les services que nous utilisons (Firebase, AdMob, Apple) peuvent impliquer un traitement de données en dehors de l’Union européenne, notamment aux États-Unis (par exemple en raison de la région d’exécution de certaines fonctions backend).**

**Lorsque des transferts hors UE ont lieu, ils sont encadrés par des garanties appropriées conformément à la réglementation applicable (par exemple des clauses contractuelles types et/ou d’autres mécanismes reconnus), ainsi que par des mesures de sécurité mises en place par nos prestataires.**

---

## **7\. Vos droits**

**Conformément au RGPD et à la législation française applicable, vous disposez notamment des droits suivants :**

* **Accès, rectification, effacement**  
* **Limitation du traitement**  
* **Opposition (notamment aux traitements fondés sur l’intérêt légitime)**  
* **Portabilité (dans les conditions prévues)**  
* **Retrait du consentement à tout moment pour les traitements fondés sur le consentement**

### **Exercice de vos droits**

**Vous pouvez :**

* **supprimer votre compte via les paramètres de l’Application ; ou**  
* **nous contacter : contact.gb.entreprise@gmail.com**

**Nous pourrons demander des informations complémentaires pour vérifier votre identité.**  
**Vous pouvez également déposer une réclamation auprès de l’autorité compétente (en France : CNIL).**

---

## **8\. Enfants et âge minimum**

**L’Application n’est pas destinée aux utilisateurs de moins de 16 ans.**  
**En utilisant l’Application, vous déclarez être âgé d’au moins 16 ans.**

**Si vous êtes parent ou représentant légal et pensez qu’un enfant nous a fourni des données personnelles, contactez-nous à contact.gb.entreprise@gmail.com afin de demander la suppression du compte et des données associées.**

---

## **9\. Consentement et réglages de confidentialité**

**Lors de votre première connexion, un écran de consentement vous permet :**

* **d’accepter ou refuser la mesure d’audience (Analytics) ;**  
* **d’accepter ou refuser les publicités (AdMob) ;**  
* **de choisir d’accepter tout, partiellement, ou de refuser tout.**

**Le refus n’empêche pas l’utilisation de l’Application, mais peut désactiver certaines fonctionnalités (ex. publicités récompensées, statistiques).**

**Vous pouvez modifier vos choix (si disponible dans l’Application) ou nous contacter : contact.gb.entreprise@gmail.com.**

---

## **10\. Sécurité**

**Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables : services sécurisés, chiffrement TLS, règles d’accès (Firestore Security Rules), suppression lors de la suppression de compte, etc.**  
**Aucun système n’étant parfaitement sécurisé, nous ne pouvons garantir une sécurité absolue.**

---

## **11\. Modifications de la Politique**

**Nous pouvons modifier cette Politique pour tenir compte d’évolutions techniques, fonctionnelles ou légales.**  
**En cas de modification importante, nous vous informerons via l’Application et/ou tout moyen approprié. La version la plus récente reste disponible via l’Application et/ou l’URL de référence.**

---

## **12\. Contact**

**Pour toute question relative à cette Politique ou à vos données personnelles :**  
**contact.gb.entreprise@gmail.com**

---

---

# **Privacy Policy — Pawder (EN)**

**Pawder Privacy Policy**  
**Last updated: 10/12/2025**

**The Pawder mobile application (the “App”) is published by Guillaume Paul Raoul BOURLART, acting as a sole proprietor (entrepreneur individuel), registered under SIREN 883 345 522, with its registered address at 1 Avenue Maurice, 92270 Bois-Colombes, France (the “Publisher”, “we”, “us”).**

**This Privacy Policy (the “Policy”) explains what personal data is collected through the App, for what purposes, on what legal basis, with whom it may be shared, and what rights you have.**

**By using the App, you acknowledge that you have read this Policy. Where a specific processing activity requires your consent (for example, Analytics or advertising), we will request it separately.**

**International scope: the App may be available in multiple countries. If local laws grant you additional rights, those rights remain applicable.**

---

## **1\. Data Controller**

**Data Controller**  
**Guillaume Paul Raoul BOURLART**  
**1 Avenue Maurice**  
**92270 Bois-Colombes – France**  
**Contact email (support & privacy): contact.gb.entreprise@gmail.com**

**The Publisher determines the purposes and means of the data processing carried out through the App.**

---

## **2\. Data We Collect**

**We only collect data that is necessary to operate the App, provide its features (pet profiles, voting, rankings), manage the Premium subscription, and—if you consent—measure usage and display ads.**

### **2.1 Account Data**

**When you create and use an account via Apple or Google (through Firebase Auth), we may process:**

* **Unique user identifier (Firebase UID)**  
* **Email address (if provided by Apple/Google)**  
* **Display name (if provided)**  
* **Technical device identifier (deviceId, e.g., `ios-{UUID}`)**  
* **Technical authentication information indirectly transmitted by Apple/Google to Firebase**

**This data is required to:**

* **create and manage your user account;**  
* **allow you to sign in;**  
* **link your pets, votes, and favorites to your profile.**

### **2.2 Pet Profile Data (User Content)**

**When you create or edit a pet profile, you voluntarily provide:**

* **Pet name**  
* **Species (cat, dog, etc., from a predefined list)**  
* **Breed (optional)**  
* **Date of birth (optional)**  
* **Country (ISO2 code, default “France”)**  
* **Sex (male, female, unspecified)**  
* **Short description (limited length)**  
* **Media: at least one cover photo and up to two additional media items (photos or short videos)**

**This is user-generated content you choose to publish. Depending on validation and visibility settings, profiles may be:**

* **visible to other App users (public mode); or**  
* **visible only to you (e.g., drafts or under review/moderation).**

### **2.3 Usage and Operational Data**

**To operate voting and rankings, we store:**

* **Your votes (skip, like, super vote)**  
* **Your favorites**  
* **Your vote history (date/time, related pet)**  
* **Pet statistics (votes, super votes, “aura” score, ranks, etc.)**  
* **Impression counters (how many times a pet was shown)**  
* **Quotas (remaining votes, remaining super votes, rewarded ads limits, Premium limits, etc.)**

### **2.4 Technical Data**

**We also process certain technical data such as:**

* **Technical device identifier (deviceId) generated by the App and kept locally and server-side while the account exists**  
* **Push notification token (FCM token)**  
* **Timestamps (creation, update, last app open, vote dates, etc.)**  
* **Technical data generated by Firebase services (internal identifiers, technical logs)**

**This data is used to ensure proper operation, prevent duplicates, and—where applicable—send notifications.**

### **2.5 In-App Purchases (Premium Subscription)**

**When you subscribe to Premium via the App Store:**

* **we retrieve the product identifier (e.g., `com.pawder.premium_monthly`);**  
* **an encrypted Apple receipt may be sent to our backend to verify subscription validity;**  
* **we store a Premium status flag (e.g., `isPremium`) in your user profile.**

**Payment information (such as card details) is processed exclusively by Apple. We never access it.**

### **2.6 Reports and Moderation**

**When you report content or a pet, we collect:**

* **your UID**  
* **the reported pet identifier**  
* **a report category (inappropriate content, abuse, spam, etc.)**  
* **an optional comment**  
* **follow-up details (status, date, decision, potentially moderator identifier)**

**This is used for moderation and abuse prevention.**

---

## **3\. Purposes and Legal Bases**

### **3.1 Providing the App and Performing the Contract**

**Legal basis: performance of a contract (GDPR Art. 6(1)(b))**

* **Account creation, management, and deletion**  
* **Managing pets, votes, favorites, rankings**  
* **Applying quotas and Free/Premium status**  
* **Sync across devices**  
* **Technical operations (media storage, display, etc.)**

**Without these processes, the App cannot function.**

### **3.2 Security and Abuse Prevention**

**Legal basis: legitimate interests (GDPR Art. 6(1)(f))**

* **Preventing abuse (automations, mass voting, etc.)**  
* **Security mechanisms (e.g., Firebase App Check, deviceId)**  
* **Handling reports and moderation**  
* **Temporary technical logs for diagnostics and security**

### **3.3 Analytics**

**Legal basis: your consent (GDPR Art. 6(1)(a))**  
**We may use Firebase Analytics to measure usage and improve the App.**  
**Analytics is enabled only if you allow it via the consent screen.**  
**You can refuse; the App remains usable.**

### **3.4 Ads (AdMob) and Advertising Tracking**

**Legal basis: your consent \+ Apple App Tracking Transparency (ATT)**  
**We use Google Mobile Ads (AdMob) to display ads (including rewarded ads).**  
**Ads are loaded only if:**

* **you consent to ads in the consent screen; and**  
* **you respond to Apple’s ATT prompt (which determines the level of ad personalization).**

**If you refuse, we limit ad services and, where applicable, prefer non-personalized ads.**

### **3.5 Push Notifications**

**Legal basis: legitimate interests and/or consent (depending on your device settings)**  
**We use Firebase Cloud Messaging (FCM) to send notifications (rankings, pet activity, updates, etc.).**  
**You can disable notifications anytime in iOS settings.**

---

## **4\. Recipients and Processors**

**Your data may be shared with the following service providers (processors) as necessary:**

* **Google Firebase / Google Cloud Platform: Auth, Firestore, Storage, Cloud Functions, FCM, Analytics (if consented)**  
* **Google Mobile Ads (AdMob): ads (if consented)**  
* **Apple: Sign in with Apple, StoreKit, subscription and payment management**

**We do not sell your personal data. We share it only with providers required to operate the service, under contractual safeguards.**

---

## **5\. Data Retention**

**We retain data for limited periods:**

* **Account/profile: for as long as your account exists, then deleted upon account deletion or request, subject to legal obligations or legitimate interests (e.g., security)**  
* **Pets/votes/favorites: while your account or the relevant profile exists**  
* **Technical data/logs: limited retention for diagnostics and security (durations vary by provider policies)**  
* **Premium status: as needed to manage active/expired status and verify App Store transactions**  
* **Consents (Analytics/Ads): while your account exists or until you change/delete them**

**Upon account deletion, we delete your profile data, pets, votes, favorites, reports, and media according to our automated processes. Aggregated or anonymized data may be retained.**

---

## **6\. International Data Transfers**

**Our providers (Firebase, AdMob, Apple) may process data outside the European Union, including in the United States (for example due to certain backend execution regions).**

**Where international transfers occur, they are protected by appropriate safeguards in accordance with applicable law (such as Standard Contractual Clauses and/or other recognized mechanisms), along with security measures implemented by our providers.**

---

## **7\. Your Rights**

**Under the GDPR and applicable French law, you may have rights including:**

* **access, rectification, deletion**  
* **restriction**  
* **objection (notably to legitimate-interest processing)**  
* **portability (where applicable)**  
* **withdrawal of consent at any time for consent-based processing**

### **How to exercise your rights**

**You can:**

* **delete your account in the App settings; or**  
* **contact us at contact.gb.entreprise@gmail.com**

**We may request additional information to verify your identity.**  
**You may also lodge a complaint with the competent authority (in France: CNIL).**

---

## **8\. Children and Minimum Age**

**The App is not intended for users under 16\. By using the App, you confirm you are at least 16\.**

**We do not knowingly collect personal data from children under 13\.**  
**If you are a parent/guardian and believe a child has provided us with personal data, contact us at contact.gb.entreprise@gmail.com to request deletion of the account and associated data.**

---

## **9\. Consent and Privacy Settings**

**On first sign-in, a consent screen allows you to:**

* **allow or refuse Analytics;**  
* **allow or refuse Ads (AdMob);**  
* **accept all, partially accept, or refuse all.**

**Refusing does not prevent use of the App, but may disable certain features (e.g., rewarded ads, advanced stats).**

**You can change your choices (where available in the App) or contact us at contact.gb.entreprise@gmail.com.**

---

## **10\. Security**

**We implement reasonable technical and organizational measures (secure providers, TLS encryption, access rules, deletion on account deletion, etc.).**  
**No system is perfectly secure; we cannot guarantee absolute security.**

---

## **11\. Changes to This Policy**

**We may update this Policy to reflect technical, functional, or legal changes.**  
**If changes are significant, we will notify you in the App and/or by appropriate means. The latest version remains available in the App and/or via the reference URL.**

---

## **12\. Contact**

**For any questions about this Policy or your personal data:**  
**contact.gb.entreprise@gmail.com**

