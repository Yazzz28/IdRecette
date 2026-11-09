import { $ } from './utils/dom.js';
import { loadLibrary } from './core/library.js';
import { libraryStore } from './core/stores.js';
import { removeStorage } from './core/store.js';
import { onRouteChange, parseHash } from './core/router.js';
import { initToast, toast } from './ui/toast.js';
import { initNav, setActiveNav } from './ui/nav.js';
import { createRecipeModal } from './ui/recipeModal.js';
import { createCatalogView } from './views/catalogView.js';
import { createMenuView } from './views/menuView.js';
import { createShoppingView } from './views/shoppingView.js';

const TITLES = {
  recettes: 'IDrecette V.2',
  menu: 'Mon menu · IDrecette V.2',
  courses: 'Liste de courses · IDrecette V.2',
};

const sections = {
  recettes: $('#view-recettes'),
  menu: $('#view-menu'),
  courses: $('#view-courses'),
};

// Restes de l'ancienne page « Créer » : les recettes passent désormais uniquement par data.json.
['userRecipes', 'draft', 'author'].forEach(removeStorage);

let currentView = null;
let currentParam = null;
/** Vue affichée sous la fiche recette, et vers laquelle on revient à la fermeture. */
let backgroundHash = '#/';

initToast();
initNav();

const views = {
  recettes: createCatalogView(sections.recettes),
  menu: createMenuView(sections.menu),
  courses: createShoppingView(sections.courses),
};

const modal = createRecipeModal($('#recipe-modal'), {
  onClose() {
    if (parseHash().name === 'recette') location.hash = backgroundHash;
  },
});

function showView(name, param = null) {
  if (!views[name]) {
    name = 'recettes';
    param = null;
  }
  if (name !== currentView || param !== currentParam) {
    if (currentView) views[currentView].hide();
    Object.entries(sections).forEach(([key, el]) => { el.hidden = key !== name; });
    views[name].show(param);
    currentView = name;
    currentParam = param;
    window.scrollTo({ top: 0 });
  }
  setActiveNav(name);
  document.title = TITLES[name];
}

function handleRoute(route) {
  if (route.name === 'recette') {
    const background = parseHash(backgroundHash);
    if (background.name !== currentView || background.param !== currentParam) {
      showView(background.name, background.param);
    }
    if (modal.open(route.param)) {
      document.title = `${libraryStore.get().byId.get(route.param).title} · IDrecette V.2`;
    } else {
      toast("Recette introuvable. Quelqu'un l'a mangée ?");
      location.hash = backgroundHash;
    }
    return;
  }
  // Route inconnue (ex. ancien lien #/creer) : retour au catalogue.
  if (!views[route.name]) {
    location.replace('#/');
    return;
  }
  backgroundHash = route.hash;
  modal.close();
  showView(route.name, route.param);
}

loadLibrary().then(() => onRouteChange(handleRoute));
