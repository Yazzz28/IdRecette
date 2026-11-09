import { esc } from '../utils/dom.js';
import { formatKcal, formatMinutes, formatHours } from '../utils/format.js';
import { thumbColor } from '../core/library.js';
import { icons } from './icons.js';

export function thumbContent(recipe, emojiClass) {
  return recipe.image
    ? `<img src="${esc(recipe.image)}" alt="" loading="lazy">`
    : `<span class="${emojiClass}" aria-hidden="true">${esc(recipe.emoji)}</span>`;
}

/** HTML d'une carte recette. Les boutons portent data-action pour la délégation d'événements. */
export function recipeCard(recipe, { categoriesById, isFav, inMenu, index = 0 }) {
  const category = categoriesById.get(recipe.category);
  const tags = recipe.tags.slice(0, 3).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

  return `
  <article class="card" data-id="${esc(recipe.id)}" style="animation-delay:${Math.min(index, 12) * 30}ms">
    <a class="card__link" href="#/recette/${encodeURIComponent(recipe.id)}" aria-label="Voir la recette ${esc(recipe.title)}"></a>
    <div class="card__thumb" style="--thumb:${thumbColor(recipe, categoriesById)}">
      ${thumbContent(recipe, 'card__emoji')}
      <span class="card__cat">${esc(category?.label ?? '')}</span>
      <button type="button" class="icon-btn card__fav" data-action="fav" aria-pressed="${isFav}"
        aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}">${isFav ? icons.heartFilled : icons.heart}</button>
    </div>
    <div class="card__body">
      <h3 class="card__title">${esc(recipe.title)}</h3>
      ${recipe.description ? `<p class="card__desc">${esc(recipe.description)}</p>` : ''}
      ${tags ? `<div class="card__tags">${tags}</div>` : ''}
      <div class="card__meta">
        <span class="card__info" title="${recipe.cookTime ? 'Préparation + cuisson' : 'Préparation'}">${icons.clock}${formatMinutes(recipe.activeTime)}</span>
        ${recipe.freezeTime ? `<span class="card__info" title="Congélation">${icons.snow}${formatHours(recipe.freezeTime)}</span>` : ''}
        <span class="chip chip--sm chip--kcal chip--static">${icons.flame}${formatKcal(recipe.kcalPerServing)} kcal</span>
        <button type="button" class="card__add" data-action="menu" aria-pressed="${inMenu}"
          aria-label="${inMenu ? 'Retirer du menu' : 'Ajouter au menu'}" title="${inMenu ? 'Dans ton menu' : 'Ajouter au menu'}">${inMenu ? icons.check : icons.plus}</button>
      </div>
    </div>
  </article>`;
}

/** Met à jour l'état favori / menu d'une carte existante sans la re-rendre. */
export function syncCardState(card, { isFav, inMenu }) {
  const fav = card.querySelector('[data-action="fav"]');
  const add = card.querySelector('[data-action="menu"]');
  if (fav && fav.getAttribute('aria-pressed') !== String(isFav)) {
    fav.setAttribute('aria-pressed', String(isFav));
    fav.setAttribute('aria-label', isFav ? 'Retirer des favoris' : 'Ajouter aux favoris');
    fav.innerHTML = isFav ? icons.heartFilled : icons.heart;
  }
  if (add && add.getAttribute('aria-pressed') !== String(inMenu)) {
    add.setAttribute('aria-pressed', String(inMenu));
    add.setAttribute('aria-label', inMenu ? 'Retirer du menu' : 'Ajouter au menu');
    add.title = inMenu ? 'Dans ton menu' : 'Ajouter au menu';
    add.innerHTML = inMenu ? icons.check : icons.plus;
  }
}
