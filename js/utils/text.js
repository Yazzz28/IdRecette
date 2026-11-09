/** Minuscules, sans accents, ligatures dépliées : « Œufs » → « oeufs ». */
export function normalize(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function slugify(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const capitalize = (value) => {
  const s = String(value ?? '').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
