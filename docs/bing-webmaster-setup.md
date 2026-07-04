# Bing Webmaster Tools — Setup

## Pourquoi
ChatGPT utilise Bing comme backend de recherche. Si Captain Bond n'est pas dans Bing, ChatGPT ne peut PAS nous citer.

## Étapes

### 1. Aller sur Bing Webmaster Tools
URL: https://www.bing.com/webmasters

### 2. Se connecter avec un compte Microsoft
- Si pas de compte, créer avec l'email captainbond

### 3. Ajouter un site
- Cliquer "Add a site"
- URL: `https://captainbond.com`
- Méthode: copier la balise meta ou le fichier XML

### 4. Vérifier la propriété du site
Option recommandée : balise meta DNS

**Balise meta** (à ajouter dans `<head>` via RootLayout) :
```html
<meta name="bingbot" content="all" />
```

### 5. Soumettre le sitemap
Une fois vérifié :
- Aller dans "Sitemaps"
- URL: `https://captainbond.com/sitemap.xml`
- Cliquer "Submit"

### 6. Activer IndexNow
- Aller dans "Configuration" > "IndexNow"
- Activer IndexNow (ping automatique)
- Tester avec: https://www.bing.com/indexnow?url=https://captainbond.com&key=YOUR_KEY

### 7. Vérifier l'indexation
- Aller dans "URL Inspection"
- Tester: `https://captainbond.com`
- Vérifier que la page est indexée

## Résultat attendu
- Bing indexe le site sous 24-48h
- ChatGPT peut maintenant trouver et citer captainbond.com
- Les mises à jour sont pingées via IndexNow (immédiat)

## Bonus : Google Search Console
Même chose sur https://search.google.com/search-console
- Ajouter `https://captainbond.com`
- Vérifier avec la même balise meta
- Soumettre le sitemap
