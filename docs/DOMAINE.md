# Domaine mobiversegames.com

## HTTPS et état du DNS au 7 septembre 2026

Le domaine est configuré dans les paramètres GitHub Pages. `public/CNAME` en conserve une copie dans l'export du site. La publication utilise GitHub Actions ; les paramètres Pages restent la référence pour le domaine personnalisé. Le certificat HTTPS est fourni gratuitement et automatiquement par GitHub Pages via Let's Encrypt.

La configuration a été vérifiée directement auprès d'IONOS et via les résolveurs publics Cloudflare et Google :

- `A` : les quatre adresses GitHub Pages indiquées ci-dessous.
- `AAAA` : aucun ; l'ancienne adresse IONOS a été supprimée.
- `www` : `CNAME` vers `guillaumebourlart.github.io`.
- Serveurs DNS : `ns1026.ui-dns.org`, `ns1066.ui-dns.com`, `ns1064.ui-dns.de`, `ns1120.ui-dns.biz`.

Ces serveurs de noms sont ceux d'IONOS. Le propriétaire a confirmé que le domaine est acheté chez IONOS. Les modifications doivent donc se faire dans IONOS : Domaines et SSL → mobiversegames.com → DNS.

## Configuration DNS à conserver

Les valeurs attendues dans la zone DNS IONOS sont :

| Type | Nom | Valeur |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | guillaumebourlart.github.io |

Aucun enregistrement `AAAA` n'est nécessaire pour activer le HTTPS. Si IPv6 est ajouté, utiliser uniquement les adresses GitHub Pages suivantes :

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Conserver les entrées de messagerie (MX, SPF, DKIM, DMARC). Il n'est pas nécessaire de réinitialiser toute la zone ni de changer les serveurs de noms pour pointer le site vers GitHub Pages.

GitHub peut encore voir les anciennes adresses pendant la propagation DNS, même si IONOS et les résolveurs publics affichent les bonnes valeurs. Après propagation, retourner dans les paramètres Pages du dépôt, cliquer sur **Check again**, puis activer **Enforce HTTPS** dès que le certificat est disponible. GitHub indique qu'une propagation DNS peut prendre jusqu'à 24 heures. Il n'est pas nécessaire d'acheter un certificat SSL chez IONOS.

## Documentation

- [Domaine personnalisé GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Certificat et activation HTTPS sur GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)
- [Serveurs DNS IONOS par défaut](https://www.ionos.fr/assistance/domaines/informations-generales-sur-les-parametres-dns/parametres-dns-par-defaut-pour-les-domaines-enregistres-chez-11-ionos/)
- [Modifier les adresses IP chez IONOS](https://www.ionos.fr/assistance/domaines/configurer-des-adresses-ip/connecter-un-domaine-a-une-adresse-ip-statique/)
- [Éditer une zone DNS OVHcloud](https://docs.ovhcloud.com/fr/guides/web-cloud/domains/dns-zone-edit)
