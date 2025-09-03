// Список імен
const NAMES = [
  "Ахіджанов Микола","Бублик Анатолій","Васін Максим","Волоцький Дмитро",
  "Галенко Максим","Джуманов Дамір","Дрозд Євгеній","Дяченко Ігор",
  "Житченко Олександр","Жолонка Дмитро","Заголовацький Богдан",
  "Карпенко Ігор","Корніліч Кирило","Лаврушко Максим","Мартин Владислав",
  "Михайлов Владислав","Поліщук Денис","Решетніков Максим",
  "Сердюк Станіслав","Слиньок Матвій","Терещенко Денис","Хоменко Олександр"
];

const STORAGE_KEY = 'duties';
let duties = {};           // { 'YYYY-MM-DD': { name: true, … }, … }
let selectedDate = getTodayISO();

// DOM
const dutyListEl   = document.getElementById('dutyList');
const currentDateEl= document.getElementById('currentDate');
const datePickerEl = document.getElementById('datePicker');
const summaryEl    = document.getElementById('summaryChart');

// Инициализация datePicker
datePickerEl.value = selectedDate;
datePickerEl.addEventListener('change', () => {
  selectedDate = datePickerEl.value || getTodayISO();
  renderList();
});

// Утилиты для даты
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDate(iso) {
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// LocalStorage
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) duties = JSON.parse(saved);
}
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(duties));
}

// Рендер списка дежурных
function renderList() {
  const dayData = duties[selectedDate] || {};
  currentDateEl.textContent = `На ${formatDate(selectedDate)}`;
  dutyListEl.innerHTML = '';

  NAMES.forEach((name,i) => {
    const onDuty = !!dayData[name];
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

// Переключение дежурства
function toggleDuty(name) {
  if (!duties[selectedDate]) duties[selectedDate] = {};
  duties[selectedDate][name] = !duties[selectedDate][name];
  saveData();
  renderList();
}

// Рендер суммарной статистики
function renderSummary() {
  // Считаем для каждого name
  const counts = NAMES.reduce((acc,n) => (acc[n]=0,acc), {});
  Object.values(duties).forEach(day => {
    NAMES.forEach(n => { if (day[n]) counts[n]++; });
  });
  const maxCount = Math.max(...Object.values(counts), 0);

  summaryEl.innerHTML = '';
  NAMES.forEach((name,i) => {
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
    // даём время браузеру отрисовать, потом меняем ширину
    setTimeout(() => {
      fill.style.width = `${(cnt / maxCount) * 100}%`;
    }, 50 + i * 30);

    bar.append(fill);

    const countEl = document.createElement('div');
    countEl.className = 'summary-count';
    animateCount(countEl, cnt, 800);

    row.append(nameEl, bar, countEl);
    summaryEl.append(row);
  });
}

// Анимация счётчика
function animateCount(el, to, duration) {
  let start = 0;
  el.textContent = '0';
  const step = Math.max(Math.floor(duration / (to || 1)), 20);
  const timer = setInterval(() => {
    start++;
    el.textContent = start;
    if (start >= to) clearInterval(timer);
  }, step);
}

// Перезагрузка после полуночи
function scheduleReload() {
  const now = new Date();
  const next = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1);
  setTimeout(() => {
    selectedDate = getTodayISO();
    datePickerEl.value = selectedDate;
    renderList();
    scheduleReload();
  }, next - now);
}

// Стартуем
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderList();
  scheduleReload();
});

