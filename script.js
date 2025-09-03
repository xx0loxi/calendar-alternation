// 1. Список імен
const NAMES = [
  "Ахіджанов Микола", "Бублик Анатолій", "Васін Максим",
  "Волоцький Дмитро", "Галенко Максим", "Джуманов Дамір",
  "Дрозд Євгеній", "Дяченко Ігор", "Житченко Олександр",
  "Жолонка Дмитро", "Заголовацький Богдан", "Карпенко Ігор",
  "Корніліч Кирило", "Лаврушко Максим", "Мартин Владислав",
  "Михайлов Владислав", "Поліщук Денис", "Решетніков Максим",
  "Сердюк Станіслав", "Слиньок Матвій", "Терещенко Денис",
  "Хоменко Олександр"
];

const dutyListEl    = document.getElementById('dutyList');
const currentDateEl = document.getElementById('currentDate');
const STORAGE_KEY   = 'duties';
let duties = {};

// Повертає сьогоднішню дату в ISO (YYYY-MM-DD)
function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Форматує ISO → DD.MM.YYYY
function formatDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

// Завантажує дані з LocalStorage
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) duties = JSON.parse(saved);
}

// Зберігає зміни в LocalStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(duties));
}

// Малює картки для сьогоднішньої дати
function renderList() {
  const todayISO = getTodayISO();
  currentDateEl.textContent = `На ${formatDate(todayISO)}`;
  dutyListEl.innerHTML = '';

  const dayData = duties[todayISO] || {};

  NAMES.forEach(name => {
    const onDuty = !!dayData[name];

    const card = document.createElement('div');
    card.className = 'card' + (onDuty ? ' on-duty' : '');
    card.onclick = () => toggleDuty(name);

    const span = document.createElement('span');
    span.className = 'name';
    span.textContent = name;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = onDuty;
    checkbox.onclick = e => {
      e.stopPropagation();
      toggleDuty(name);
    };

    card.append(span, checkbox);
    dutyListEl.append(card);
  });
}

// Перемикає стан чергування і оновлює збереження + UI
function toggleDuty(name) {
  const todayISO = getTodayISO();
  if (!duties[todayISO]) duties[todayISO] = {};
  duties[todayISO][name] = !duties[todayISO][name];
  saveData();
  renderList();
}

// Автовідкриття сторінки о півночі для оновлення дати
function scheduleMidnightReload() {
  const now = new Date();
  const midnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,0,1
  );
  const ms = midnight - now;
  setTimeout(() => location.reload(), ms);
}

// Ініціалізація
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderList();
  scheduleMidnightReload();
});