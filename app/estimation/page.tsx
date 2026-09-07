'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { ArrowLeft, Briefcase, Calculator, Copy, Globe, Linkedin, Mail, RefreshCcw } from 'lucide-react'

type Option = {
  value: string
  label: string
  exclusive?: boolean
  recommended?: boolean
}

type Question = {
  id: string
  number: number
  title: string
  description?: string
  options: Option[]
  multi?: boolean
  excludeFromPrompt?: boolean
}

type Responses = Record<string, string | string[]>

const contactLinks = [
  {
    icon: Mail,
    label: 'Email',
    href: 'mailto:contact.gb.entreprise@gmail.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Briefcase,
    label: 'Malt',
    href: 'https://www.malt.fr/profile/guillaumebourlart',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Globe,
    label: 'Fiverr',
    href: 'https://fr.fiverr.com/s/wkjllxw',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/guillaume-bourlart-419103210',
    color: 'from-blue-600 to-blue-700',
  },
]

const commonQuestions: Question[] = [
  {
    id: 'common_projectType',
    number: 1,
    title: 'Quel type de projet souhaitez-vous ?',
    options: [
      { value: 'site', label: 'Site web' },
      { value: 'ios', label: 'Application iPhone' },
    ],
  },
  {
    id: 'common_goal',
    number: 2,
    title: "Quel est l'objectif principal du projet ?",
    description: 'Choisissez l’objectif le plus central du projet, même si plusieurs réponses semblent vraies.',
    options: [
      { value: 'present_activity', label: 'Présenter mon activité / mon entreprise' },
      { value: 'present_services', label: 'Présenter mes services' },
      { value: 'present_work', label: 'Présenter mes réalisations / mon portfolio' },
      { value: 'validate_market', label: 'Tester une idée rapidement (validation de marché)' },
      { value: 'contacts', label: 'Obtenir des demandes de contact' },
      { value: 'quotes', label: 'Obtenir des devis' },
      { value: 'appointments', label: 'Permettre la prise de rendez-vous' },
      { value: 'sell_products', label: 'Vendre des produits' },
      { value: 'sell_services', label: 'Vendre des services' },
      { value: 'retention', label: "Fidéliser les utilisateurs / clients existants" },
      { value: 'save_time', label: 'Gagner du temps sur des tâches répétitives' },
      { value: 'booking', label: 'Gérer des réservations' },
      { value: 'personal_space', label: 'Donner accès à un espace personnel' },
      { value: 'user_interactions', label: "Permettre à des utilisateurs d'interagir entre eux" },
      { value: 'data_hub', label: 'Centraliser / afficher des informations' },
      { value: 'automation', label: 'Automatiser une tâche ou un processus' },
      { value: 'internal_activity', label: "Gérer une activité interne d'entreprise" },
      { value: 'matching_users', label: "Mettre en relation plusieurs types d'utilisateurs" },
      { value: 'community_platform', label: 'Créer une plateforme communautaire' },
      { value: 'business_tool', label: 'Créer un outil métier spécifique' },
      { value: 'game', label: 'Créer un jeu ou une expérience ludique' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'common_level',
    number: 3,
    title: 'Quel niveau de projet souhaitez-vous ?',
    description: 'En prenant en compte le design, le niveau de finition et le fonctionnement attendu.',
    excludeFromPrompt: true,
    options: [
      { value: 'mvp', label: 'MVP simple, pour lancer rapidement une première version' },
      { value: 'standard', label: 'Projet standard, propre et complet sans complexité excessive' },
      { value: 'advanced', label: 'Projet avancé, avec plusieurs fonctionnalités et un rendu plus travaillé' },
      { value: 'premium', label: 'Projet très poussé, avec beaucoup de logique, un rendu premium ou des besoins importants' },
    ],
  },
  {
    id: 'common_stage',
    number: 4,
    title: "Où en êtes-vous aujourd'hui dans votre projet ?",
    excludeFromPrompt: true,
    options: [
      { value: 'idea_general', label: "J'ai seulement une idée générale" },
      { value: 'idea_clear', label: "J'ai une idée claire du projet" },
      { value: 'feature_list', label: "J'ai une liste de fonctionnalités" },
      { value: 'spec', label: "J'ai un cahier des charges" },
      { value: 'mockups', label: "J'ai des maquettes" },
      { value: 'spec_and_mockups', label: "J'ai à la fois maquettes et cahier des charges" },
      { value: 'existing_site', label: "J'ai déjà un site existant à refaire ou améliorer" },
      { value: 'existing_ios', label: "J'ai déjà une application iPhone à refaire ou améliorer" },
      { value: 'existing_android', label: "J'ai déjà une application Android existante" },
      { value: 'existing_web', label: "J'ai déjà une version web existante" },
      { value: 'existing_backend', label: "J'ai déjà un backend / une base de données existante" },
      { value: 'several_ready', label: "J'ai plusieurs éléments déjà prêts" },
    ],
  },
  {
    id: 'common_userTypes',
    number: 5,
    title: "Combien de types d'utilisateurs différents faut-il prévoir ?",
    description: "Comptez les grands rôles fonctionnels (ex. visiteur, utilisateur, admin). Ne comptez pas les variantes mineures d'un même rôle sauf si les droits/écrans changent vraiment.",
    options: [
      { value: '1', label: "1 seul type d'utilisateur" },
      { value: '2', label: '2 types' },
      { value: '3', label: '3 types' },
      { value: '4', label: '4 types' },
      { value: '5+', label: '5 types ou plus' },
    ],
  },
  {
    id: 'common_dataComplexity',
    number: 6,
    title: 'Votre projet doit-il stocker des informations qui changent ?',
    description: 'Cela concerne toutes les données qui évoluent dans le temps : comptes, profils, contenus, historique, favoris, messages, statistiques.',
    options: [
      { value: 'none', label: 'Non' },
      { value: 'very_little', label: 'Oui, très peu' },
      { value: 'simple', label: 'Oui, quelques données simples' },
      { value: 'multiple_types', label: 'Oui, plusieurs types de données' },
      { value: 'linked', label: 'Oui, plusieurs données liées entre elles' },
      { value: 'complex', label: 'Oui, avec logique complexe entre les données' },
    ],
  },
  {
    id: 'common_externalServices',
    number: 7,
    title: 'Faut-il connecter le projet à des services tiers / outils externes ?',
    description: "Exemples : paiement, carte, login Apple/Google, analytics, IA, CRM, API métier, Firebase, notifications, agenda. Comptez ici les services sur lesquels le projet s'appuie réellement.",
    options: [
      { value: '0', label: 'Non' },
      { value: '1', label: 'Oui, 1 service' },
      { value: '2', label: 'Oui, 2 services' },
      { value: '3', label: 'Oui, 3 services' },
      { value: '4', label: 'Oui, 4 services' },
      { value: '5+', label: 'Oui, 5 services ou plus' },
    ],
  },
  {
    id: 'common_externalUsage',
    number: 8,
    title: 'À quel point ces outils externes sont importants ?',
    description: "Il s'agit de mesurer à quel point le projet peut fonctionner sans ces services externes.",
    options: [
      { value: 'none', label: 'Pas de service externe' },
      { value: 'feed_project', label: 'Service externe utile mais secondaire' },
      { value: 'business_actions', label: 'Service externe important pour certaines fonctions' },
      { value: 'important_logic', label: 'Plusieurs fonctions clés dépendent de ces services' },
      { value: 'strong_dependency', label: 'Le produit repose fortement dessus' },
    ],
  },
]

const siteQuestions: Question[] = [
  {
    id: 'site_type',
    number: 9,
    title: 'Quel type de site web souhaitez-vous ?',
    options: [
      { value: 'landing', label: 'Landing page' },
      { value: 'sales_page', label: 'Page de vente' },
      { value: 'showcase_simple', label: 'Site vitrine simple' },
      { value: 'showcase_premium', label: 'Site vitrine premium' },
      { value: 'company', label: "Site de présentation d'entreprise" },
      { value: 'institutional', label: 'Site institutionnel' },
      { value: 'portfolio', label: 'Portfolio' },
      { value: 'blog', label: 'Blog' },
      { value: 'media', label: 'Magazine / média' },
      { value: 'event', label: 'Site événementiel' },
      { value: 'directory', label: 'Annuaire' },
      { value: 'appointment_site', label: 'Site avec prise de rendez-vous' },
      { value: 'member_space', label: 'Site avec espace membre' },
      { value: 'ecommerce_simple', label: 'E-commerce simple' },
      { value: 'ecommerce_large', label: 'E-commerce avec catalogue plus large' },
      { value: 'platform', label: 'Plateforme web' },
      { value: 'dashboard', label: 'Dashboard / interface de gestion' },
      { value: 'intranet', label: 'Intranet / outil interne' },
      { value: 'marketplace', label: 'Marketplace' },
      { value: 'social_web', label: 'Réseau social web' },
      { value: 'comparator', label: 'Comparateur' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'site_pages',
    number: 10,
    title: 'Combien de pages faut-il environ ?',
    description: 'Comptez les pages réellement différentes dans leur structure ou usage. Les popups/modales/variantes mineures ne comptent pas forcément séparément.',
    options: [
      { value: '1', label: '1 page' },
      { value: '2-3', label: '2 à 3 pages' },
      { value: '4-6', label: '4 à 6 pages' },
      { value: '7-10', label: '7 à 10 pages' },
      { value: '11-15', label: '11 à 15 pages' },
      { value: '16-25', label: '16 à 25 pages' },
      { value: '25+', label: 'Plus de 25 pages' },
      { value: 'unknown', label: 'Je ne sais pas encore' },
    ],
  },
  {
    id: 'site_auth',
    number: 11,
    title: 'Les visiteurs doivent-ils pouvoir créer un compte et se connecter ?',
    description: 'Connexion simple = juste se connecter. Profil = infos personnelles/historique. Plusieurs rôles = ex. utilisateur/admin. Logique avancée = permissions/statuts/workflows plus poussés.',
    options: [
      { value: 'none', label: 'Non' },
      { value: 'simple', label: 'Oui, connexion simple' },
      { value: 'profile', label: 'Oui, avec profil utilisateur' },
      { value: 'roles', label: 'Oui, avec plusieurs rôles' },
      { value: 'advanced', label: 'Oui, avec espace membre important' },
    ],
  },
  {
    id: 'site_database',
    number: 12,
    title: 'Quel niveau de gestion de données faut-il prévoir ?',
    description: 'Si vous hésitez, Firebase est souvent un bon choix pour démarrer rapidement.',
    options: [
      { value: 'none', label: 'Non' },
      { value: 'firebase', label: 'Oui, avec Firebase (recommandé)', recommended: true },
      { value: 'simple', label: 'Oui, simple' },
      { value: 'multiple', label: 'Oui, avec plusieurs types de données' },
      { value: 'custom_complex', label: 'Oui, système personnalisé plus complexe' },
      { value: 'unknown', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'site_admin',
    number: 13,
    title: "Faut-il un espace d'administration ?",
    options: [
      { value: 'none', label: 'Non' },
      { value: 'few_content', label: 'Oui, pour modifier quelques contenus' },
      { value: 'content_regular', label: 'Oui, pour gérer du contenu régulièrement' },
      { value: 'users', label: 'Oui, pour gérer des utilisateurs' },
      { value: 'content_and_users', label: 'Oui, pour gérer du contenu + utilisateurs' },
      { value: 'dashboard_stats', label: 'Oui, avec tableau de bord / statistiques' },
      { value: 'business_logic', label: 'Oui, avec logique métier importante' },
      { value: 'advanced', label: 'Oui, espace admin avancé' },
    ],
  },
  {
    id: 'site_features',
    number: 14,
    title: 'Quelles fonctionnalités faut-il prévoir sur le site ?',
    multi: true,
    options: [
      { value: 'contact_form', label: 'Formulaire de contact' },
      { value: 'multiple_forms', label: 'Plusieurs formulaires' },
      { value: 'quote_request', label: 'Demande de devis' },
      { value: 'appointments', label: 'Prise de rendez-vous' },
      { value: 'calendar', label: 'Calendrier / disponibilités' },
      { value: 'blog_news', label: 'Blog / actualités' },
      { value: 'search', label: 'Moteur de recherche' },
      { value: 'filters', label: 'Filtres' },
      { value: 'gallery', label: 'Galerie / portfolio' },
      { value: 'reviews', label: 'Avis / témoignages' },
      { value: 'map', label: 'Carte / géolocalisation' },
      { value: 'member_space', label: 'Espace membre' },
      { value: 'profiles', label: 'Profils utilisateurs' },
      { value: 'payment', label: 'Paiement en ligne' },
      { value: 'cart', label: 'Panier' },
      { value: 'order_booking', label: 'Commande / réservation' },
      { value: 'subscription', label: 'Abonnement' },
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'chat', label: 'Chat / support' },
      { value: 'file_upload', label: 'Upload de fichiers' },
      { value: 'client_space_docs', label: 'Espace client (documents / factures)' },
      { value: 'stock_management', label: 'Gestion de stock' },
      { value: 'crm_sync', label: 'Synchronisation CRM / emailing' },
      { value: 'ai_assistant', label: 'Assistant IA (FAQ / aide utilisateur)' },
      { value: 'cookie_consent', label: 'Bannière cookies / consentement' },
      { value: 'import_export_csv', label: 'Import / export CSV' },
      { value: 'pdf_generation', label: 'Génération de documents / PDF' },
      { value: 'dashboard', label: 'Tableau de bord' },
      { value: 'stats', label: 'Statistiques' },
      { value: 'multilingual', label: 'Multilingue' },
      { value: 'postings', label: "Système d'annonces / publications" },
      { value: 'messaging', label: 'Messagerie interne' },
      { value: 'favorites', label: 'Système de favoris' },
      { value: 'notifications', label: 'Système de notifications' },
      { value: 'workflow', label: 'Workflow / étapes de validation' },
      { value: 'comparison', label: "Comparaison d'éléments" },
      { value: 'none', label: 'Aucune de ces fonctionnalités', exclusive: true },
    ],
  },
  {
    id: 'site_businessLogic',
    number: 15,
    title: 'Le projet a-t-il des règles de fonctionnement spécifiques ?',
    description: 'Cela concerne les règles internes : conditions, scoring, permissions, calculs, validations, automatisations, workflows, matching, etc.',
    options: [
      { value: 'none', label: 'Aucune logique particulière' },
      { value: 'simple', label: 'Quelques traitements simples' },
      { value: 'several_rules', label: 'Plusieurs règles spécifiques' },
      { value: 'heavy', label: 'Beaucoup de logique métier' },
      { value: 'core', label: 'La logique métier est au cœur du projet' },
    ],
  },
  {
    id: 'site_contentDynamics',
    number: 16,
    title: 'Le contenu du site sera plutôt :',
    options: [
      { value: 'fixed', label: 'Totalement fixe' },
      { value: 'mostly_fixed', label: 'Principalement fixe avec quelques mises à jour' },
      { value: 'regular_updates', label: 'Régulièrement mis à jour' },
      { value: 'dynamic_by_user', label: 'Dynamique selon les utilisateurs' },
      { value: 'very_dynamic', label: "Très dynamique avec beaucoup d'interactions" },
    ],
  },
  {
    id: 'site_design',
    number: 17,
    title: 'Quel niveau de design souhaitez-vous ?',
    excludeFromPrompt: true,
    options: [
      { value: 'very_simple', label: 'Très simple' },
      { value: 'clean', label: 'Sobre et propre' },
      { value: 'modern', label: 'Moderne et soigné' },
      { value: 'custom', label: 'Personnalisé' },
      { value: 'premium', label: 'Premium / haut de gamme' },
    ],
  },
  {
    id: 'site_animations',
    number: 18,
    title: "Quel niveau d'animations ou d'effets visuels souhaitez-vous ?",
    excludeFromPrompt: true,
    options: [
      { value: 'none', label: 'Aucun' },
      { value: 'very_light', label: 'Très léger' },
      { value: 'light', label: 'Léger' },
      { value: 'polished', label: 'Soigné' },
      { value: 'very_polished', label: 'Très travaillé' },
    ],
  },
  {
    id: 'site_contentReady',
    number: 19,
    title: 'Les contenus sont-ils déjà prêts ?',
    excludeFromPrompt: true,
    options: [
      { value: 'all_ready', label: 'Oui, tout est prêt' },
      { value: 'almost_ready', label: 'Presque tout est prêt' },
      { value: 'partly_ready', label: 'Une partie seulement est prête' },
      { value: 'few_ready', label: 'Très peu de contenu est prêt' },
      { value: 'none_ready', label: "Rien n'est prêt" },
      { value: 'need_help', label: "Je souhaite aussi de l'aide pour structurer le contenu" },
    ],
  },
  {
    id: 'site_extras',
    number: 20,
    title: 'Faut-il prévoir en plus :',
    description: 'Cochez les éléments que vous souhaitez inclure dans la mission, en plus du développement principal.',
    multi: true,
    options: [
      { value: 'deploy', label: 'Mise en ligne' },
      { value: 'hosting', label: 'Hébergement / nom de domaine' },
      { value: 'seo_basic', label: 'SEO de base' },
      { value: 'seo_advanced', label: 'SEO plus poussé' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'fixes', label: 'Corrections après livraison' },
      { value: 'training', label: "Formation à l'utilisation" },
      { value: 'tracking_setup', label: 'Mise en place analytics / tracking' },
      { value: 'accessibility', label: 'Accessibilité (bonnes pratiques)' },
      { value: 'legal_pages', label: 'Pages légales / conformité' },
      { value: 'future_changes', label: 'Évolutions futures' },
      { value: 'none', label: 'Aucun de ces éléments', exclusive: true },
    ],
  },
]

const iosQuestions: Question[] = [
  {
    id: 'ios_type',
    number: 9,
    title: "Quel type d'application iPhone souhaitez-vous ?",
    description: 'Choisissez la catégorie qui décrit le mieux le cœur du produit, même si plusieurs options peuvent s’appliquer.',
    options: [
      { value: 'content', label: 'Application de contenu' },
      { value: 'presentation', label: 'Application de présentation' },
      { value: 'internal_tool', label: "Application d'entreprise / outil interne" },
      { value: 'productivity', label: 'Application de productivité' },
      { value: 'booking', label: 'Application de réservation' },
      { value: 'appointments', label: 'Application de prise de rendez-vous' },
      { value: 'ecommerce', label: 'Application e-commerce' },
      { value: 'delivery', label: 'Application de livraison' },
      { value: 'geolocation', label: 'Application centrée sur la position / proximité' },
      { value: 'map', label: 'Application centrée sur la carte' },
      { value: 'community', label: 'Application communautaire' },
      { value: 'social', label: 'Réseau social' },
      { value: 'messaging', label: 'Application de messagerie' },
      { value: 'classifieds', label: 'Application de petites annonces' },
      { value: 'marketplace', label: 'Marketplace' },
      { value: 'tracking', label: 'Application de suivi / gestion' },
      { value: 'health', label: 'Application santé / sport / bien-être' },
      { value: 'education', label: 'Application éducative' },
      { value: 'media', label: 'Application média / vidéo / audio' },
      { value: 'event', label: 'Application événementielle' },
      { value: 'utility', label: 'Application utilitaire' },
      { value: 'dashboard', label: 'Application avec tableau de bord / stats' },
      { value: 'game', label: 'Application de jeu' },
      { value: 'gamified', label: 'Application avec mécanique ludique / points / défis' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'ios_screens',
    number: 10,
    title: "Combien d'écrans différents faut-il environ ?",
    description: 'Comptez les écrans réellement différents. Les modales, popups ou variantes mineures ne comptent pas forcément séparément.',
    options: [
      { value: '1-3', label: '1 à 3' },
      { value: '4-6', label: '4 à 6' },
      { value: '7-10', label: '7 à 10' },
      { value: '11-15', label: '11 à 15' },
      { value: '16-25', label: '16 à 25' },
      { value: '26-40', label: '26 à 40' },
      { value: '40+', label: 'Plus de 40' },
      { value: 'unknown', label: 'Je ne sais pas encore' },
    ],
  },
  {
    id: 'ios_auth',
    number: 11,
    title: 'Les utilisateurs doivent-ils pouvoir créer un compte et se connecter ?',
    description: 'Connexion simple = juste se connecter. Profil = infos/historique. Plusieurs rôles = ex. utilisateur/admin. Logique avancée = permissions, statuts, progression ou relations plus complexes.',
    options: [
      { value: 'none', label: 'Non' },
      { value: 'simple', label: 'Oui, connexion simple' },
      { value: 'profile', label: 'Oui, avec profil utilisateur' },
      { value: 'roles', label: 'Oui, avec plusieurs rôles' },
      { value: 'advanced', label: 'Oui, avec logique utilisateur avancée' },
    ],
  },
  {
    id: 'ios_database',
    number: 12,
    title: 'Quel niveau de gestion de données faut-il prévoir ?',
    description: 'Si vous hésitez, Firebase est souvent le choix recommandé pour un MVP.',
    options: [
      { value: 'none', label: 'Non' },
      { value: 'firebase', label: 'Oui, avec Firebase (recommandé)', recommended: true },
      { value: 'simple', label: 'Oui, simple' },
      { value: 'multiple', label: 'Oui, avec plusieurs types de données' },
      { value: 'custom_complex', label: 'Oui, système personnalisé plus complexe' },
      { value: 'unknown', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'ios_backend',
    number: 13,
    title: 'Souhaitez-vous un serveur/backend sur mesure ?',
    description: 'Un backend sur mesure signifie un serveur développé spécifiquement pour le projet, au-delà de Firebase ou des services standards.',
    options: [
      { value: 'none', label: 'Non, pas de backend spécifique' },
      { value: 'existing_services_only', label: 'Non, utiliser Firebase/services existants (recommandé)', recommended: true },
      { value: 'light', label: 'Oui, légère' },
      { value: 'standard', label: 'Oui, standard' },
      { value: 'important', label: 'Oui, assez importante' },
      { value: 'complex', label: 'Oui, complexe' },
      { value: 'unknown', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'ios_nature',
    number: 14,
    title: 'Quelle est la logique principale du produit ?',
    description: "Choisissez ce qui décrit le mieux la logique principale de l'application en arrière-plan.",
    options: [
      { value: 'display_simple', label: 'Afficher du contenu simple' },
      { value: 'display_personalized', label: 'Afficher du contenu personnalisé' },
      { value: 'profiles_data', label: 'Gérer des profils et données utilisateurs' },
      { value: 'interactions', label: 'Permettre des interactions entre utilisateurs' },
      { value: 'booking_orders', label: 'Gérer des réservations / commandes / demandes' },
      { value: 'external_data', label: "S'appuyer sur des données venant d'autres services" },
      { value: 'business_calculations', label: 'Faire des calculs ou traitements métier' },
      { value: 'important_rules', label: 'Reposer sur des règles métier importantes' },
      { value: 'many_actions', label: "Gérer beaucoup d'actions utilisateur" },
      { value: 'complex_system', label: 'Reposer sur un système central assez complexe' },
      { value: 'game_mechanics', label: 'Intégrer une mécanique de jeu / score / progression' },
      { value: 'other', label: 'Autre' },
    ],
  },
  {
    id: 'ios_features',
    number: 15,
    title: "Quelles fonctionnalités faut-il prévoir dans l'application ?",
    description: 'Cochez uniquement les fonctionnalités réellement prévues dès la première version.',
    multi: true,
    options: [
      { value: 'onboarding', label: 'Onboarding' },
      { value: 'signup_login', label: 'Inscription / connexion' },
      { value: 'apple_login', label: 'Connexion Apple' },
      { value: 'google_login', label: 'Connexion Google' },
      { value: 'profile', label: 'Profil utilisateur' },
      { value: 'profile_edit', label: 'Modification du profil' },
      { value: 'content_list', label: 'Liste de contenus' },
      { value: 'detail', label: 'Fiche détail' },
      { value: 'search', label: 'Recherche' },
      { value: 'filters', label: 'Filtres / tri' },
      { value: 'favorites', label: 'Favoris' },
      { value: 'history', label: 'Historique' },
      { value: 'push', label: 'Notifications push' },
      { value: 'chat', label: 'Messagerie / chat' },
      { value: 'comments', label: 'Commentaires' },
      { value: 'likes', label: 'Likes / interactions' },
      { value: 'biometrics', label: 'Connexion biométrique (Face ID / Touch ID)' },
      { value: 'qr_scan', label: 'Scan QR / code-barres' },
      { value: 'deep_links', label: 'Liens profonds (deep links)' },
      { value: 'widgets', label: "Widgets iPhone (écran d'accueil)" },
      { value: 'calendar_sync', label: 'Synchronisation agenda / calendrier' },
      { value: 'map', label: 'Carte / géolocalisation' },
      { value: 'camera', label: 'Appareil photo' },
      { value: 'gallery', label: 'Galerie photo' },
      { value: 'video', label: 'Vidéo' },
      { value: 'upload', label: 'Upload de fichiers' },
      { value: 'payment', label: 'Paiement' },
      { value: 'subscription', label: 'Abonnement' },
      { value: 'iap', label: 'Achats intégrés' },
      { value: 'booking', label: 'Réservation / commande' },
      { value: 'dashboard', label: 'Tableau de bord (vue synthétique avec indicateurs)' },
      { value: 'stats', label: 'Statistiques (graphiques / chiffres détaillés)' },
      { value: 'realtime', label: 'Mises à jour en direct entre utilisateurs / appareils' },
      { value: 'pdf', label: 'Génération PDF / export' },
      { value: 'offline', label: 'Mode hors ligne' },
      { value: 'score', label: 'Système de points / score / progression' },
      { value: 'challenges', label: 'Défis / mécanique ludique' },
      { value: 'none', label: 'Aucune de ces fonctionnalités', exclusive: true },
    ],
  },
  {
    id: 'ios_businessLogic',
    number: 16,
    title: 'Le projet a-t-il des règles de fonctionnement spécifiques ?',
    description: 'Cela concerne les règles internes : conditions, scoring, permissions, calculs, validations, automatisations, workflows, matching, etc.',
    options: [
      { value: 'none', label: 'Aucune logique particulière' },
      { value: 'simple', label: 'Quelques traitements simples' },
      { value: 'several_rules', label: 'Plusieurs règles spécifiques' },
      { value: 'heavy', label: 'Beaucoup de logique métier' },
      { value: 'core', label: 'La logique métier est au cœur du projet' },
    ],
  },
  {
    id: 'ios_dataHandling',
    number: 17,
    title: "Quel niveau de traitement des données faut-il dans l'app ?",
    description: "Ici, on parle de la façon dont les données sont utilisées et transformées dans l'application, pas seulement stockées.",
    options: [
      { value: 'display_only', label: 'Simplement affichées' },
      { value: 'display_update', label: 'Affichées et mises à jour' },
      { value: 'verified', label: 'Vérifiées avant utilisation' },
      { value: 'crossed', label: "Croisées avec d'autres données" },
      { value: 'transformed', label: 'Transformées selon plusieurs règles' },
      { value: 'complex', label: 'Gérées avec une logique complexe' },
      { value: 'unknown', label: 'Je ne sais pas' },
    ],
  },
  {
    id: 'ios_design',
    number: 18,
    title: 'Quel niveau de design souhaitez-vous ?',
    excludeFromPrompt: true,
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'modern', label: 'Propre et moderne' },
      { value: 'polished', label: 'Soigné' },
      { value: 'custom', label: 'Personnalisé' },
      { value: 'premium', label: 'Premium / haut de gamme' },
    ],
  },
  {
    id: 'ios_animations',
    number: 19,
    title: "Quel niveau d'animations ou d'expérience visuelle souhaitez-vous ?",
    excludeFromPrompt: true,
    options: [
      { value: 'none', label: 'Aucune' },
      { value: 'very_light', label: 'Très léger' },
      { value: 'light', label: 'Léger' },
      { value: 'polished', label: 'Soigné' },
      { value: 'very_polished', label: 'Très travaillé' },
    ],
  },
  {
    id: 'ios_extras',
    number: 20,
    title: 'Faut-il prévoir en plus :',
    description: 'Cochez les éléments que vous souhaitez inclure dans la mission, en plus du développement principal.',
    multi: true,
    options: [
      { value: 'testflight', label: 'TestFlight' },
      { value: 'app_store', label: 'Publication App Store' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'post_delivery', label: 'Corrections après livraison' },
      { value: 'analytics_setup', label: 'Mise en place analytics' },
      { value: 'crash_monitoring', label: 'Monitoring des crashes' },
      { value: 'legal_compliance', label: 'Conformité légale (RGPD, mentions)' },
      { value: 'future_changes', label: 'Évolutions futures' },
      { value: 'admin_dashboard', label: 'Tableau de bord admin' },
      { value: 'back_office', label: 'Back-office web' },
      { value: 'training', label: 'Formation / accompagnement' },
      { value: 'none', label: 'Aucun de ces éléments', exclusive: true },
    ],
  },
]

const scoreByCount = (values: string[], base: number, perExtra: number, max: number) => {
  if (values.length === 0 || values.includes('none')) {
    return 0
  }
  return Math.min(base + Math.max(0, values.length - 1) * perExtra, max)
}

const roundHalf = (value: number) => Math.round(value * 2) / 2
const roundPrice = (value: number) => Math.round(value / 50) * 50

const buildHelperPrompt = (projectType: string, questions: Question[]) => {
  const projetLabel = projectType === 'site' ? 'site web' : 'application iPhone'
  const userOnlyQuestions = questions
    .filter((question) => question.excludeFromPrompt)
    .map((question) => `Q${question.number} - ${question.title}`)
    .join('\n')

  const questionList = questions
    .filter((question) => question.id !== 'common_projectType' && !question.excludeFromPrompt)
    .map((question) => {
      const options = question.options
        .map((option) => `- ${option.label}${option.recommended ? ' [recommande]' : ''}`)
        .join('\n')
      return `${question.number}. ${question.title}\n${question.description ? `${question.description}\n` : ''}${options}`
    })
    .join('\n\n')

  return `Tu es un expert produit et cadrage digital.
Je vais te decrire mon ${projetLabel}.

Ma description du projet:
[COLLE ICI LA DESCRIPTION DE TON PROJET EN DETAIL]

Objectif:
M'aider a repondre au questionnaire d'estimation ci-dessous.
Le but est de rester simple, concret et adapte a une personne non technique.

Consignes:
- Propose UNE reponse par question (ou plusieurs si la question est multi-choix).
- Donne une justification courte et simple.
- Si une option [recommande] est pertinente, privilegie-la.
- N'invente pas de besoins non mentionnes.
- Si une info manque, indique l'option la plus prudente.

Format de sortie attendu:
Q<numero> -> reponse choisie
Pourquoi: <1 phrase simple>

Questions:
${questionList}

Questions a repondre par le client lui-meme (ne pas y repondre):
${userOnlyQuestions}
`
}

export default function EstimationPage() {
  const [responses, setResponses] = useState<Responses>({})
  const [copied, setCopied] = useState(false)

  const projectType = typeof responses.common_projectType === 'string' ? responses.common_projectType : ''
  const branchQuestions = projectType === 'site' ? siteQuestions : projectType === 'ios' ? iosQuestions : []
  const projectTypeQuestion = commonQuestions[0]
  const otherQuestions = projectType ? [...commonQuestions.slice(1), ...branchQuestions] : []
  const visibleQuestions = [projectTypeQuestion, ...otherQuestions]

  const updateSingle = (id: string, value: string) => {
    setResponses((prev) => {
      const next: Responses = { ...prev, [id]: value }

      if (id === 'common_projectType') {
        Object.keys(next).forEach((key) => {
          if (value === 'site' && key.startsWith('ios_')) delete next[key]
          if (value === 'ios' && key.startsWith('site_')) delete next[key]
        })
      }

      return next
    })
  }

  const updateMulti = (question: Question, value: string) => {
    const current = Array.isArray(responses[question.id]) ? (responses[question.id] as string[]) : []
    const option = question.options.find((item) => item.value === value)
    if (!option) return

    const exclusiveValues = question.options.filter((item) => item.exclusive).map((item) => item.value)
    const isSelected = current.includes(value)

    let next: string[] = []
    if (isSelected) {
      next = current.filter((item) => item !== value)
    } else if (option.exclusive) {
      next = [value]
    } else {
      next = [...current.filter((item) => !exclusiveValues.includes(item)), value]
    }

    setResponses((prev) => ({ ...prev, [question.id]: next }))
  }

  const isAnswered = (question: Question) => {
    const value = responses[question.id]
    if (question.multi) {
      return Array.isArray(value) && value.length > 0
    }
    return typeof value === 'string' && value.length > 0
  }

  const progress = useMemo(() => {
    const answered = visibleQuestions.filter((question) => isAnswered(question)).length
    return { answered, total: visibleQuestions.length }
  }, [responses, visibleQuestions])

  const helperPrompt = useMemo(() => {
    if (projectType !== 'site' && projectType !== 'ios') {
      return ''
    }
    return buildHelperPrompt(projectType, [...commonQuestions, ...branchQuestions])
  }, [projectType, branchQuestions])

  const copyPrompt = async () => {
    if (!helperPrompt) return
    try {
      await navigator.clipboard.writeText(helperPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const renderQuestionCard = (question: Question, showUnlockHint?: boolean) => {
    const selectedSingle = typeof responses[question.id] === 'string' ? (responses[question.id] as string) : ''
    const selectedMulti = Array.isArray(responses[question.id]) ? (responses[question.id] as string[]) : []

    return (
      <motion.section
        key={question.id}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/60 border border-[#d8ddd2] rounded-2xl p-5 md:p-6"
      >
        {showUnlockHint && (
          <p className="text-[#4d6b2b] text-xs mb-3">
            Commencez par cette question pour débloquer le reste du formulaire.
          </p>
        )}
        <h2 className="text-lg md:text-xl font-semibold mb-2">
          {question.number}. {question.title}
        </h2>
        {question.description && <p className="text-[#61695f] mb-4 text-sm">{question.description}</p>}
        {question.multi && <p className="text-[#4d6b2b] text-xs mb-4">Plusieurs choix possibles</p>}

        <div className="grid sm:grid-cols-2 gap-3">
          {question.options.map((option) => {
            const selected = question.multi ? selectedMulti.includes(option.value) : selectedSingle === option.value

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => (question.multi ? updateMulti(question, option.value) : updateSingle(question.id, option.value))}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  selected
                    ? 'border-[#17251f] bg-[#d9fa68] text-[#17251f]'
                    : 'border-[#bdc5b5] bg-white/70 text-[#354330] hover:border-[#809863]'
                }`}
              >
                <span>{option.label}</span>
                {option.recommended && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 text-[11px] rounded-full bg-[#e6edda] border border-[#bbcba4] text-[#405b23]">
                    recommandé
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.section>
    )
  }

  const estimation = useMemo(() => {
    if (!visibleQuestions.every((question) => isAnswered(question))) {
      return null
    }

    const getOne = (id: string) => (typeof responses[id] === 'string' ? (responses[id] as string) : '')
    const getMany = (id: string) => (Array.isArray(responses[id]) ? (responses[id] as string[]) : [])
    const breakdown: Array<{ label: string; days: number }> = []

    const add = (label: string, days: number) => {
      if (days > 0) {
        breakdown.push({ label, days })
      }
    }

    let totalDays = 0
    const addToTotal = (label: string, days: number) => {
      totalDays += days
      add(label, days)
    }

    const siteBase: Record<string, number> = {
      landing: 1.5, sales_page: 1.5, showcase_simple: 2, showcase_premium: 3, company: 4, institutional: 4, portfolio: 3,
      blog: 4, media: 5, event: 3, directory: 5, appointment_site: 5, member_space: 6, ecommerce_simple: 6, ecommerce_large: 7,
      platform: 9, dashboard: 6, intranet: 7, marketplace: 12, social_web: 12, comparator: 11, other: 5,
    }
    const iosBase: Record<string, number> = {
      content: 4.5, presentation: 4.5, internal_tool: 7, productivity: 7, booking: 8, appointments: 8, ecommerce: 9, delivery: 10,
      geolocation: 9, map: 9, community: 11, social: 12, messaging: 12, classifieds: 12, marketplace: 14, tracking: 9, health: 9,
      education: 8, media: 9, event: 8, utility: 7, dashboard: 9, game: 14, gamified: 12, other: 8,
    }

    const commonLevel: Record<string, number> = { mvp: 0, standard: 0.75, advanced: 2.5, premium: 4 }
    const userTypes: Record<string, number> = { '1': 0, '2': 0.25, '3': 0.75, '4': 1.5, '5+': 2.5 }
    const dataComplexity: Record<string, number> = { none: 0, very_little: 0.25, simple: 0.75, multiple_types: 1.5, linked: 3, complex: 4.5 }
    const externalServices: Record<string, number> = { '0': 0, '1': 0.25, '2': 0.75, '3': 1.5, '4': 2.25, '5+': 3 }
    const externalUsage: Record<string, number> = {
      none: 0, display_simple: 0, feed_project: 1, business_actions: 2, verify_transform: 3, cross_sources: 5, important_logic: 5, strong_dependency: 6,
    }
    const authCost: Record<string, number> = { none: 0, simple: 0.75, profile: 1.5, roles: 2.5, advanced: 3.5 }
    const dbCost: Record<string, number> = { none: 0, light: 0.25, firebase: 0.5, simple: 0.75, multiple: 1.5, complex: 3, custom_complex: 3, unknown: 1.5 }
    const logicCost: Record<string, number> = { none: 0, simple: 0.75, several_rules: 2.5, heavy: 4, core: 6.5 }
    const animationsCost: Record<string, number> = { none: 0, very_light: 0.25, light: 0.75, polished: 1.5, very_polished: 3 }
    const siteDesign: Record<string, number> = { very_simple: 0, clean: 0.25, modern: 0.75, custom: 1.5, premium: 2.5 }
    const iosDesign: Record<string, number> = { standard: 0, modern: 0.25, polished: 0.75, custom: 1.5, premium: 2.5 }

    addToTotal('Niveau global du projet', commonLevel[getOne('common_level')] ?? 0)
    addToTotal("Types d'utilisateurs", userTypes[getOne('common_userTypes')] ?? 0)
    addToTotal('Complexité des données', dataComplexity[getOne('common_dataComplexity')] ?? 0)
    addToTotal('Services externes à connecter', externalServices[getOne('common_externalServices')] ?? 0)
    addToTotal('Utilisation des services externes', externalUsage[getOne('common_externalUsage')] ?? 0)

    if (projectType === 'site') {
      addToTotal('Base du projet site', siteBase[getOne('site_type')] ?? 4)
      addToTotal('Volume de pages', ({ '1': 0, '2-3': 0.5, '4-6': 1, '7-10': 2, '11-15': 3, '16-25': 5, '25+': 7, unknown: 2.5 } as Record<string, number>)[getOne('site_pages')] ?? 0)
      addToTotal('Comptes / authentification', authCost[getOne('site_auth')] ?? 0)
      addToTotal('Base de données', dbCost[getOne('site_database')] ?? 0)
      addToTotal('Espace administration', ({ none: 0, few_content: 0.25, content_regular: 0.75, users: 1.5, content_and_users: 2, dashboard_stats: 2.5, business_logic: 3.5, advanced: 4.5 } as Record<string, number>)[getOne('site_admin')] ?? 0)
      addToTotal('Fonctionnalités site', scoreByCount(getMany('site_features'), 0.25, 0.15, 3))
      addToTotal('Logique métier spécifique', logicCost[getOne('site_businessLogic')] ?? 0)
      addToTotal('Design', siteDesign[getOne('site_design')] ?? 0)
      addToTotal('Animations', animationsCost[getOne('site_animations')] ?? 0)
      addToTotal('Contenus non prêts', ({ all_ready: 0, almost_ready: 0.25, partly_ready: 0.75, few_ready: 1.5, none_ready: 2.5, need_help: 1.5 } as Record<string, number>)[getOne('site_contentReady')] ?? 0)
      const siteExtras = getMany('site_extras')
      const siteExtrasMap: Record<string, number> = {
        deploy: 0.25, hosting: 0.25, seo_basic: 0.25, seo_advanced: 1, maintenance: 0.25, fixes: 0.25, training: 0.25,
        tracking_setup: 0.25, accessibility: 0.5, legal_pages: 0.25, future_changes: 1, none: 0,
      }
      addToTotal('Éléments complémentaires', siteExtras.reduce((sum, key) => sum + (siteExtrasMap[key] ?? 0), 0))
    } else {
      addToTotal('Base du projet app iOS', iosBase[getOne('ios_type')] ?? 8)
      addToTotal("Volume d'écrans", ({ '1-3': 0, '4-6': 1, '7-10': 2, '11-15': 3, '16-25': 5, '26-40': 8, '40+': 12, unknown: 3 } as Record<string, number>)[getOne('ios_screens')] ?? 0)
      addToTotal('Comptes / authentification', authCost[getOne('ios_auth')] ?? 0)
      addToTotal('Base de données', dbCost[getOne('ios_database')] ?? 0)
      addToTotal('Backend spécifique', ({ none: 0, existing_services_only: 0.75, light: 1.5, standard: 3, important: 4.5, complex: 7, unknown: 1.5 } as Record<string, number>)[getOne('ios_backend')] ?? 0)
      addToTotal('Nature du fonctionnement', ({ display_simple: 0, display_personalized: 0.75, profiles_data: 1.5, interactions: 2.25, booking_orders: 2.25, external_data: 1.5, business_calculations: 2.25, important_rules: 3, many_actions: 3, complex_system: 4, game_mechanics: 3, other: 1.5 } as Record<string, number>)[getOne('ios_nature')] ?? 0)
      addToTotal('Fonctionnalités app', scoreByCount(getMany('ios_features'), 0.25, 0.12, 3.5))
      addToTotal('Logique métier spécifique', logicCost[getOne('ios_businessLogic')] ?? 0)
      addToTotal('Traitement des données', ({ display_only: 0, display_update: 0.75, verified: 1.5, crossed: 2.5, transformed: 3, complex: 4, unknown: 1.5 } as Record<string, number>)[getOne('ios_dataHandling')] ?? 0)
      addToTotal('Design', iosDesign[getOne('ios_design')] ?? 0)
      addToTotal('Animations', animationsCost[getOne('ios_animations')] ?? 0)
      const iosExtras = getMany('ios_extras')
      const iosExtrasMap: Record<string, number> = {
        testflight: 0.25, app_store: 0.75, maintenance: 0.25, post_delivery: 0.25, analytics_setup: 0.25, crash_monitoring: 0.25,
        legal_compliance: 0.25, future_changes: 1, admin_dashboard: 2.25, back_office: 3.25, training: 0.25, none: 0,
      }
      addToTotal('Éléments complémentaires', iosExtras.reduce((sum, key) => sum + (iosExtrasMap[key] ?? 0), 0))
    }

    const clarityMargin: Record<string, number> = {
      idea_general: 0.2, idea_clear: 0.15, feature_list: 0.15, spec: 0.1, mockups: 0.1, spec_and_mockups: 0.1,
      existing_site: 0.1, existing_ios: 0.1, existing_android: 0.1, existing_web: 0.1, existing_backend: 0.1, several_ready: 0.1,
    }

    let marginRate = clarityMargin[getOne('common_stage')] ?? 0.15
    if (getOne('site_database') === 'unknown' || getOne('ios_database') === 'unknown' || getOne('ios_backend') === 'unknown') {
      marginRate = Math.max(marginRate, 0.2)
    }

    const aiAcceleration = 0.82
    const guardedDays = totalDays * aiAcceleration * (1 + marginRate)
    const minDays = roundHalf(Math.max(1, guardedDays * 0.9))
    const maxDays = roundHalf(Math.max(minDays, guardedDays * 1.1))
    const minPrice = roundPrice(minDays * 250)
    const maxPrice = roundPrice(maxDays * 250)

    return {
      marginRate,
      aiAcceleration,
      breakdown,
      minDays,
      maxDays,
      minPrice,
      maxPrice,
      complexProject: maxDays >= 20 || maxPrice >= 5000,
    }
  }, [responses, visibleQuestions])

  return (
    <>
      <Navigation />
      <main id="main-content" className="min-h-screen bg-[#f5f5ef] text-[#17251f]">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[#4d6b2b] hover:text-[#17251f] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à Mobiverse Games
          </Link>
          <button
            onClick={() => setResponses({})}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#bdc5b5] text-[#354330] hover:border-[#17251f] hover:text-[#17251f] transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#d8ddd2] p-6 md:p-8 mb-10">
          <div className="flex items-center gap-3 mb-3">
            <Calculator className="w-6 h-6 text-[#4d6b2b]" />
            <p className="text-[#4d6b2b] uppercase tracking-wide text-sm">Estimation automatique</p>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-[#17251f]">
              Obtenir une estimation
            </span>
          </h1>
          <p className="text-[#61695f]">
            Répondez aux 20 questions pour obtenir une fourchette de budget et de délai.
            L'estimation reste indicative et sera confirmée après échange.
          </p>
          <p className="text-[#61695f] mt-3 text-sm">
            Progression : {progress.answered}/{progress.total} questions
          </p>
        </div>

        <div className="space-y-5">
          {renderQuestionCard(projectTypeQuestion, !projectType)}

          {projectType && (
            <section className="bg-white/60 border border-[#d8ddd2] rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-2">Besoin d'aide pour répondre ?</h2>
              <p className="text-[#61695f] text-sm mb-4">
                Copiez ce prompt puis collez-le dans un chat IA externe au site (ChatGPT, Claude, etc.).
                Il vous aidera à répondre simplement au questionnaire, sauf les questions personnelles à remplir vous-même.
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  type="button"
                  onClick={copyPrompt}
                  disabled={!helperPrompt}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                    helperPrompt
                      ? 'border-[#809863] text-[#4d6b2b] hover:bg-[#e6edda]'
                      : 'border-[#bdc5b5] text-[#788271] cursor-not-allowed'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Prompt copié' : 'Copier le prompt'}
                </button>
              </div>
              <textarea
                aria-label="Texte d’aide à copier pour préparer vos réponses"
                value={helperPrompt}
                readOnly
                className="w-full h-56 bg-[#f5f5ef] border border-[#bdc5b5] rounded-xl p-4 text-sm text-[#354330]"
              />
            </section>
          )}

          {projectType && otherQuestions.map((question) => renderQuestionCard(question))}
        </div>

        <div className="mt-10">
          {estimation ? (
            <section className="bg-[#e6edda] border border-[#bbcba4] rounded-2xl p-6 md:p-8">
              <h3 className="text-2xl font-bold mb-4">Résultat estimatif</h3>
              <p className="text-[#354330] mb-2">Budget estimé : <span className="font-semibold text-[#17251f]">{estimation.minPrice.toLocaleString('fr-FR')} € à {estimation.maxPrice.toLocaleString('fr-FR')} €</span></p>
              <p className="text-[#354330] mb-2">Délai estimé : <span className="font-semibold text-[#17251f]">{estimation.minDays} à {estimation.maxDays} jours</span></p>
              <p className="text-[#61695f] text-sm mb-4">Marge d'incertitude appliquée : {Math.round(estimation.marginRate * 100)}%</p>
              <p className="text-[#61695f] text-sm mb-4">Optimisation IA intégrée (ChatGPT / Claude) : -{Math.round((1 - estimation.aiAcceleration) * 100)}% sur le temps brut.</p>
              {estimation.complexProject && (
                <p className="text-[#354330] bg-white/70 border border-[#bbcba4] rounded-xl px-4 py-3 mb-4">
                  Projet complexe : l'estimation initiale démarre généralement à partir de 5 000 €.
                </p>
              )}

              <div className="pt-4 border-t border-[#bdc5b5]">
                <p className="text-[#354330] font-medium mb-2">Principaux postes de charge :</p>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  {estimation.breakdown.map((line) => (
                    <p key={line.label} className="text-[#61695f]">
                      {line.label} : +{line.days} j
                    </p>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white/60 border border-[#d8ddd2] rounded-2xl p-6">
              <p className="text-[#61695f]">
                Complétez toutes les questions pour afficher votre estimation.
              </p>
            </section>
          )}
        </div>

        <section className="mt-10 bg-white/60 border border-[#d8ddd2] rounded-2xl p-6 md:p-8">
          <h3 className="text-2xl font-bold mb-3">
            <span className="text-[#17251f]">
              Contacter Mobiverse Games
            </span>
          </h3>
          <p className="text-[#61695f] mb-6">
            Présentez votre projet à Mobiverse Games via le canal de votre choix.
          </p>
          <div className="flex flex-wrap gap-4">
            {contactLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                className="group relative bg-[#e6edda] p-5 rounded-2xl hover:bg-[#d9fa68] transition-colors min-w-[120px] text-center"
              >
                <social.icon className="w-7 h-7 text-[#17251f] mx-auto mb-2" />
                <p className="text-[#17251f] font-semibold">{social.label}</p>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.a>
            ))}
          </div>
        </section>
      </div>
      </main>
      <Footer />
    </>
  )
}
