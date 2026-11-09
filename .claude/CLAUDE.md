# IDrecette V.2 · contexte projet

App web **statique** de recettes de la bande : plats, apéros, desserts, petits-déj, boissons, glaces (dont Ninja Creami)…
« Healthy » n'est pas une contrainte, c'est un **tag** filtrable.
Plusieurs personnes ajoutent des recettes : la seule source de vérité partagée est **`data.json`**.

## Règles non négociables

- **Pas de BDD, pas de backend, pas d'auth, pas de build, pas de dépendance npm.** HTML + CSS + JS (modules ES natifs).
- Tout état utilisateur (favoris, menu, liste de courses, recettes perso, brouillon, filtres) vit dans **`localStorage`**, via `js/core/stores.js` (préfixe `idrecette.v2.`). Ne jamais ajouter d'autre persistance.
- Les recettes partagées vont **uniquement** dans `data.json`. Jamais en dur dans le JS ou le HTML.
- Après toute modif de `data.json` : **`npm run validate`** doit afficher `✓`. Les warnings sont tolérés, les erreurs non.
- Avant tout commit : **`npm test`** doit être vert (tests `node:test` dans `tests/`, sans dépendance). Toute nouvelle logique dans `js/core` ou `js/utils` arrive avec son test.
- **`main` est protégée** : pas de push direct. On travaille sur une branche, on ouvre une PR, et la CI GitHub (`.github/workflows/ci.yml`, check **« Tests »**) doit passer pour pouvoir merger. Ne jamais renommer ce job ni contourner le check.
- Langue de l'interface et des recettes : **français**, ton « entre potes » (tutoiement, phrases courtes, un peu d'autodérision). Chiffres en `font-variant-numeric: tabular-nums`.
- L'app est **généraliste** : rien dans l'UI ne doit supposer qu'une recette est une glace. Ce qui est propre au Ninja Creami (programmes, congélation, « pots ») ne s'affiche que si `appliance` vaut `"Ninja Creami"`.

## Workflow git

```bash
git switch main && git pull
git switch -c recette/<id>          # ou feat/…, fix/…
# … modifs …
npm run validate && npm test
git commit -m "feat(recette): <Titre>"
git push -u origin recette/<id>
gh pr create --fill                 # la CI tourne, merge possible quand « Tests » est vert
```

## Ajouter une recette

Utilise la skill **`/ajouter-recette`** (`.claude/skills/ajouter-recette/SKILL.md`) : elle donne la procédure complète, les gabarits JSON et les valeurs caloriques de référence.
En résumé : sur une branche `recette/<id>`, ajoute un objet **à la fin** du tableau `recipes` avec un `id` unique en kebab-case, lance `npm run validate && npm test`, commit **une recette par commit** (`feat(recette): <titre>`) et ouvre une PR.

## Lancer l'app

`fetch('data.json')` ne marche pas en `file://` : il faut un serveur local.
- `npm start` (lance `serve` via npx), ou l'extension VS Code **Live Server**, ou `python -m http.server 5173`.
- Puis ouvrir `http://localhost:3000` (ou le port choisi).

## Architecture

```
index.html              coquille : header + nav, 4 <section> de vues, <dialog> fiche recette, tabbar mobile
data.json               catégories + recettes (format ci-dessous)
scripts/validate-data.mjs   CLI de validation de data.json (logique dans scripts/lib/validate.mjs)
tests/                  tests node:test (données, validateur, formatage, filtres, liste de courses, syntaxe)
.github/workflows/ci.yml    CI : validate + tests sur chaque PR et push sur main
css/
  tokens.css            couleurs / typo / rayons de la charte (modifier ici, jamais en dur ailleurs)
  base.css layout.css nav.css components.css card.css modal.css views.css form.css
js/
  main.js               point d'entrée : crée les vues, routeur, modale
  core/
    schema.js           valeurs autorisées (unités, rayons, appareils, modes Creami…) : partagé app + validateur
    library.js          chargement data.json + fusion recettes perso, normalizeRecipe, scaleIngredients
    store.js            createStore (observable + localStorage tolérant aux erreurs)
    stores.js           instances : filters, favorites, menu, shopping, userRecipes, draft, library
    filters.js          recherche (sans accents), filtres, tris, tags
    shopping.js         agrégation des ingrédients du menu → liste de courses par rayon
    router.js           routes hash : #/  #/recette/:id  #/menu  #/courses  #/creer[/:id]
  ui/                   composants (searchBar, categoryChips, tagFilters, recipeGrid, recipeCard, recipeModal, nav, toast, icons)
  views/                catalogView, menuView, shoppingView, createView
  utils/                dom (esc, debounce), text (normalize, slugify), format (quantités, kcal, durées), clipboard
```

Conventions de code :
- Un module = une responsabilité. Les vues s'abonnent aux stores et se re-rendent ; les actions passent par les stores, jamais par le DOM d'une autre vue.
- Tout texte injecté en HTML passe par `esc()` (`js/utils/dom.js`).
- Événements par délégation avec des attributs `data-action`.
- Les kcal par portion sont **calculées** (somme des kcal des ingrédients ÷ `servings`), ne pas les stocker.
- Nouvelle valeur autorisée (unité, rayon, appareil, mode…) → l'ajouter dans `js/core/schema.js` uniquement.

## Format de `data.json`

```jsonc
{
  "categories": [{ "id": "plats", "label": "Plats", "color": "sauge" }],
  "recipes": [{
    "id": "curry-pois-chiches-coco",     // unique, kebab-case, sans accent, ne JAMAIS le changer après coup (favoris/menus des gens)
    "title": "Curry de pois chiches coco",
    "category": "plats",                 // id existant dans categories
    "emoji": "🍛",                        // vignette ; ou "image": "assets/recettes/xxx.webp"
    "color": "sauge",                    // optionnel : sauge | beurre | ciel | lilas | pelure (sinon couleur de la catégorie)
    "description": "Une phrase, ton entre potes.",
    "tags": ["Healthy", "Vegan"],        // réutiliser les tags existants avant d'en créer
    "appliance": "Casserole",            // optionnel : Ninja Creami | Four | Poêle | Casserole | Airfryer | Robot | Micro-ondes | Sans cuisson
    "difficulty": "Facile",              // Facile | Moyen | Chaud
    "prepTime": 10,                      // minutes
    "cookTime": 25,                      // minutes, optionnel
    "restTime": 480,                     // minutes, optionnel (marinade, frigo, nuit…)
    "servings": 4,
    "ingredients": [
      { "qty": 480, "unit": "g", "name": "Pois chiches cuits", "kcal": 576, "group": "base", "aisle": "Épicerie" }
    ],
    "steps": ["Étape 1 au tutoiement.", "…"],
    "nutrition": { "protein": 15, "carbs": 72, "fat": 12 },   // grammes PAR PORTION
    "tip": "Une astuce.",
    "author": "Prénom"
  }]
}
```

Recette **Ninja Creami** : `"appliance": "Ninja Creami"` rend obligatoires `"freezeTime"` (heures, en général 24) et `"modes"` (programmes dans l'ordre, ex. `["Lite Ice Cream", "Re-spin", "Mix-in"]`). `modes` est interdit pour les autres appareils. 1 pot ≈ 2 portions.

- `kcal` d'un ingrédient = calories de **la quantité indiquée**, pas pour 100 g.
- `group` : `base` | `mixin` | `topping` (un plat classique n'utilise en général que `base`, et `topping` pour le dressage).
- `aisle` : `Fruits & légumes` | `Boulangerie` | `Boucherie & poisson` | `Frais` | `Surgelés` | `Épicerie` | `Placard`.
- Même ingrédient = **même nom exact et même rayon** d'une recette à l'autre (ex. toujours « Lait d'amande sans sucre », rayon Épicerie), sinon la liste de courses ne les regroupe pas. Les tests le vérifient.
- Catégories actuelles : `glaces`, `plats`, `apero`, `desserts`, `petit-dej`, `boissons`. Une catégorie déclarée doit contenir au moins une recette.
- Les ids préfixés `perso-` sont réservés aux recettes créées dans le navigateur.

## Charte graphique (résumé)

Encre `#17171A` · Papier `#F6F5F1` · Tomate `#FF5A36` (un seul accent) · Tomate cuite `#C2381A` (liens, texte accent) · Pelure `#FFE6DE` (sélection) · Assiettes sauge/beurre/ciel/lilas (vignettes).
Titres en **Bricolage Grotesque**, interface en **Inter**. Beaucoup d'air, cartes blanches rayon 20 px, boutons pilule.
