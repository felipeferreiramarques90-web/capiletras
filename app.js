const storageKey = 'capiletras.cards.v1';
const colors = ['peach', 'lavender', 'yellow', 'mint'];
const form = document.querySelector('#create-form');
const word = document.querySelector('#word');
const status = document.querySelector('#status');
let cards = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) cards = saved.filter(c => c && typeof c.text === 'string' && c.text.trim() && c.text.length <= 24 && colors.includes(c.color)).slice(0, 60);
} catch { status.textContent = 'Não foi possível recuperar a mesa salva.'; }
function render() {
  document.querySelector('#count').textContent = `${cards.length} ${cards.length === 1 ? 'carta' : 'cartas'}`;
  document.querySelector('#empty').hidden = cards.length > 0;
  const container = document.querySelector('#cards');
  container.replaceChildren();
  cards.forEach((card, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `card ${card.color}${card.flipped ? ' flipped' : ''}`;
    button.style.setProperty('--rotation', `${(index % 5 - 2) * 2}deg`);
    button.setAttribute('aria-label', card.flipped ? 'Revelar carta' : `Virar carta ${card.text}`);
    for (const [className, text] of [['corner', card.flipped ? '✦' : String(index + 1).padStart(2, '0')], ['value', card.flipped ? '✳' : card.text], ['bottom', 'CAPILETRAS']]) {
      const span = document.createElement('span'); span.className = className; span.textContent = text; button.append(span);
    }
    button.addEventListener('click', () => { card.flipped = !card.flipped; save(); render(); container.children[index]?.focus(); });
    container.append(button);
  });
}
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(cards)); }
  catch { status.textContent = 'A mesa funciona, mas este navegador não permitiu salvá-la.'; }
}
function add(text, color) {
  if (cards.length >= 60) { status.textContent = 'A mesa está cheia! Limpe-a para criar mais cartas.'; return false; }
  cards.push({ text, color, flipped: false }); save(); render();
  status.textContent = `Carta “${text}” criada. Sua vez de inventar!`; return true;
}
form.addEventListener('submit', event => {
  event.preventDefault(); const text = word.value.trim();
  if (!text) { word.setCustomValidity('Escreva uma letra ou palavra.'); word.reportValidity(); return; }
  if (add(text, form.elements.color.value)) { word.value = ''; document.querySelector('#length').textContent = '0/24'; word.focus(); }
});
word.addEventListener('input', () => { word.setCustomValidity(''); document.querySelector('#length').textContent = `${word.value.length}/24`; });
document.querySelector('#random').addEventListener('click', () => add('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)], colors[Math.floor(Math.random() * colors.length)]));
document.querySelector('#clear').addEventListener('click', () => {
  if (!cards.length || !confirm('Limpar todas as cartas da mesa?')) return;
  cards = []; save(); render(); status.textContent = 'Mesa limpa. Pronta para novas ideias!';
});
render();
