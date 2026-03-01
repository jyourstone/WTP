let overlay;
let modal;
let titleEl;
let bodyEl;
let closeBtn;

export function init() {
  overlay = document.getElementById('modal-overlay');
  modal = document.getElementById('modal');
  titleEl = document.getElementById('modal-title');
  bodyEl = document.getElementById('modal-body');
  closeBtn = document.getElementById('modal-close');

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
}

export function open(title, contentFn) {
  titleEl.textContent = title;
  bodyEl.innerHTML = '';
  contentFn(bodyEl);
  overlay.classList.add('modal-overlay--visible');
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

export function close() {
  overlay.classList.remove('modal-overlay--visible');
  document.body.style.overflow = '';
}

export function isOpen() {
  return overlay.classList.contains('modal-overlay--visible');
}
