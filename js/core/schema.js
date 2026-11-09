/**
 * Valeurs autorisées dans data.json.
 * Module sans dépendance : importé par l'app ET par scripts/lib/validate.mjs.
 * Toute nouvelle valeur ajoutée ici est automatiquement acceptée partout.
 */
export const THUMB_COLORS = ['sauge', 'beurre', 'ciel', 'lilas', 'pelure'];

/** Ordre d'affichage des rayons dans la liste de courses. */
export const AISLES = [
  'Fruits & légumes',
  'Boulangerie',
  'Boucherie & poisson',
  'Frais',
  'Surgelés',
  'Épicerie',
  'Placard',
];
export const PANTRY_AISLE = 'Placard';

export const UNITS = [
  'g', 'kg', 'ml', 'cl', 'l',
  'pc', 'c. à s.', 'c. à c.', 'pincée',
  'feuilles', 'gousse', 'tranche', 'botte', 'boîte', 'sachet',
];

export const GROUPS = [
  { id: 'base', label: 'Base' },
  { id: 'mixin', label: 'Mix-in' },
  { id: 'topping', label: 'Toppings' },
];

/** Appareil principal. « Ninja Creami » active les champs spécifiques (modes, congélation). */
export const CREAMI = 'Ninja Creami';
export const APPLIANCES = [CREAMI, 'Four', 'Poêle', 'Casserole', 'Airfryer', 'Robot', 'Micro-ondes', 'Sans cuisson'];
export const CREAMI_MODES = ['Lite Ice Cream', 'Ice Cream', 'Sorbet', 'Gelato', 'Milkshake', 'Re-spin', 'Mix-in'];

export const DIFFICULTIES = ['Facile', 'Moyen', 'Chaud'];
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
