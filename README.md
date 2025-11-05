# Bibliotheque_prompt

Cette bibliothèque contient des prompts (exemples et templates) conçus pour être utilisés avec des modèles d'intelligence artificielle (ChatGPT, Claude, GPT-4/5, etc.). Les prompts sont organisés par persona et par domaine d'activité pour faciliter leur réutilisation dans des workflows de création, community management, vidéo et automatisation.

Comment utiliser
- Ouvrez le fichier Markdown correspondant au prompt souhaité.
- Copiez le texte du prompt et collez-le dans l'interface de votre modèle IA (ou dans votre outil d'automatisation).
- Remplacez les champs entre crochets [] par vos informations (brief, audience, ton, contraintes, etc.).

Conventions
- Format : fichiers Markdown (.md).
- Template : chaque prompt suit le format "Version ULTRA-COMPLÈTE" (rôle, contexte, objectifs, entrées, contraintes, format de sortie, checklist, paramètres IA).
- Longueur recommandée : 40–90 lignes pour assurer complétude et clarté.
- Nommage : `NN_titre_descriptif.md` par persona.

Structure du dépôt
- `Camille-social-media-manager/` — prompts pour chef·fe de projet social media
- `Lea-Community-Manager/` — prompts pour community management
- `Nino-Creator-Video/` — prompts pour création vidéo
- `Bastien-Developpeur-Automatisation/` — prompts pour dev & automatisation
- `Vincent-Direction-Strategie/` — prompts pour Direction et Strategie

## Interface web (one‑page)

Une interface web statique est fournie pour parcourir, filtrer et copier les prompts facilement.

- Fichier d’entrée: `index.html`
- Styles et scripts: `assets/styles.css`, `assets/app.js`
- Manifest généré: `prompts.json`

Fonctionnalités:
- Filtrer par personne et domaine, recherche plein texte (titre + contenu)
- Carte → aperçu + ouverture en modal (Markdown rendu)
- Bouton pour copier le contenu + lien direct vers ChatGPT (ouvre une nouvelle page)
- Lien pour ouvrir le fichier `.md` original

### Générer / mettre à jour le manifest

Le front charge `prompts.json`. Générez-le à partir du dossier `prompt/`:

```
node tools/generate-manifest.cjs
```

Cela crée/actualise `prompts.json` à la racine. À relancer à chaque ajout/modification de prompts.

### Servir localement (recommandé)

Pour éviter les restrictions `file://`, servez un petit serveur HTTP local, par exemple:

```
npx http-server -c-1 -p 5173
```

Puis ouvrez: http://localhost:5173/


