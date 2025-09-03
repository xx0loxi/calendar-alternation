const NAMES = [
  "Ахіджанов Микола","Бублик Анатолій","Васін Максим","Волоцький Дмитро",
  "Галенко Максим","Джуманов Дамір","Дрозд Євгеній","Дяченко Ігор",
  "Житченко Олександр","Жолонка Дмитро","Заголовацький Богдан",
  "Карпенко Ігор","Корніліч Кирило","Лаврушко Максим","Мартин Владислав",
  "Михайлов Владислав","Поліщук Денис","Решетніков Максим",
  "Сердюк Станіслав","Слиньок Матвій","Терещенко Денис","Хоменко Олександр"
];

const dutyListEl    = document.getElementById('dutyList');
const currentDateEl = document.getElementById('currentDate');
const STORAGE_KEY   = 'duties';
let duties = {};

function getTodayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) duties = JSON.parse(saved);
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(duties));
}

function renderList() {
  const today = getTodayISO();
  currentDateEl.textContent = `На ${formatDate(today)}`;

  dutyListEl.innerHTML = '';
  const dayData = duties[today] || {};

  NAMES.forEach((name, i) => {
    const onDuty = !!dayData[name];

    const card = document.createElement('div');
    card.className = 'card' + (onDuty ? ' on-duty' : '');
    card.dataset.name = name;
    // задержка анимации появления
    card.style.animationDelay = `${i * 0.03}s`;
    card.onclick = () => toggleDuty(name);

    const span = document.createElement('span');
    span.className = 'name';
    span.textContent = name;

    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = onDuty;
    cb.onclick = e => {
      e.stopPropagation();
      toggleDuty(name);
    };

    card.append(span, cb);
    dutyListEl.append(card);
  });
}

function toggleDuty(name) {
  const today = getTodayISO();
  if (!duties[today]) duties[today] = {};
  duties[today][name] = !duties[today][name];
  saveData();

  const card = dutyListEl.querySelector(`[data-name="${name}"]`);
  if (card) {
    card.classList.add('pulse');
    setTimeout(() => card.classList.remove('pulse'), 300);
    card.classList.toggle('on-duty');
  }
}

function scheduleMidnightReload() {
  const now      = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1, 0,0,1);
  setTimeout(() => location.reload(), midnight - now);
}

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderList();
  scheduleMidnightReload();
});
