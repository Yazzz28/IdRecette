const FRACTIONS = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
const WEIGHT_UNITS = new Set(['g', 'kg', 'ml', 'cl', 'l']);
const PLURALIZABLE = new Set(['pincée', 'gousse', 'feuille', 'tranche', 'boule', 'botte', 'sachet', 'pot']);

/** 1.5 → « 1 ½ », 0.25 → « ¼ ». */
function toFraction(value) {
  const rounded = Math.round(value * 4) / 4;
  const whole = Math.floor(rounded);
  const frac = FRACTIONS[+(rounded - whole).toFixed(2)];
  if (!frac) return String(whole || rounded);
  return whole > 0 ? `${whole} ${frac}` : frac;
}

function roundWeight(value) {
  if (value >= 100) return Math.round(value / 5) * 5;
  if (value >= 10) return Math.round(value);
  return Math.round(value * 10) / 10;
}

/** Formate une quantité + unité de façon lisible (« 250 g », « 1 ½ c. à s. », « 2 pincées »). */
export function formatQty(qty, unit = '') {
  if (qty === null || qty === undefined || qty === '' || Number.isNaN(Number(qty))) return unit || '';
  const q = Number(qty);
  const u = (unit || '').trim();

  if (WEIGHT_UNITS.has(u)) {
    return `${roundWeight(q).toLocaleString('fr-FR')} ${u}`;
  }

  const num = toFraction(q);
  if (!u || u === 'pc') return num;
  const label = q > 1 && PLURALIZABLE.has(u) ? `${u}s` : u;
  return `${num} ${label}`;
}

export const formatKcal = (kcal) => Math.round(kcal).toLocaleString('fr-FR');

/** 5 → « 5 min », 70 → « 1 h 10 ». */
export function formatMinutes(min) {
  const m = Math.round(Number(min) || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${String(rest).padStart(2, '0')}` : `${h} h`;
}

export const formatHours = (h) => `${Math.round(Number(h) || 0)} h`;

/** Lundi de la semaine courante, en toutes lettres. */
export function currentWeekLabel(date = new Date()) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `Semaine du ${d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`;
}
