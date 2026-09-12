import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site mobiversegames.com — éditeur, hébergeur, propriété intellectuelle et données personnelles.',
  alternates: { canonical: '/mentions-legales/' },
  robots: { index: true, follow: true },
}

export default function MentionsLegales() {
  return (
    <>
      <Navigation />
      <main id="main-content">
        <div className="legal-page site-container">
          <p className="eyebrow">Informations / Mentions légales</p>
          <h1>Mentions légales<span>.</span></h1>
          <p className="legal-updated">Dernière mise à jour : 12 septembre 2026</p>

          <section aria-labelledby="editeur">
            <h2 id="editeur">1. Éditeur du site</h2>
            <p>Le site <strong>mobiversegames.com</strong> est édité par :</p>
            <dl className="legal-identity">
              <dt>Nom</dt>
              <dd><strong>Guillaume Paul Raoul Bourlart</strong> — Entrepreneur individuel (EI)</dd>
              <dt>Nom commercial</dt>
              <dd>Mobiverse Games</dd>
              <dt>SIREN</dt>
              <dd>883 345 522</dd>
              <dt>SIRET (siège)</dt>
              <dd>883 345 522 00022</dd>
              <dt>Immatriculation</dt>
              <dd>Registre national des entreprises (RNE)</dd>
              <dt>Code APE / NAF</dt>
              <dd>58.29C — Édition de logiciels applicatifs</dd>
              <dt>Adresse professionnelle</dt>
              <dd>1 avenue Maurice, 92270 Bois-Colombes, France</dd>
              <dt>Téléphone</dt>
              <dd><a href="tel:+33667661113">+33 6 67 66 11 13</a></dd>
              <dt>E-mail</dt>
              <dd><a href="mailto:contact@mobiversegames.com">contact@mobiversegames.com</a></dd>
              <dt>TVA</dt>
              <dd>TVA non applicable — article 293 B du Code général des impôts</dd>
              <dt>Directeur de la publication</dt>
              <dd>Guillaume Paul Raoul Bourlart</dd>
            </dl>
            <p>Mobiverse Games est le nom commercial sous lequel Guillaume Paul Raoul Bourlart exerce son activité d’entrepreneur individuel.</p>
          </section>

          <section aria-labelledby="hebergeur">
            <h2 id="hebergeur">2. Hébergeur</h2>
            <p>Le site est hébergé par :</p>
            <p>
              <strong>GitHub, Inc.</strong> (GitHub Pages)<br />
              88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis<br />
              Téléphone : <a href="tel:+18774484820">+1 877 448 4820</a><br />
              <a href="https://support.github.com/" target="_blank" rel="noopener noreferrer">support.github.com</a>
            </p>
            <p>Le nom de domaine est enregistré auprès de IONOS.</p>
          </section>

          <section aria-labelledby="pi">
            <h2 id="pi">3. Propriété intellectuelle</h2>
            <p>Les textes, visuels, logos, captures d’écran et autres éléments du site sont protégés par les droits de leurs titulaires respectifs. Leur réutilisation doit respecter les autorisations, licences et exceptions légales applicables.</p>
            <p>Archidex et Yams Love sont présentées comme des réalisations de développement pour des clients. Cette présentation ne signifie pas que leurs marques ou leurs applications appartiennent à Mobiverse Games. Les droits correspondants restent ceux de leurs titulaires respectifs.</p>
          </section>

          <section aria-labelledby="donnees">
            <h2 id="donnees">4. Données personnelles et cookies</h2>
            <p>Le responsable des traitements liés aux demandes adressées à Mobiverse Games est Guillaume Paul Raoul Bourlart, entrepreneur individuel, joignable aux coordonnées indiquées ci-dessus.</p>
            <h3>Navigation et estimation</h3>
            <p>Le code de ce site vitrine n’intègre ni outil de mesure d’audience ni traceur publicitaire et ne dépose pas de cookie. Le questionnaire d’estimation fonctionne dans votre navigateur : vos réponses ne sont pas envoyées automatiquement à Mobiverse Games. Un lien de contact ouvre votre logiciel de messagerie ; vous choisissez les informations à envoyer.</p>
            <p>L’hébergeur GitHub Pages enregistre l’adresse IP des visiteurs à des fins de sécurité. GitHub décrit les données techniques traitées, leur conservation et les garanties applicables aux transferts internationaux, notamment vers les États-Unis, dans sa <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">politique de confidentialité</a>.</p>
            <h3>Demandes par e-mail</h3>
            <p>Les informations que vous transmettez volontairement (identité, coordonnées, contenu du message et pièces jointes éventuelles) servent à répondre à votre demande et à préparer ou suivre une prestation. Le traitement repose sur les mesures précontractuelles ou l’exécution du contrat pour une demande de devis ou une prestation, et sur l’intérêt légitime à répondre aux sollicitations pour les autres échanges. Seules les informations nécessaires à votre demande sont utiles ; sans moyen de vous recontacter, il peut être impossible d’y répondre.</p>
            <p>Ces informations sont destinées à l’entrepreneur et aux prestataires techniques nécessaires à l’acheminement et à l’hébergement des échanges. Elles sont conservées pendant le traitement et le suivi de votre demande. Les éléments nécessaires à un contrat, à la comptabilité ou à la défense de droits sont ensuite conservés pour les durées correspondant aux obligations légales et aux délais de prescription applicables.</p>
            <h3>Vos droits</h3>
            <p>Selon les conditions prévues par le RGPD, vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou la portabilité de vos données, et vous opposer aux traitements fondés sur l’intérêt légitime. Pour exercer vos droits, écrivez à <a href="mailto:contact@mobiversegames.com">contact@mobiversegames.com</a> ou à l’adresse professionnelle ci-dessus. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr/fr/adresser-une-plainte" target="_blank" rel="noopener noreferrer">CNIL</a>.</p>
            <p>Les applications publiées par le studio disposent de leurs propres politiques de confidentialité, accessibles depuis leur fiche sur les magasins d’applications.</p>
          </section>

          <section aria-labelledby="responsabilite">
            <h2 id="responsabilite">5. Responsabilité</h2>
            <p>Les informations publiées sur ce site sont fournies à titre indicatif et peuvent être modifiées à tout moment. L’éditeur s’efforce d’en assurer l’exactitude et la mise à jour, sans pouvoir garantir l’absence d’erreur ou d’interruption d’accès au site.</p>
            <p>Les liens vers des sites tiers donnent accès à des services dont les contenus et les politiques de confidentialité sont définis par leurs propres éditeurs.</p>
          </section>

          <section aria-labelledby="droit">
            <h2 id="droit">6. Droit applicable</h2>
            <p>Le droit français s’applique, sous réserve des dispositions impératives applicables, notamment celles protégeant les consommateurs.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
