---
name: ajouter-recette
description: Ajoute (ou corrige) une recette dans data.json en respectant le schéma, les noms d'ingrédients existants et le calcul des calories, puis valide et commit. Utiliser dès qu'on parle d'ajouter, importer, corriger ou supprimer une recette.
---

# Ajouter une recette dans IDrecette

Objectif : une recette propre dans `data.json`, qui passe le validateur, se regroupe bien dans la liste de courses et ne casse rien pour les autres contributeurs.

## 1. Rassembler l'info

Si l'utilisateur ne l'a pas donnée, demande-la (en une seule question groupée) :
- titre, catégorie (`glaces`, `plats`, `apero`, `desserts`, `petit-dej`, `boissons`), appareil, nombre de portions, ingrédients avec quantités, étapes, prénom de l'auteur.
- Pour une glace **Ninja Creami** : les quantités sont pour **un pot** (≈ 2 portions) et il faut le ou les programmes.
- Le reste (description, tags, astuce, kcal, macros, temps) : propose-le toi-même, l'utilisateur corrigera.

L'app n'a pas de formulaire : **toutes les recettes s'ajoutent ici, dans `data.json`**. Si on te colle une recette en texte libre (site, carnet, message), reformule-la au format du dépôt, avec le ton et les noms d'ingrédients maison.

## 2. Lire l'existant avant d'écrire

1. Lis `data.json` en entier : catégories, tags déjà utilisés, ids existants.
2. Lis `js/core/schema.js` pour les valeurs autorisées (unités, rayons, appareils, groupes, modes, difficultés, couleurs).
3. **Réutilise les noms d'ingrédients existants à l'identique** (même casse, mêmes accents) **et le même rayon** : `Lait d'amande sans sucre`, `Sirop d'érable`, `Huile d'olive`, `Oignon jaune`, `Ail` (unité `gousse`), `Tomates concassées`, `Œufs`… Sinon la liste de courses affiche deux lignes pour le même produit, et `npm test` échoue.
4. Réutilise les tags existants (`Healthy`, `Vegan`, `Végétarien`, `Sans gluten`, `Riche en protéines`, `Moins de 200 kcal`, `Express`, `Salé`, `Apéro`…) avant d'en inventer. Un nouveau tag n'a de sens que s'il servira à filtrer plusieurs recettes.
5. **`Healthy` est un tag, pas une obligation** : mets-le si la recette est équilibrée (légumes, fruits, céréales complètes, peu de sucre raffiné et de gras saturés). Une recette plaisir est bienvenue, sans ce tag.
6. Nouvelle catégorie seulement si vraiment nécessaire : ajoute-la dans `categories` avec une couleur d'assiette (et au moins une recette dedans).

## 3. Écrire la recette

Ajoute l'objet **à la fin** du tableau `recipes` (ça limite les conflits de merge entre contributeurs).

### Gabarit : recette classique

```json
{
  "id": "kebab-case-unique",
  "title": "Titre lisible",
  "category": "plats",
  "emoji": "🍛",
  "description": "Une phrase qui donne envie, au tutoiement, ton entre potes.",
  "tags": ["Healthy", "Vegan"],
  "appliance": "Casserole",
  "difficulty": "Facile",
  "prepTime": 10,
  "cookTime": 25,
  "servings": 4,
  "ingredients": [
    { "qty": 1, "unit": "pc", "name": "Oignon jaune", "kcal": 44, "group": "base", "aisle": "Fruits & légumes" },
    { "qty": 2, "unit": "gousse", "name": "Ail", "kcal": 9, "group": "base", "aisle": "Fruits & légumes" },
    { "qty": 0.5, "unit": "botte", "name": "Coriandre fraîche", "kcal": 3, "group": "topping", "aisle": "Fruits & légumes" }
  ],
  "steps": [
    "Émince l'oignon et fais-le revenir 5 min dans l'huile d'olive.",
    "…"
  ],
  "nutrition": { "protein": 15, "carbs": 60, "fat": 12 },
  "tip": "Le petit truc qui change tout.",
  "author": "Prénom"
}
```

- `appliance` est facultatif (`Four`, `Poêle`, `Casserole`, `Airfryer`, `Robot`, `Micro-ondes`, `Sans cuisson`).
- `cookTime` (minutes) et `restTime` (minutes : marinade, frigo… `480` = une nuit) sont facultatifs.
- **Pas de `modes`** hors Ninja Creami (le validateur refuse).

### Gabarit : glace Ninja Creami

```json
{
  "id": "kebab-case-unique",
  "title": "Titre lisible",
  "category": "glaces",
  "emoji": "🍓",
  "description": "Une phrase qui donne envie, au tutoiement, ton entre potes.",
  "tags": ["Healthy", "Vegan", "Fruitée"],
  "appliance": "Ninja Creami",
  "difficulty": "Facile",
  "prepTime": 5,
  "freezeTime": 24,
  "servings": 2,
  "modes": ["Lite Ice Cream", "Re-spin"],
  "ingredients": [
    { "qty": 250, "unit": "g", "name": "Fraises surgelées", "kcal": 80, "group": "base", "aisle": "Surgelés" },
    { "qty": 10, "unit": "g", "name": "Amandes effilées", "kcal": 58, "group": "topping", "aisle": "Épicerie" }
  ],
  "steps": [
    "Mixe … jusqu'à ce que ce soit bien lisse.",
    "Verse dans le pot Creami jusqu'au trait MAX, ferme et congèle 24 h bien à plat.",
    "Lance le programme Lite Ice Cream.",
    "Si c'est poudreux, ajoute 1 c. à s. de lait et fais un Re-spin.",
    "Topping et on mange direct."
  ],
  "nutrition": { "protein": 3, "carbs": 30, "fat": 4 },
  "tip": "Le petit truc qui change tout.",
  "author": "Prénom"
}
```

Règles :
- `id` : kebab-case, sans accent, unique. **Ne jamais modifier l'id d'une recette déjà poussée** (il est stocké dans les favoris et menus des utilisateurs).
- `kcal` = calories de **la quantité indiquée** (pas pour 100 g). Le validateur avertit si on dépasse 950 kcal/100 g.
- `qty: null` autorisé pour « à volonté » (sel, menthe…).
- `nutrition` = grammes **par portion** (total ÷ `servings`), arrondis à l'entier.
- `steps` au tutoiement, une action par étape, avec les temps et températures (« 25 min à 180 °C »).
- Ninja Creami : `freezeTime` et `modes` obligatoires, mentionne le programme et le Re-spin / Mix-in dans les étapes. Mix-ins → `group: "mixin"`.
- Décor final (herbes, graines, croûtons…) → `group: "topping"`.
- Glaces salées : catégorie `glaces` + tags `Salé` (et `Apéro` si ça s'y prête). Sale un peu plus qu'à chaud, le froid atténue le goût.

### Repères caloriques (pour la quantité indiquée)

| Ingrédient | Repère |
|---|---|
| Lait d'amande sans sucre | 13 kcal / 100 ml |
| Lait de soja sans sucre | 33 kcal / 100 ml |
| Lait d'avoine | 45 kcal / 100 ml |
| Boisson coco | 20 kcal / 100 ml |
| Yaourt de soja nature | 50 kcal / 100 g |
| Banane (1 pc ≈ 120 g) | 105 kcal / pc |
| Fraises | 32 kcal / 100 g |
| Framboises | 52 kcal / 100 g |
| Myrtilles | 57 kcal / 100 g |
| Mangue | 60 kcal / 100 g |
| Ananas | 50 kcal / 100 g |
| Protéine végétale (pois/soja) | 380 kcal / 100 g |
| Beurre de cacahuète, purées d'oléagineux | 600 kcal / 100 g |
| Amandes, pistaches, cacahuètes | 580 kcal / 100 g |
| Chocolat noir 70 % | 580 kcal / 100 g |
| Cacao non sucré | 350 kcal / 100 g |
| Sirop d'érable | 52 kcal / c. à s. · 17 / c. à c. |
| Sirop d'agave | 60 kcal / c. à s. · 20 / c. à c. |
| Granola | 450 kcal / 100 g |
| Noix de coco râpée | 660 kcal / 100 g |
| Huile d'olive | 88 kcal / c. à s. |
| Oignon jaune (1 pc ≈ 110 g) | 44 kcal / pc |
| Ail | 4,5 kcal / gousse |
| Tomates fraîches | 18 kcal / 100 g |
| Tomates concassées | 20 kcal / 100 g |
| Poivron (1 pc ≈ 150 g) | 40 kcal / pc |
| Épinards frais | 23 kcal / 100 g |
| Carotte (1 pc ≈ 100 g) | 41 kcal / pc |
| Pois chiches cuits | 120 kcal / 100 g |
| Lentilles corail (sèches) | 350 kcal / 100 g |
| Riz basmati (sec) | 350 kcal / 100 g |
| Pâtes (sèches) | 360 kcal / 100 g |
| Flocons d'avoine | 370 kcal / 100 g |
| Lait de coco léger | 80 kcal / 100 ml |
| Œuf (1 pc ≈ 55 g) | 72 kcal / pc |
| Feta | 264 kcal / 100 g |
| Tofu ferme | 140 kcal / 100 g |
| Blanc de poulet | 120 kcal / 100 g |
| Saumon | 200 kcal / 100 g |
| Tahini | 600 kcal / 100 g |
| Pain de campagne | 260 kcal / 100 g |

## 4. Valider

Avant d'écrire quoi que ce soit, crée ta branche : `git switch main && git pull && git switch -c recette/<id>`.

```bash
npm run validate   # = node scripts/validate-data.mjs
npm test           # tests node:test, dont la cohérence des données
```

- Le validateur doit finir par `✓ data.json valide`. Corrige toutes les erreurs `✗`.
- `npm test` vérifie aussi qu'un même ingrédient a **la même orthographe et le même rayon** dans toutes les recettes, et que les kcal par portion sont plausibles. Si ça casse, aligne ta recette sur l'existant (ne modifie pas les autres recettes sans le dire).
- Lis les avertissements `!` et corrige ceux qui concernent ta recette.
- Si possible, lance l'app (`npm start` ou `python -m http.server 5173`), ouvre `#/recette/<id>` et vérifie l'affichage, le stepper de portions et la liste de courses.

## 5. Commit et PR

`main` est protégée : **pas de push direct**, la CI (check « Tests ») doit être verte pour merger.

```bash
git add data.json
git commit -m "feat(recette): <Titre>"     # ou fix(recette): <Titre> · <ce qui change>
git push -u origin recette/<id>
gh pr create --fill
```

- **Une recette par commit**, idéalement une recette par PR.
- Si la CI échoue, lis le log du job « Tests » (`gh pr checks` puis `gh run view --log-failed`), corrige sur la même branche et repousse.
- En cas de conflit dans `data.json` (`git pull --rebase origin main`), garde **les deux** recettes (chacune est un objet indépendant du tableau), vérifie les virgules, puis relance `npm run validate && npm test`.
- Ne touche pas aux recettes des autres sans le dire dans la PR.

## Supprimer ou renommer

- Supprimer : retire l'objet, relance le validateur. Les menus et favoris qui pointaient dessus l'ignorent sans planter.
- « Renommer » : change `title`, **jamais** `id`.
