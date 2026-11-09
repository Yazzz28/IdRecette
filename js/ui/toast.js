let node;
let timer;

export function initToast() {
  node = document.createElement('div');
  node.className = 'toast';
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  document.body.appendChild(node);
}

export function toast(message) {
  if (!node) initToast();
  node.textContent = message;
  node.classList.add('is-visible');
  clearTimeout(timer);
  timer = setTimeout(() => node.classList.remove('is-visible'), 2400);
}
