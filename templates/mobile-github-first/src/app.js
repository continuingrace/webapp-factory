const APP_KEY = '__APP_SLUG__';
const STORAGE_KEY = `re:${APP_KEY}:note`;
const note = document.querySelector('#note');
const status = document.querySelector('#status');

note.value = localStorage.getItem(STORAGE_KEY) || '';
let timer;
note.addEventListener('input', () => {
  clearTimeout(timer);
  status.textContent = '저장 중…';
  timer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, note.value);
    status.textContent = '자동 저장됨';
  }, 250);
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
