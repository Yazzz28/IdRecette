---
name: ajouter-recette
description: Ajoute (ou corrige) une recette de glace Ninja Creami dans data.json en respectant le schéma, les noms d'ingrédients existants et le calcul des calories, puis valide et commit. Utiliser dès qu'on parle d'ajouter, importer, corriger ou supprimer une recette, ou d'intégrer un export « recettes-perso.json » venu de l'app.
---

# Ajouter une recette dans IDrecette

Objectif : une recette propre dans `data.json`, qui passe le validateur, se regroupe bien dans la liste de courses et ne casse rien pour les autres contributeurs.

## 1. Rassembler l'info

Si l'utilisateur ne l'a pas donnée, demande-la (en une seule question groupée) :
- titre, catégorie, ingrédients avec quantités pour **un pot** (≈ 2 portions), étapes, programme(s) Creami, prénom de l'auteur.
- Le reste (description, tags, astuce, kcal, macros) : propose-le toi-même, l'utilisateur corrigera.

S'il s'agit d'un **export de l'app** (`recettes-perso.json`, ids en `perso-…`) : reprends chaque objet tel quel, mais **renomme l'id** sans le préfixe `perso-` ni le suffixe aléatoire (ex. `perso-fraise-basilic-mw9ofc4j` → `fraise-basilic`).

## 2. Lire l'existant avant d'écrire

1. Lis `data.json` en entier : catégories, tags déjà utilisés, ids existants.
2. Lis `js/core/schema.js` pour les valeurs autorisées (unités, rayons, groupes, modes, difficultés, couleurs).
3. **Réutilise les noms d'ingrédients existants à l'identique** (même casse, mêmes accents) : `Lait d'amande sans sucre`, `Sirop d'érable`, `Banane bien mûre`, `Boisson coco`, `Protéine végétale vanille`… Sinon la liste de courses affiche deux lignes pour le même produit.
4. Réutilise les tags existants (`Vegan`, `Sans gluten`, `Riche en protéines`, `Moins de 200 kcal`, `Express`) avant d'en inventer. Un nouveau tag n'a de sens que s'il servira à filtrer plusieurs recettes.
5. Nouvelle catégorie seulement si vraiment nécessaire : ajoute-la dans `categories` avec une couleur d'assiette.

## 3. Écrire la recette

Ajoute l'objet **à la fin** du tableau `recipes` (ça limite les conflits de merge entre contributeurs). Gabarit :

```json
{
  "id": "kebab-case-unique",
  "title": "Titre lisible",
  "category": "fruitees",
  "emoji": "🍓",
  "description": "Une phrase qui donne envie, au tutoiement, ton entre potes.",
  "tags": ["Vegan", "Sans gluten"],
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
- `steps` au tutoiement, une action par étape, mentionner le programme Creami et le Re-spin / Mix-in quand ils servent.
- Mix-ins (ajoutés au programme Mix-in) → `group: "mixin"` ; décor final → `group: "topping"`.
- Recettes healthy : lait végétal, fruits, sucres non raffinés en petite quantité. Pas de crème ni de lait de vache.

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

## 4. Valider

```bash
node scripts/validate-data.mjs
```

- Doit finir par `✓ data.json valide`. Corrige toutes les erreurs `✗`.
- Lis les avertissements `!` et corrige ceux qui concernent ta recette.
- Si possible, lance l'app (`npm start` ou `python -m http.server 5173`), ouvre `#/recette/<id>` et vérifie l'affichage, le stepper de portions et la liste de courses.

## 5. Commit

- **Une recette par commit**, message `feat(recette): <Titre>` (ou `fix(recette): <Titre> · <ce qui change>`).
- Fais `git pull --rebase` avant de pousser. En cas de conflit dans `data.json`, garde **les deux** recettes (chacune est un objet indépendant du tableau), vérifie les virgules, puis relance le validateur.
- Ne touche pas aux recettes des autres sans le dire dans le message de commit.

## Supprimer ou renommer

- Supprimer : retire l'objet, relance le validateur. Les menus et favoris qui pointaient dessus l'ignorent sans planter.
- « Renommer » : change `title`, **jamais** `id`.
