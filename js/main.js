import { $ } from './utils/dom.js';
import { loadLibrary } from './core/library.js';
import { libraryStore } from './core/stores.js';
import { onRouteChange, parseHash } from './core/router.js';
import { initToast, toast } from './ui/toast.js';
import { initNav, setActiveNav } from './ui/nav.js';
import { createRecipeModal } from './ui/recipeModal.js';
import { createCatalogView } from './views/catalogView.js';
import { createMenuView } from './views/menuView.js';
import { createShoppingView } from './views/shoppingView.js';
import { createCreateView } from './views/createView.js';

const TITLES = {
  recettes: 'IDrecette V.2',
  menu: 'Mon menu · IDrecette V.2',
  courses: 'Liste de courses · IDrecette V.2',
  creer: 'Nouvelle recette · IDrecette V.2',
};

const sections = {
  recettes: $('#view-recettes'),
  menu: $('#view-menu'),
  courses: $('#view-courses'),
  creer: $('#view-creer'),
};

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
  creer: createCreateView(sections.creer, {
    onSaved(id) {
      backgroundHash = '#/';
      location.hash = `#/recette/${encodeURIComponent(id)}`;
    },
  }),
};

const modal = createRecipeModal($('#recipe-modal'), {
  onClose() {
    if (parseHash().name === 'recette') location.hash = backgroundHash;
  },
  onEdit(id) {
    backgroundHash = `#/creer/${encodeURIComponent(id)}`;
    modal.close();
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
      toast('Recette introuvable. Elle a peut-être fondu.');
      location.hash = backgroundHash;
    }
    return;
  }
  backgroundHash = route.hash;
  modal.close();
  showView(route.name, route.param);
}

// Le formulaire affiche la liste des recettes perso : on la rafraîchit si elle change.
libraryStore.subscribe(() => {
  if (currentView === 'creer') views.creer.refresh();
});

loadLibrary().then(() => onRouteChange(handleRoute));
