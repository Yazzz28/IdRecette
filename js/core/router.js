/**
 * Routage par hash :
 *   #/            catalogue
 *   #/recette/id  fiche recette (par-dessus la vue courante)
 *   #/menu        menu
 *   #/courses     liste de courses
 *   #/creer       nouvelle recette · #/creer/id édition
 */
export function parseHash(hash = location.hash) {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  const [name = '', param = null] = path.split('/').filter(Boolean);
  return { name: name || 'recettes', param: param ? decodeURIComponent(param) : null, hash: hash || '#/' };
}

export function navigate(path) {
  const target = `#/${path}`;
  if (location.hash === target) return false;
  location.hash = target;
  return true;
}

export function onRouteChange(handler) {
  window.addEventListener('hashchange', () => handler(parseHash()));
  handler(parseHash());
}
