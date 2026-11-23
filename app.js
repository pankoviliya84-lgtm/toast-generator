const form = document.querySelector('#settings');
const occasion = document.querySelector('#occasion');
const tone = document.querySelector('#tone');
const recipient = document.querySelector('#name');
const toast = document.querySelector('#toast');
const status = document.querySelector('#status');
const copy = document.querySelector('#copy');
const groups = {
  'Семья и друзья': ['День рождения', 'Юбилей', 'Свадьба', 'Годовщина свадьбы', 'Рождение ребёнка', 'Новоселье', 'Семейное застолье', 'Встреча друзей', 'Встреча выпускников', 'Проводы в путешествие', 'Без повода'],
  'Праздники': ['Новый год', 'Рождество', 'День влюблённых', '23 Февраля', 'Масленица', '8 Марта', 'Пасха', 'День матери', 'День отца'],
  'Учёба и работа': ['Выпускной', 'День учителя', 'Профессиональный праздник', 'За коллег', 'Повышение', 'Завершение проекта', 'Выход на пенсию']
};
// w — тёплый рассказ, l — лёгкий бытовой сюжет, f — торжественное пожелание.
const moods = {
  'День рождения':'wlffw', 'Юбилей':'fwlfw', 'Свадьба':'wlwlf', 'Годовщина свадьбы':'wlwlf',
  'Встреча друзей':'wlwfw', 'Семейное застолье':'wllwf', 'Новоселье':'wwlfw',
  'Рождение ребёнка':'wlwfw', 'Новый год':'wfflw', 'Рождество':'wwlfw',
  '8 Марта':'wlffw', 'День матери':'wwwlf', 'День отца':'wfwlf', 'Выпускной':'fwwlf',
  'День учителя':'wflwf', 'Профессиональный праздник':'fwlwf', 'За коллег':'wfwwl',
  'Выход на пенсию':'lwfwl', 'Повышение':'fwlfw', 'Завершение проекта':'ffwwl',
  'Встреча выпускников':'lwlwf', 'Проводы в путешествие':'wlwwf', 'Без повода':'wwlwf',
  'Масленица':'lwwfw', 'Пасха':'fwlwf', 'День влюблённых':'wwlfw', '23 Февраля':'ffwlw'
};
const moodCodes = { warm: 'w', light: 'l', formal: 'f' };
for (const [label, names] of Object.entries(groups)) {
  const group = document.createElement('optgroup');
  group.label = label;
  for (const name of names) group.append(new Option(name, name));
  occasion.append(group);
}
let position = 0;
function render() {
  const name = occasion.value;
  const texts = catalog[name].filter((_, i) => tone.value === 'all' || moods[name][i] === moodCodes[tone.value]);
  position %= texts.length;
  const full = texts[position];
  const sentences = full.match(/[^.!?]+[.!?]+(?:[»”])?/gu) || [full];
  const body = form.elements.lengthMode.value === 'short'
    ? [sentences[0], sentences[sentences.length - 1]].map(s => s.trim()).join(' ') : full;
  const who = recipient.value.trim().replace(/\s+/g, ' ');
  toast.textContent = who ? who + ' — этот тост в вашу честь! ' + body : body;
  document.querySelector('#result-title').textContent = 'Ваш тост · ' + (position + 1) + ' из ' + texts.length;
  form.querySelector('[type="submit"]').disabled = texts.length === 1;
  status.textContent = '';
}
for (const field of [occasion, tone]) field.addEventListener('change', () => { position = 0; render(); });
for (const field of form.elements.lengthMode) field.addEventListener('change', render);
recipient.addEventListener('input', render);
form.addEventListener('submit', event => {
  event.preventDefault();
  position++;
  render();
  if (matchMedia('(max-width: 740px)').matches) toast.closest('.card').scrollIntoView({block:'nearest'});
});
render();

async function copyToast(result, button, feedback) {
  const value = result.textContent;
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const field = document.createElement('textarea');
    field.value = value;
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch {}
    field.remove();
    button.focus();
    if (!copied) {
      const range = document.createRange();
      range.selectNodeContents(result);
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      feedback.textContent = 'Текст выделен. Скопируйте его вручную.';
      return;
    }
  }
  if (result.textContent === value) feedback.textContent = 'Скопировано';
}

copy.addEventListener('click', () => copyToast(toast, copy, status));

