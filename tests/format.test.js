import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatQty, formatMinutes, formatHours, formatRest } from '../js/utils/format.js';
import { normalize, slugify, capitalize } from '../js/utils/text.js';

// toLocaleString('fr-FR') utilise une espace insécable fine comme séparateur de milliers.
const spaces = (s) => s.replace(/[  ]/g, ' ');

test('formatQty : poids et volumes arrondis lisiblement', () => {
  assert.equal(formatQty(250, 'g'), '250 g');
  assert.equal(formatQty(372, 'g'), '370 g');
  assert.equal(formatQty(12.4, 'ml'), '12 ml');
  assert.equal(formatQty(2.5, 'g'), '2,5 g');
  assert.equal(spaces(formatQty(1200, 'ml')), '1 200 ml');
});

test('formatQty : fractions et pluriels', () => {
  assert.equal(formatQty(0.25, 'c. à c.'), '¼ c. à c.');
  assert.equal(formatQty(0.5, 'pc'), '½');
  assert.equal(formatQty(1.5, 'c. à s.'), '1 ½ c. à s.');
  assert.equal(formatQty(2, 'pc'), '2');
  assert.equal(formatQty(3, ''), '3');
  assert.equal(formatQty(2, 'pincée'), '2 pincées');
  assert.equal(formatQty(1, 'pincée'), '1 pincée');
});

test('formatQty : quantité absente', () => {
  assert.equal(formatQty(null, 'g'), 'g');
  assert.equal(formatQty(null, ''), '');
  assert.equal(formatQty(undefined), '');
});

test('formatMinutes / formatHours', () => {
  assert.equal(formatMinutes(5), '5 min');
  assert.equal(formatMinutes(60), '1 h');
  assert.equal(formatMinutes(70), '1 h 10');
  assert.equal(formatMinutes(125), '2 h 05');
  assert.equal(formatHours(24), '24 h');
  assert.equal(formatRest(30), '30 min');
  assert.equal(formatRest(120), '2 h');
  assert.equal(formatRest(480), '1 nuit');
  assert.equal(formatQty(2, 'gousse'), '2 gousses');
  assert.equal(formatQty(2, 'boîte'), '2 boîtes');
});

test('normalize : casse, accents et ligatures', () => {
  assert.equal(normalize('Œufs'), 'oeufs');
  assert.equal(normalize('  Protéinée  '), 'proteinee');
  assert.equal(normalize('Crème brûlée'), 'creme brulee');
  assert.equal(normalize(null), '');
});

test('slugify / capitalize', () => {
  assert.equal(slugify("Fraise-banane au lait d'amande"), 'fraise-banane-au-lait-d-amande');
  assert.equal(slugify('  Piña colada !! '), 'pina-colada');
  assert.equal(capitalize('cornets'), 'Cornets');
  assert.equal(capitalize(''), '');
});
