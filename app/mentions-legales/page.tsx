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
          <p className="legal-updated">Dernière mise à jour : 11 septembre 2026</p>

          <section aria-labelledby="editeur">
            <h2 id="editeur">1. Éditeur du site</h2>
            <p>Le site <strong>mobiversegames.com</strong> est édité par :</p>
            <dl className="legal-identity">
              <dt>Nom</dt>
              <dd><strong>Guillaume BOURLART</strong> — Entrepreneur individuel (EI)</dd>
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
              <dt>Siège social</dt>
              <dd>1 avenue Maurice, 92270 Bois-Colombes, France</dd>
              <dt>Téléphone</dt>
              <dd><a href="tel:+33667661113">+33 6 67 66 11 13</a></dd>
              <dt>E-mail</dt>
              <dd><a href="mailto:contact@mobiversegames.com">contact@mobiversegames.com</a></dd>
              <dt>TVA</dt>
              <dd>TVA non applicable — article 293 B du Code général des impôts</dd>
              <dt>Directeur de la publication</dt>
              <dd>Guillaume Bourlart</dd>
            </dl>
          </section>

          <section aria-labelledby="hebergeur">
            <h2 id="hebergeur">2. Hébergeur</h2>
            <p>Le site est hébergé par :</p>
            <p>
              <strong>GitHub, Inc.</strong> (GitHub Pages)<br />
              88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis<br />
              <a href="https://support.github.com/" target="_blank" rel="noopener noreferrer">support.github.com</a>
            </p>
            <p>Le nom de domaine est enregistré auprès de IONOS SARL, 7 place de la Gare, 57200 Sarreguemines, France.</p>
          </section>

          <section aria-labelledby="pi">
            <h2 id="pi">3. Propriété intellectuelle</h2>
            <p>L’ensemble des éléments composant ce site — textes, visuels, captures d’écran, icônes, logos, charte graphique, code source — est protégé par le droit de la propriété intellectuelle et demeure la propriété exclusive de Guillaume Bourlart, sauf mention contraire.</p>
            <p>Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable, est interdite et susceptible de constituer une contrefaçon au sens des articles L.335-2 et suivants du Code de la propriété intellectuelle.</p>
            <p>Les marques, logos et captures d’écran des applications présentées au titre de réalisations pour des clients restent la propriété de leurs titulaires respectifs et sont reproduits avec leur accord.</p>
          </section>

          <section aria-labelledby="donnees">
            <h2 id="donnees">4. Données personnelles et cookies</h2>
            <p>Ce site est un site vitrine statique. Il ne dépose aucun cookie, n’utilise aucun outil de mesure d’audience et ne collecte aucune donnée personnelle à votre insu.</p>
            <p>Si vous choisissez d’écrire à l’adresse de contact, les informations transmises (nom, adresse e-mail, contenu du message) sont utilisées uniquement pour répondre à votre demande et conservées le temps nécessaire au traitement de celle-ci, puis au maximum trois ans à compter du dernier échange.</p>
            <p>Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi « Informatique et Libertés », vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur vos données. Pour l’exercer, écrivez à <a href="mailto:contact@mobiversegames.com">contact@mobiversegames.com</a>. Vous pouvez également introduire une réclamation auprès de la <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer">CNIL</a>.</p>
            <p>Les applications publiées par le studio disposent de leurs propres politiques de confidentialité, accessibles depuis leur fiche sur les magasins d’applications.</p>
          </section>

          <section aria-labelledby="responsabilite">
            <h2 id="responsabilite">5. Responsabilité</h2>
            <p>Les informations publiées sur ce site sont fournies à titre indicatif et peuvent être modifiées à tout moment. L’éditeur s’efforce d’en assurer l’exactitude et la mise à jour, sans pouvoir garantir l’absence d’erreur ou d’interruption d’accès au site.</p>
            <p>Les liens vers des sites tiers sont proposés pour votre commodité ; l’éditeur n’exerce aucun contrôle sur leur contenu et décline toute responsabilité à leur égard.</p>
          </section>

          <section aria-labelledby="droit">
            <h2 id="droit">6. Droit applicable</h2>
            <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux français sont seuls compétents, sous réserve des règles impératives applicables aux consommateurs.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
