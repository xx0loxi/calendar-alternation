// Список імен
const NAMES = [
  "Ахіджанов Микола","Бублик Анатолій","Васін Максим","Волоцький Дмитро",
  "Галенко Максим","Джуманов Дамір","Дрозд Євгеній","Дяченко Ігор",
  "Житченко Олександр","Жолонка Дмитро","Заголовацький Богдан",
  "Карпенко Ігор","Корніліч Кирило","Лаврушко Максим","Мартин Владислав",
  "Михайлов Владислав","Поліщук Денис","Решетніков Максим",
  "Сердюк Станіслав","Слиньок Матвій","Терещенко Денис","Хоменко Олександр"
];

// Ключ у localStorage
const STORAGE_KEY = 'duties';
let duties = {};                 // { 'YYYY-MM-DD': { name: true, ... }, ... }
let selectedDate = getTodayISO();

// DOM-елементи
const dutyListEl   = document.getElementById('dutyList');
const currentDateEl= document.getElementById('currentDate');
const datePickerEl = document.getElementById('datePicker');
const summaryEl    = document.getElementById('summaryChart');

// Ініціалізація datePicker
datePickerEl.value = selectedDate;
datePickerEl.addEventListener('change', () => {
  selectedDate = datePickerEl.value || getTodayISO();
  renderList();
});

// Утиліти дати
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDate(iso) {
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// Завантаження / збереження
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) duties = JSON.parse(saved);
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(duties));
}

// Рендер списку дежурних
function renderList() {
  const data = duties[selectedDate] || {};
  currentDateEl.textContent = `На ${formatDate(selectedDate)}`;
  dutyListEl.innerHTML = '';

  NAMES.forEach((name, i) => {
    const onDuty = !!data[name];
    const card = document.createElement('div');
    card.className = 'card' + (onDuty ? ' on-duty' : '');
    card.style.animationDelay = `${i * 0.03}s`;
    card.onclick = () => toggleDuty(name);

    const span = document.createElement('span');
    span.className = 'name';
    span.textContent = name;

    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = onDuty;
    cb.onclick = e => { e.stopPropagation(); toggleDuty(name); };

    card.append(span, cb);
    dutyListEl.append(card);
  });

  renderSummary();
}

// Перемикання чергування
function toggleDuty(name) {
  if (!duties[selectedDate]) duties[selectedDate] = {};
  duties[selectedDate][name] = !duties[selectedDate][name];
  saveData();
  renderList();
}

// Рендер зведеної статистики
function renderSummary() {
  // Підрахунок
  const counts = NAMES.reduce((acc, n) => (acc[n] = 0, acc), {});
  Object.values(duties).forEach(day => {
    NAMES.forEach(n => { if (day[n]) counts[n]++; });
  });
  const max = Math.max(...Object.values(counts), 1);

  summaryEl.innerHTML = '';
  NAMES.forEach((name, i) => {
    const cnt = counts[name];
    const row = document.createElement('div');
    row.className = 'summary-row';
    row.style.animationDelay = `${i * 0.03 + 0.2}s`;

    const nameEl = document.createElement('div');
    nameEl.className = 'summary-name';
    nameEl.textContent = name;

    const bar = document.createElement('div');
    bar.className = 'summary-bar';
    const fill = document.createElement('div');
    fill.className = 'summary-bar-fill';
    // встановлюємо ширину з transition
    setTimeout(() => {
      fill.style.width = `${(cnt / max) * 100}%`;
    }, 100 + i * 50);

    bar.append(fill);

    const countEl = document.createElement('div');
    countEl.className = 'summary-count';
    // анімація лічильника
    animateCount(countEl, cnt, 800);

    row.append(nameEl, bar, countEl);
    summaryEl.append(row);
  });
}

// Анімація числа від 0 до toValue за duration мс
function animateCount(el, toValue, duration) {
  if (toValue === 0) {
    el.textContent = '0';
    return;
  }
  let start = 0;
  const stepTime = Math.max(Math.floor(duration / toValue), 20);
  const timer = setInterval(() => {
    start++;
    el.textContent = start;
    if (start >= toValue) clearInterval(timer);
  }, stepTime);
}

// Після переходу опівночі оновлюємо дату
function scheduleMidnightReload() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0,0,1);
  setTimeout(() => {
    selectedDate = getTodayISO();
    datePickerEl.value = selectedDate;
    renderList();
    scheduleMidnightReload();
  }, next - now);
}

// Старт
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderList();
  scheduleMidnightReload();
});
