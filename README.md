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

## Étape 2 — Activer les réponses IA (gratuit, sans carte bancaire)

HEXAGO accepte **plusieurs IA**, par ordre de priorité : Mistral, puis OpenRouter, puis Google Gemini. **Une seule suffit.**

### Option A — Google Gemini (recommandée pour débuter : 100 % gratuit, sans carte)

1. Allez sur **https://aistudio.google.com/apikey** et connectez-vous avec un compte Google.
2. Cliquez **« Create API key »**, copiez la clé.
3. Dans votre fichier `.env`, collez-la ainsi :

```
GEMINI_API_KEY=votre_cle_google_ici
```

### Option B — Mistral AI (l'IA française 🇫🇷)

Le plan gratuit de Mistral (« Free » / « Experimental ») est restreint pour les nouveaux comptes : la console peut afficher « Upgrade to activate your API keys ». Si vous avez un abonnement ou si l'accès gratuit est réactivé :

1. **https://console.mistral.ai** → **« API Keys »** → **« Create new key »**.
2. Dans votre fichier `.env` :

```
MISTRAL_API_KEY=votre_cle_mistral_ici
MISTRAL_MODEL=mistral-small-latest
```

### Option C — OpenRouter (des modèles gratuits, une seule clé)

1. **https://openrouter.ai** → créez un compte → **« Keys »** → **« Create Key »**.
2. Dans votre fichier `.env` :

```
OPENROUTER_API_KEY=votre_cle_openrouter_ici
OPENROUTER_MODEL=openrouter/free
```

> Le modèle `openrouter/free` choisit automatiquement un modèle gratuit disponible (environ 50 requêtes/jour). Vérifiez les modèles gratuits du moment sur https://openrouter.ai/models (filtre « Price: Free »).

Ensuite, relancez le serveur (`npm start`) : le bouton **✨ Réponse IA** est actif. HEXAGO cherchera sur le web et l'IA vous répondra **avec ses sources**. Si vous configurez plusieurs clés, Mistral est utilisé en priorité, puis OpenRouter, puis Gemini.

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
4. Avant de cliquer sur « Create Web Service », ouvrez **« Advanced » → « Add Environment Variable »** et ajoutez au moins une de ces clés :
   - `GEMINI_API_KEY` → votre clé Google (gratuit, recommandé)
   - `MISTRAL_API_KEY` → votre clé Mistral (si vous en avez une)
   - `OPENROUTER_API_KEY` → votre clé OpenRouter (facultatif)
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
