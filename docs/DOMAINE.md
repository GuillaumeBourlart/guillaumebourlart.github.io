# Domaine mobiversegames.com

## Diagnostic du 7 septembre 2026

GitHub Pages connaît le domaine via le fichier `CNAME` sur `main`. L'erreur `NotServedByPagesError` indique que le DNS ne pointe pas vers GitHub Pages.

Enregistrements publics observés :

- `A` : `217.160.0.1`
- `AAAA` : `2001:8d8:100f:f000::200`
- Serveurs DNS : `ns1026.ui-dns.org`, `ns1066.ui-dns.com`, `ns1064.ui-dns.de`, `ns1120.ui-dns.biz`.

Ces serveurs de noms sont ceux d'IONOS. Le propriétaire a confirmé que le domaine est acheté chez IONOS. Les modifications doivent donc se faire dans IONOS : Domaines et SSL → mobiversegames.com → DNS.

## Configuration cible

Dans la zone DNS active, remplacer les enregistrements web existants en conflit par :

| Type | Nom | Valeur |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | guillaumebourlart.github.io |

Remplacer également l'ancien `AAAA` par les quatre adresses IPv6 GitHub Pages ci-dessous, ou le supprimer si IPv6 n'est pas souhaité :

```text
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```

Conserver les entrées de messagerie (MX, SPF, DKIM, DMARC). Il n'est pas nécessaire de réinitialiser toute la zone ni de changer les serveurs de noms pour pointer le site vers GitHub Pages.

Après propagation, retourner dans les paramètres Pages du dépôt, cliquer sur **Check again**, puis activer **Enforce HTTPS** dès que le certificat est disponible. GitHub indique qu'une propagation DNS peut prendre jusqu'à 24 heures.

## Documentation

- [Domaine personnalisé GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Serveurs DNS IONOS par défaut](https://www.ionos.fr/assistance/domaines/informations-generales-sur-les-parametres-dns/parametres-dns-par-defaut-pour-les-domaines-enregistres-chez-11-ionos/)
- [Modifier les adresses IP chez IONOS](https://www.ionos.fr/assistance/domaines/configurer-des-adresses-ip/connecter-un-domaine-a-une-adresse-ip-statique/)
- [Éditer une zone DNS OVHcloud](https://docs.ovhcloud.com/fr/guides/web-cloud/domains/dns-zone-edit)
