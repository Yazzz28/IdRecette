/**
 * Valeurs autorisées dans data.json.
 * Module sans dépendance : importé par l'app ET par scripts/validate-data.mjs.
 * Toute nouvelle valeur ajoutée ici est automatiquement acceptée partout.
 */
export const THUMB_COLORS = ['sauge', 'beurre', 'ciel', 'lilas', 'pelure'];
export const AISLES = ['Fruits & légumes', 'Surgelés', 'Frais', 'Épicerie', 'Placard'];
export const PANTRY_AISLE = 'Placard';
export const UNITS = ['g', 'ml', 'pc', 'c. à s.', 'c. à c.', 'pincée', 'feuilles', 'cl', 'kg', 'l'];
export const GROUPS = [
  { id: 'base', label: 'Base' },
  { id: 'mixin', label: 'Mix-in' },
  { id: 'topping', label: 'Toppings' },
];
export const CREAMI_MODES = ['Lite Ice Cream', 'Ice Cream', 'Sorbet', 'Gelato', 'Milkshake', 'Re-spin', 'Mix-in'];
export const DIFFICULTIES = ['Facile', 'Moyen', 'Chaud'];
export const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
