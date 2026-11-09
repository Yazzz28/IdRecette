# IDrecette V.2

> La deuxième, c'est la bonne.

Les recettes de glaces **Ninja Creami healthy** de la bande : lait végétal, fruits, toppings.
App 100 % statique (HTML, CSS, JS) : pas de base de données, pas de compte, pas de build.

## Ce que fait l'app

- **Catalogue** : recherche plein texte (titre, ingrédients, tags, insensible aux accents, raccourci `/`), filtres par catégorie et par tag, favoris, tri (A→Z, kcal, protéines, rapidité).
- **Fiche recette** : portions ajustables (quantités et kcal recalculées), macros, programmes Creami, ingrédients à cocher, copie ou envoi par mail.
- **Mon menu** : les glaces prévues, avec portions et total de kcal.
- **Liste de courses** : générée depuis le menu, ingrédients regroupés et classés par rayon, ajouts à la main, copie ou envoi par mail.
- **Créer** : formulaire de recette perso avec brouillon automatique, kcal pré-remplies pour les ingrédients connus, export JSON.

Favoris, menu, liste de courses, recettes perso, brouillon et filtres sont enregistrés dans le **localStorage** du navigateur. Les recettes partagées par tout le monde vivent dans **`data.json`**.

## Lancer en local

Le navigateur bloque la lecture de `data.json` si on ouvre `index.html` en double-cliquant dessus. Il faut un petit serveur, au choix :

```bash
npm start                      # http://localhost:3000 (serve via npx)
python -m http.server 5173     # http://localhost:5173
```

ou l'extension **Live Server** de VS Code.

## Ajouter une recette

1. `git pull`
2. Ajoute ta recette **à la fin** du tableau `recipes` de `data.json` (format complet dans [.claude/CLAUDE.md](.claude/CLAUDE.md)).
   - Tu peux aussi la créer dans l'app (onglet **Créer**), puis **Exporter en JSON** et coller l'objet dans `data.json`. Dans ce cas, renomme l'`id` en enlevant `perso-` et le suffixe, puis supprime la version perso de ton navigateur.
3. Vérifie :
   ```bash
   node scripts/validate-data.mjs
   ```
4. Commit avec une recette par commit, `feat(recette): Titre de la recette`, puis push.

Avec Claude Code, tape simplement **`/ajouter-recette`** : la procédure, le gabarit et les repères caloriques sont dans [.claude/skills/ajouter-recette/SKILL.md](.claude/skills/ajouter-recette/SKILL.md).

### Les règles qui évitent les galères

- L'`id` d'une recette ne change **jamais** après avoir été poussé : il est stocké dans les favoris et les menus des gens.
- Les `kcal` d'un ingrédient correspondent à **la quantité indiquée**, pas à 100 g.
- Même ingrédient = même nom exact partout (« Lait d'amande sans sucre »), sinon la liste de courses ne le regroupe pas.
- Réutilise les tags existants avant d'en créer.

## Structure

```
index.html          coquille de l'app
data.json           les recettes partagées
css/                tokens de la charte, base, layout, composants, vues
js/core/            données, stores localStorage, filtres, liste de courses, routeur, schéma
js/ui/              composants (recherche, chips, cartes, fiche recette…)
js/views/           catalogue, menu, courses, création
scripts/            validation de data.json
.claude/            contexte et procédures pour les agents Claude Code
```
