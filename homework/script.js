// ================= Navigation =================
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const sidebar = document.getElementById('sidebar');
const backdrop = document.getElementById('backdrop');
const hamburger = document.getElementById('hamburger');

function goToPage(pageKey){
  navItems.forEach(b => b.classList.toggle('active', b.dataset.page === pageKey));
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === pageKey));
}

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    goToPage(btn.dataset.page);
    closeDrawer();
  });
});

function openDrawer(){ sidebar.classList.add('open'); backdrop.classList.add('show'); }
function closeDrawer(){ sidebar.classList.remove('open'); backdrop.classList.remove('show'); }
hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeDrawer() : openDrawer();
});
backdrop.addEventListener('click', closeDrawer);

// ================= Modal system (centered) =================
const modalOverlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openModal(html){
  modalBody.innerHTML = html;
  modalOverlay.classList.add('open');
}
function closeModal(){
  modalOverlay.classList.remove('open');
  modalBody.innerHTML = '';
}
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeModal(); });

// ================= Toast =================
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(text){
  toastEl.textContent = text;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

// ================= Students data =================
let nextStudentId = 18;
const courseColors = {
  'Vibe Coding Pro': {bg:'#23284a', tc:'#9db4ff'},
  'Frontend': {bg:'#132339', tc:'#6ea8fe'},
  'Python': {bg:'#143321', tc:'#4ade80'},
  'Design': {bg:'#3a2a12', tc:'#f5a742'},
};
const students = [
  {id:1, name:'Алишер Каримов', email:'alisher.k@mail.uz', course:'Vibe Coding Pro', status:'Активный', pay:'Оплачено'},
  {id:2, name:'Дилнура Рахимова', email:'dilnura.r@mail.uz', course:'Frontend', status:'Активный', pay:'Долг 800 000 сум'},
  {id:3, name:'Бекзод Тошматов', email:'bekzod.t@mail.uz', course:'Python', status:'Активный', pay:'Оплачено'},
  {id:4, name:'Малика Юсупова', email:'malika.yu@mail.uz', course:'Frontend', status:'Активный', pay:'Оплачено'},
  {id:5, name:'Жасур Абдуллаев', email:'jasur.a@mail.uz', course:'Vibe Coding Pro', status:'На паузе', pay:'Долг 1 200 000 сум'},
  {id:6, name:'Нилуфар Азимова', email:'nilufar.a@mail.uz', course:'Design', status:'Активный', pay:'Оплачено'},
  {id:7, name:'Сардор Исмоилов', email:'sardor.i@mail.uz', course:'Python', status:'Выпустился', pay:'Оплачено'},
  {id:8, name:'Зарина Хамидова', email:'zarina.h@mail.uz', course:'Design', status:'Активный', pay:'Долг 400 000 сум'},
  {id:9, name:'Отабек Назаров', email:'otabek.n@mail.uz', course:'Frontend', status:'На паузе', pay:'Оплачено'},
  {id:10, name:'Гулноза Саидова', email:'gulnoza.s@mail.uz', course:'Vibe Coding Pro', status:'Активный', pay:'Оплачено'},
  {id:11, name:'Шахзод Эргашев', email:'shahzod.e@mail.uz', course:'Python', status:'Активный', pay:'Долг 1 750 000 сум'},
  {id:12, name:'Камила Мирзаева', email:'kamila.m@mail.uz', course:'Design', status:'Выпустился', pay:'Оплачено'},
  {id:13, name:'Улугбек Раимов', email:'ulugbek.r@mail.uz', course:'Frontend', status:'Активный', pay:'Оплачено'},
  {id:14, name:'Севара Ахмедова', email:'sevara.a@mail.uz', course:'Python', status:'Активный', pay:'Долг 600 000 сум'},
  {id:15, name:'Фаррух Холиков', email:'farrukh.h@mail.uz', course:'Vibe Coding Pro', status:'Активный', pay:'Оплачено'},
  {id:16, name:'Мадина Юлдашева', email:'madina.y@mail.uz', course:'Vibe Coding Pro', status:'Активный', pay:'Оплачено'},
  {id:17, name:'Дилором Носирова', email:'dilorom.n@mail.uz', course:'Design', status:'Активный', pay:'Оплачено'},
];

function initials(name){
  return name.trim().split(/\s+/).map(w => w[0]).slice(0,2).join('').toUpperCase();
}
function statusBadge(status){
  if(status === 'Активный') return `<span class="badge active">Активный</span>`;
  if(status === 'На паузе') return `<span class="badge paused">На паузе</span>`;
  return `<span class="badge grad">Выпустился</span>`;
}
function payHtml(pay){
  return pay.startsWith('Долг') ? `<span class="debt">${pay}</span>` : `<span class="paid">${pay}</span>`;
}
function actionsHtml(id){
  return `
    <button class="icon-btn" data-action="edit" data-id="${id}" aria-label="Редактировать"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button>
    <button class="icon-btn danger" data-action="delete" data-id="${id}" aria-label="Удалить"><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  `;
}

function getFilteredStudents(){
  const q = document.getElementById('studentSearch').value.trim().toLowerCase();
  const course = document.getElementById('courseFilter').value;
  const status = document.getElementById('statusFilter').value;
  return students.filter(s =>
    s.name.toLowerCase().includes(q) &&
    (course === '' || s.course === course) &&
    (status === '' || s.status === status)
  );
}

function renderStudents(){
  const filtered = getFilteredStudents();
  document.getElementById('foundCount').textContent = `Найдено: ${filtered.length} из ${students.length}`;

  const tbody = document.getElementById('studentsTbody');
  if(filtered.length === 0){
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:26px;">Ничего не найдено</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(s => {
      const c = courseColors[s.course] || {bg:'#2a2f3d', tc:'#c0c7d4'};
      return `
      <tr>
        <td><div class="stud-avatar" style="background:${c.bg};color:${c.tc}">${initials(s.name)}</div></td>
        <td>${s.name}</td>
        <td class="email-cell">${s.email}</td>
        <td><span class="course-tag" style="color:${c.tc}">${s.course}</span></td>
        <td>${statusBadge(s.status)}</td>
        <td>${payHtml(s.pay)}</td>
        <td><div class="row-actions">${actionsHtml(s.id)}</div></td>
      </tr>
    `;}).join('');
  }

  const cards = document.getElementById('studentsCards');
  if(filtered.length === 0){
    cards.innerHTML = `<div class="card" style="text-align:center;color:var(--muted);">Ничего не найдено</div>`;
  } else {
    cards.innerHTML = filtered.map(s => {
      const c = courseColors[s.course] || {bg:'#2a2f3d', tc:'#c0c7d4'};
      return `
      <div class="student-card">
        <div class="student-card-top">
          <div class="stud-avatar" style="background:${c.bg};color:${c.tc}">${initials(s.name)}</div>
          <div>
            <div class="student-card-name">${s.name}</div>
            <div class="student-card-email">${s.email}</div>
          </div>
        </div>
        <div class="student-card-grid">
          <div><div class="k">Курс</div><span class="course-tag" style="color:${c.tc}">${s.course}</span></div>
          <div><div class="k">Статус</div>${statusBadge(s.status)}</div>
          <div style="grid-column:1/-1"><div class="k">Оплата</div>${payHtml(s.pay)}</div>
        </div>
        <div class="student-card-actions">${actionsHtml(s.id)}</div>
      </div>
    `;}).join('');
  }
}
document.getElementById('studentSearch').addEventListener('input', renderStudents);
document.getElementById('courseFilter').addEventListener('change', renderStudents);
document.getElementById('statusFilter').addEventListener('change', renderStudents);
renderStudents();

// ---- Add / edit / delete student modals ----
function studentFormHtml(existing){
  const s = existing || {name:'', email:'', course:'Vibe Coding Pro', status:'Активный', pay:'Оплачено'};
  const debt = s.pay.startsWith('Долг') ? s.pay.replace(/[^0-9]/g,'') : '';
  return `
    <h2 class="modal-title">${existing ? 'Редактировать студента' : 'Добавить студента'}</h2>
    <div class="modal-field">
      <label>Имя и фамилия</label>
      <input type="text" id="mfName" value="${s.name}" placeholder="Например, Азиз Каримов">
    </div>
    <div class="modal-field">
      <label>Email</label>
      <input type="text" id="mfEmail" value="${s.email}" placeholder="email@mail.uz">
    </div>
    <div class="modal-field">
      <label>Курс</label>
      <select id="mfCourse">
        ${Object.keys(courseColors).map(c => `<option value="${c}" ${c===s.course?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="modal-field">
      <label>Статус</label>
      <select id="mfStatus">
        ${['Активный','На паузе','Выпустился'].map(st => `<option value="${st}" ${st===s.status?'selected':''}>${st}</option>`).join('')}
      </select>
    </div>
    <div class="modal-field">
      <label>Задолженность (сум, оставить пустым если оплачено)</label>
      <input type="text" id="mfDebt" value="${debt}" placeholder="0">
    </div>
    <div class="modal-actions">
      <button class="btn-secondary" id="mfCancel">Отмена</button>
      <button class="btn-primary" id="mfSave" style="margin-left:0">Сохранить</button>
    </div>
  `;
}

function openAddStudentModal(){
  openModal(studentFormHtml(null));
  bindStudentForm(null);
}
function openEditStudentModal(id){
  const s = students.find(x => x.id === Number(id));
  if(!s) return;
  openModal(studentFormHtml(s));
  bindStudentForm(s);
}
function bindStudentForm(existing){
  document.getElementById('mfCancel').addEventListener('click', closeModal);
  document.getElementById('mfSave').addEventListener('click', () => {
    const name = document.getElementById('mfName').value.trim();
    const email = document.getElementById('mfEmail').value.trim();
    const course = document.getElementById('mfCourse').value;
    const status = document.getElementById('mfStatus').value;
    const debtVal = document.getElementById('mfDebt').value.trim().replace(/\s/g,'');
    if(!name || !email){
      showToast('Заполните имя и email');
      return;
    }
    const pay = debtVal && Number(debtVal) > 0
      ? `Долг ${Number(debtVal).toLocaleString('ru-RU')} сум`
      : 'Оплачено';

    if(existing){
      Object.assign(existing, {name, email, course, status, pay});
      showToast('Студент обновлён');
    } else {
      students.push({id: nextStudentId++, name, email, course, status, pay});
      showToast('Студент добавлен');
    }
    renderStudents();
    closeModal();
  });
}

function openDeleteStudentModal(id){
  const s = students.find(x => x.id === Number(id));
  if(!s) return;
  openModal(`
    <h2 class="modal-title">Удалить студента?</h2>
    <p class="modal-sub">Вы собираетесь удалить <strong>${s.name}</strong> из системы. Это действие нельзя отменить.</p>
    <div class="modal-actions">
      <button class="btn-secondary" id="delCancel">Отмена</button>
      <button class="btn-danger" id="delConfirm">Удалить</button>
    </div>
  `);
  document.getElementById('delCancel').addEventListener('click', closeModal);
  document.getElementById('delConfirm').addEventListener('click', () => {
    const idx = students.findIndex(x => x.id === Number(id));
    if(idx > -1) students.splice(idx, 1);
    renderStudents();
    showToast('Студент удалён');
    closeModal();
  });
}

document.getElementById('addStudentBtn').addEventListener('click', openAddStudentModal);

function bindRowActions(containerId){
  document.getElementById(containerId).addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-action="edit"]');
    const delBtn = e.target.closest('[data-action="delete"]');
    if(editBtn) openEditStudentModal(editBtn.dataset.id);
    if(delBtn) openDeleteStudentModal(delBtn.dataset.id);
  });
}
bindRowActions('studentsTbody');
bindRowActions('studentsCards');

// ================= Courses =================
const courses = {
  'Vibe Coding Pro': {desc:'Создание приложений с ИИ-ассистентами', price:'4 200 000 сум', color:'var(--indigo)'},
  'Frontend': {desc:'HTML, CSS, JavaScript и React с нуля', price:'3 800 000 сум', color:'var(--blue)'},
  'Python': {desc:'Программирование и автоматизация на Python', price:'3 500 000 сум', color:'var(--green)'},
  'Design': {desc:'UI/UX-дизайн и Figma', price:'3 200 000 сум', color:'var(--orange)'},
};

function openCourseModal(courseName){
  const c = courses[courseName];
  const enrolled = students.filter(s => s.course === courseName);
  const debtCount = enrolled.filter(s => s.pay.startsWith('Долг')).length;
  const cc = courseColors[courseName] || {bg:'#2a2f3d', tc:'#c0c7d4'};

  openModal(`
    <h2 class="modal-title">${courseName}</h2>
    <p class="modal-sub">${c.desc}</p>
    <div class="course-detail-row"><span class="k">Стоимость</span><span class="v">${c.price}</span></div>
    <div class="course-detail-row"><span class="k">Студентов на курсе</span><span class="v">${enrolled.length}</span></div>
    <div class="course-detail-row"><span class="k">С задолженностью</span><span class="v">${debtCount}</span></div>

    <div class="modal-group-heading">Группа курса</div>
    <div class="modal-group-list">
      ${enrolled.length ? enrolled.map(s => `
        <div class="modal-group-row" data-id="${s.id}">
          <div class="stud-avatar" style="background:${cc.bg};color:${cc.tc}">${initials(s.name)}</div>
          <div class="modal-group-info">
            <div class="modal-group-name">${s.name}</div>
            <div class="modal-group-email">${s.email}</div>
          </div>
          <div class="modal-group-right">
            ${statusBadge(s.status)}
            <div class="modal-group-pay">${payHtml(s.pay)}</div>
          </div>
        </div>
      `).join('') : `<div class="search-empty">На этот курс пока никто не записан</div>`}
    </div>

    <div class="modal-actions">
      <button class="btn-primary" id="viewCourseStudents" style="margin-left:0">Открыть в разделе «Студенты»</button>
    </div>
  `);
  document.getElementById('viewCourseStudents').addEventListener('click', () => {
    closeModal();
    goToPage('students');
    document.getElementById('studentSearch').value = '';
    document.getElementById('courseFilter').value = courseName;
    document.getElementById('statusFilter').value = '';
    renderStudents();
  });
  document.querySelectorAll('.modal-group-row').forEach(row => {
    row.addEventListener('click', () => openEditStudentModal(row.dataset.id));
  });
}
document.querySelectorAll('.course-row').forEach(row => {
  const trigger = () => openCourseModal(row.dataset.course);
  row.addEventListener('click', trigger);
  row.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); trigger(); } });
});

// ================= Schedule (real dates, recurring weekly pattern) =================
const monthsRu = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const weekdayNames = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const baseMonday = new Date(2026, 5, 23); // Monday June 23 2026

const weeklyPattern = [
  [ {time:'10:00', course:'Vibe Coding Pro', cls:'c-vibe', teacher:'Улугбек Ниязов', room:'ауд. 201'},
    {time:'15:00', course:'Python', cls:'c-python', teacher:'Азиз Рахимов', room:'ауд. 102'} ],
  [ {time:'09:00', course:'Frontend', cls:'c-frontend', teacher:'Камрон Юсупов', room:'ауд. 204'},
    {time:'11:00', course:'Design', cls:'', teacher:'Дэн Умаров', room:'ауд. 305'} ],
  [ {time:'10:00', course:'Vibe Coding Pro', cls:'c-vibe', teacher:'Улугбек Ниязов', room:'ауд. 201'},
    {time:'19:00', course:'Design', cls:'', teacher:'Дэн Умаров', room:'ауд. 305'} ],
  [ {time:'15:00', course:'Python', cls:'c-python', teacher:'Азиз Рахимов', room:'ауд. 102'},
    {time:'17:00', course:'Frontend', cls:'c-frontend', teacher:'Камрон Юсупов', room:'ауд. 204'} ],
  [ {time:'10:00', course:'Vibe Coding Pro', cls:'c-vibe', teacher:'Улугбек Ниязов', room:'ауд. 201'},
    {time:'14:00', course:'Design', cls:'', teacher:'Дэн Умаров', room:'ауд. 305'} ],
  [ {time:'12:00', course:'Frontend', cls:'c-frontend', teacher:'Камрон Юсупов', room:'ауд. 204'} ],
  [ {time:'11:00', course:'Design', cls:'', teacher:'Дэн Умаров', room:'ауд. 305'},
    {time:'16:00', course:'Python', cls:'c-python', teacher:'Азиз Рахимов', room:'ауд. 102'} ],
];

let weekOffset = 0;
let activeCourseFilter = '';

function getWeekDates(offset){
  const start = new Date(baseMonday);
  start.setDate(start.getDate() + offset * 7);
  return Array.from({length:7}, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
function formatWeekLabel(dates){
  const first = dates[0], last = dates[6];
  if(first.getMonth() === last.getMonth()){
    return `${first.getDate()}–${last.getDate()} ${monthsRu[first.getMonth()]} ${first.getFullYear()}`;
  }
  return `${first.getDate()} ${monthsRu[first.getMonth()]} – ${last.getDate()} ${monthsRu[last.getMonth()]} ${last.getFullYear()}`;
}

function renderSchedule(){
  const dates = getWeekDates(weekOffset);
  document.getElementById('weekLabel').textContent = formatWeekLabel(dates);

  const grid = document.getElementById('weekGrid');
  grid.innerHTML = dates.map((date, i) => {
    const lessons = weeklyPattern[i].filter(l => !activeCourseFilter || l.course === activeCourseFilter);
    return `
      <div class="day-col">
        <div class="day-head"><div class="day-name">${weekdayNames[i]}</div><div class="day-num">${date.getDate()}</div></div>
        ${lessons.length ? lessons.map(l => `
          <div class="lesson ${l.cls}">
            <div class="lesson-time">${l.time}</div>
            <div class="lesson-course">${l.course}</div>
            <div class="lesson-teacher">${l.teacher}</div>
            <div class="lesson-room">${l.room}</div>
          </div>
        `).join('') : ''}
      </div>
    `;
  }).join('');
}
renderSchedule();

document.querySelectorAll('#schedulePills .pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#schedulePills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeCourseFilter = pill.dataset.course;
    renderSchedule();
  });
});
document.getElementById('prevWeekBtn').addEventListener('click', () => { weekOffset -= 1; renderSchedule(); });
document.getElementById('nextWeekBtn').addEventListener('click', () => { weekOffset += 1; renderSchedule(); });

// ================= Settings tabs =================
document.querySelectorAll('.settings-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.dataset.tab;
    document.querySelectorAll('.settings-body').forEach(panel => {
      panel.style.display = panel.dataset.tabPanel === key ? 'block' : 'none';
    });
  });
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
  const msg = document.getElementById('savedMsg');
  msg.classList.add('show');
  clearTimeout(window.__savedTimeout);
  window.__savedTimeout = setTimeout(() => msg.classList.remove('show'), 2200);
  showToast('Профиль сохранён');
});

// ---- Photo upload ----
document.getElementById('uploadPhotoBtn').addEventListener('click', () => {
  document.getElementById('photoInput').click();
});
document.getElementById('photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const url = ev.target.result;
    document.getElementById('profileAvatarPreview').style.cssText = `background-image:url(${url});background-size:cover;background-position:center;`;
    document.getElementById('profileAvatarPreview').textContent = '';
    document.getElementById('topbarAvatar').style.cssText = `background-image:url(${url});background-size:cover;background-position:center;`;
    document.getElementById('topbarAvatar').textContent = '';
    showToast('Фото обновлено');
  };
  reader.readAsDataURL(file);
});

// ================= Bell notifications modal =================
const notifications = [
  {icon:'💳', bg:'var(--green-soft)', text:'Малика Юсупова оплатила курс «Frontend» — 1 900 000 сум', time:'10 мин назад'},
  {icon:'👤', bg:'var(--indigo-soft)', text:'Новый студент: Фаррух Холиков записался на «Vibe Coding»', time:'2 часа назад'},
  {icon:'⚠️', bg:'var(--red-soft)', text:'Задолженность: Шахзод Эргашев — просрочка платежа 5 дней', time:'вчера, 12:00'},
];
document.getElementById('bellBtn').addEventListener('click', () => {
  openModal(`
    <h2 class="modal-title">Уведомления</h2>
    ${notifications.map(n => `
      <div class="modal-notif">
        <div class="ic" style="background:${n.bg}">${n.icon}</div>
        <div>
          <div class="modal-notif-text">${n.text}</div>
          <div class="modal-notif-time">${n.time}</div>
        </div>
      </div>
    `).join('')}
  `);
});

// ================= User menu modal =================
document.getElementById('userMenuBtn').addEventListener('click', () => {
  openModal(`
    <h2 class="modal-title">Нодира Каримова</h2>
    <p class="modal-sub">Администратор</p>
    <button class="modal-menu-item" id="menuGoProfile">👤 Профиль администратора</button>
    <button class="modal-menu-item" id="menuGoSettings">⚙️ Настройки системы</button>
    <button class="modal-menu-item" id="menuLogout">🚪 Выйти</button>
  `);
  document.getElementById('menuGoProfile').addEventListener('click', () => {
    closeModal();
    goToPage('settings');
    document.querySelector('.settings-tab[data-tab="profile"]').click();
  });
  document.getElementById('menuGoSettings').addEventListener('click', () => {
    closeModal();
    goToPage('settings');
  });
  document.getElementById('menuLogout').addEventListener('click', () => {
    closeModal();
    showToast('Вы вышли из системы (демо)');
  });
});

// ================= Global header search =================
const globalSearch = document.getElementById('globalSearch');
const searchDropdown = document.getElementById('searchDropdown');

function renderSearchDropdown(query){
  const q = query.trim().toLowerCase();
  if(!q){ searchDropdown.classList.remove('show'); searchDropdown.innerHTML = ''; return; }
  const matches = students.filter(s => s.name.toLowerCase().includes(q)).slice(0, 6);
  if(matches.length === 0){
    searchDropdown.innerHTML = `<div class="search-empty">Студенты не найдены</div>`;
  } else {
    searchDropdown.innerHTML = matches.map(s => {
      const c = courseColors[s.course] || {bg:'#2a2f3d', tc:'#c0c7d4'};
      return `
      <div class="search-result" data-name="${s.name}">
        <div class="stud-avatar" style="background:${c.bg};color:${c.tc}">${initials(s.name)}</div>
        <div>
          <div class="search-result-name">${s.name}</div>
          <div class="search-result-meta">${s.course} · ${s.status}</div>
        </div>
      </div>
    `;}).join('');
  }
  searchDropdown.classList.add('show');
}

globalSearch.addEventListener('input', (e) => renderSearchDropdown(e.target.value));
globalSearch.addEventListener('focus', (e) => { if(e.target.value.trim()) renderSearchDropdown(e.target.value); });
document.addEventListener('click', (e) => {
  if(!e.target.closest('.search-wrap')) searchDropdown.classList.remove('show');
});
searchDropdown.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result');
  if(!item) return;
  const name = item.dataset.name;
  goToPage('students');
  document.getElementById('studentSearch').value = name;
  document.getElementById('courseFilter').value = '';
  document.getElementById('statusFilter').value = '';
  renderStudents();
  searchDropdown.classList.remove('show');
  globalSearch.value = '';
});
globalSearch.addEventListener('keydown', (e) => {
  if(e.key === 'Enter'){
    const first = searchDropdown.querySelector('.search-result');
    if(first) first.click();
  }
});
