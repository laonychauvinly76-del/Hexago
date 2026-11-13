# HEXAGO 🇪🇺

**HEXAGO** est un moteur de recherche intelligent européen : il cherche sur le web et peut répondre à vos questions grâce à l'IA française **Mistral AI**, en citant ses sources.

---

## Ce que contient ce projet (en mots simples)

| Fichier | À quoi il sert |
|---|---|
| `server.js` | Le « moteur » : il reçoit les recherches, interroge le web, et parle à l'IA Mistral |
| `public/index.html` | La page du site (accueil, barre de recherche, résultats) |
| `public/style.css` | Le design (couleurs, logo, mise en page) |
| `public/app.js` | Les interactions dans le navigateur (boutons, affichage des résultats) |
| `.env.example` | Un modèle de fichier pour ranger vos clés secrètes |
| `package.json` | La liste des outils dont le projet a besoin |

---

## Étape 1 — Faire fonctionner HEXAGO sur votre ordinateur

1. Installez **Node.js** (version 18 ou plus) sur [nodejs.org](https://nodejs.org) : cliquez sur le bouton de téléchargement, puis installez comme un programme normal.
2. Téléchargez ce projet (bouton vert **Code** → **Download ZIP**), puis décompressez-le.
3. Ouvrez un terminal **dans le dossier du projet** :
   - Sur Windows : ouvrez le dossier dans l'Explorateur, cliquez dans la barre d'adresse, tapez `cmd` et appuyez sur Entrée.
   - Sur Mac : clic droit sur le dossier → « Services » → « Nouveau terminal au dossier ».
4. Tapez ces deux commandes (une par une, Entrée après chacune) :

```
npm install
npm start
```

5. Ouvrez votre navigateur à l'adresse : **http://localhost:3000** → HEXAGO est en ligne chez vous ! 🎉

---

## Étape 2 — Connecter l'IA Mistral (3 clics, gratuit pour commencer)

1. Allez sur **https://console.mistral.ai** et créez un compte (vous pouvez vous connecter avec Google).
2. Une fois connecté, dans le menu de gauche, cliquez sur **« API Keys »**.
3. Cliquez sur **« Create new key »**, donnez-lui un nom (par exemple `hexago`), puis copiez la clé affichée. ⚠️ Elle ne sera plus affichée après : gardez-la dans un fichier personnel, ne la montrez à personne.
4. Dans le dossier du projet, copiez le fichier `.env.example` et renommez la copie **`.env`** (avec un point au début).
5. Ouvrez ce fichier `.env` et remplacez `collez_votre_cle_mistral_ici` par votre clé, comme ceci :

```
MISTRAL_API_KEY=votre_vraie_cle_ici
```

6. Relancez le serveur (`npm start`). Le bouton **✨ Réponse IA** est maintenant actif : posez une question, HEXAGO cherchera sur le web et l'IA vous répondra **avec ses sources**.

> 💡 Le modèle utilisé par défaut (`mistral-small-latest`) est rapide et économique. Vous pouvez en changer dans `.env` avec `MISTRAL_MODEL`.

---

## Étape 3 (recommandée) — Une meilleure recherche web

La recherche fonctionne sans clé grâce à DuckDuckGo. Pour des résultats plus stables et professionnels :

1. Créez un compte sur **https://brave.com/search/api/** (plan « Free » : 2 000 recherches/mois gratuites).
2. Choisissez **« Data for AI »** ou **« Web Search »**, puis copiez votre clé API.
3. Ajoutez-la dans votre fichier `.env` :

```
BRAVE_API_KEY=votre_cle_brave_ici
```

HEXAGO utilisera automatiquement Brave en priorité, avec DuckDuckGo en secours.

---

## Étape 4 — Mettre HEXAGO en ligne sur Internet (gratuit pour commencer)

Le plus simple pour débuter : **Render** ([render.com](https://render.com)), gratuit.

1. Mettez ce projet sur votre compte GitHub (demandez à votre assistant de le pousser sur un dépôt).
2. Sur Render, cliquez **« New + »** → **« Web Service »** → connectez votre compte GitHub et choisissez le dépôt HEXAGO.
3. Laissez les réglages par défaut (Render détecte Node.js tout seul). Commande de démarrage : `npm start`.
4. Avant de cliquer sur « Create Web Service », ouvrez **« Advanced » → « Add Environment Variable »** et ajoutez :
   - `MISTRAL_API_KEY` → votre clé Mistral
   - `BRAVE_API_KEY` → votre clé Brave (facultatif)
5. Cliquez **« Create Web Service »**. Après 1 à 2 minutes, Render vous donne une adresse du type `https://hexago.onrender.com` : **votre moteur de recherche est accessible au public**. 🌍

---

## Sécurité — très important

- Ne partagez **jamais** vos clés API et ne les mettez **jamais** dans le code ou sur GitHub.
- Le fichier `.env` est ignoré par Git (voir `.gitignore`) : c'est fait exprès.

---

## Feuille de route (prochaines étapes possibles)

- [ ] Historique de recherches (local, sans espionner personne)
- [ ] Onglets Images / Actualités
- [ ] Comptes utilisateurs optionnels
- [ ] Version mobile (application)
- [ ] Conformité RGPD renforcée et serveurs européens
