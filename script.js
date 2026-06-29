// Инициализация базы данных IndexedDB
const DB_NAME = 'HubDigitalDB';
const DB_VERSION = 1;
const STORE_NAME = 'tickets';
const PROFILE_KEY = 'hubdigital_profile_v1';
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

const caseData = {
    clinic: { title: 'Бот-запись для медцентров', badge: 'Автоматизация', text: 'Позволяет пациентам выбирать врача, дату и время внутри Телеграм. Администраторы видят аналитику прямо в панели.', result: 'Снижение нагрузки на колл-центр на 40%.' },
    agency: { title: 'Кабинет Дистрибьютора', badge: 'Личные кабинеты', text: 'Оптовый портал для автоматического формирования счетов, актов и отслеживания баланса договоров контрагентов.', result: 'Исключены ошибки ручного ввода счетов в 1С.' }
};

const articleData = {
    brief: { title: 'Шаблон ТЗ на разработку бота', text: 'Для успешного старта бота опишите: Какие команды должен обрабатывать бот? Нужна ли корзина и интеграция платежей? Куда отправлять уведомления о новых заказах (в чат группы или CRM)?' },
    domain: { title: 'Как подключить WebApp в Telegram', text: 'WebApps позволяют открывать полноценные адаптивные сайты (как этот) прямо внутри интерфейса Telegram. Для подключения создайте бота в @BotFather, перейдите в Bot Settings -> Menu Button и укажите URL вашего сайта на GitHub Pages.' },
    db: { title: 'Как устроена база IndexedDB в браузере', text: 'В отличие от localStorage, который хранит только строки до 5 МБ, IndexedDB — это полноценная транзакционная база данных внутри вашего браузера. Она позволяет надежно хранить структурированные объекты практически неограниченного объема.' }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initDB();
        await renderTickets();
    } catch (e) {
        console.error('Ошибка инициализации IndexedDB:', e);
    }
    bindNavigation();
    bindTicketForm();
    bindProfileForm();
    loadProfile();
    showSection('home');
});

// Навигация
function bindNavigation() {
    document.querySelectorAll('[data-section]').forEach(el => {
        el.addEventListener('click', e => {
            e.preventDefault();
            showSection(el.getAttribute('data-section'));
        });
    });
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === id));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('data-section') === id));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleNav() {
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('active');
}

// Работа с Базой Данных (IndexedDB операции)
function getAllTicketsFromDB() {
    return new Promise((resolve) => {
        if (!db) return resolve([]);
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve([]);
    });
}

function addTicketToDB(ticket) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(ticket);
        tx.oncomplete = () => resolve(true);
    });
}

function deleteTicketFromDB(id) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
    });
}

// CRM Функционал
function bindTicketForm() {
    const form = document.getElementById('ticketForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const ticket = {
            id: 'HD-' + Date.now().toString().slice(-5),
            name: document.getElementById('ticketName').value.trim(),
            contact: document.getElementById('ticketContact').value.trim(),
            service: document.getElementById('ticketService').value,
            text: document.getElementById('ticketText').value.trim(),
            status: 'new',
            date: new Date().toLocaleDateString('ru-RU')
        };
        await addTicketToDB(ticket);
        form.reset();
        await renderTickets();
    });
}

async function renderTickets() {
    const list = document.getElementById('ticketList');
    if (!list) return;

    const tickets = await getAllTicketsFromDB();
    
    // Обновление статистики на главной
    document.getElementById('stat-total').textContent = tickets.length;
    document.getElementById('stat-active').textContent = tickets.filter(t => t.status !== 'done').length;

    if (!tickets.length) {
        list.innerHTML = '<p style="color:var(--muted)">База данных пуста.</p>';
        return;
    }

    list.innerHTML = tickets.map(t => `
        <div class="ticket">
            <div class="ticket-head">
                <span>${t.id} · ${t.service}</span>
                <span class="status status-${t.status}">${t.status === 'new' ? 'Новый' : t.status === 'work' ? 'В работе' : 'Закрыт'}</span>
            </div>
            <p style="margin: 4px 0;">${t.text}</p>
            <small style="color:var(--muted)">${t.name} (${t.contact}) — ${t.date}</small>
            <div style="margin-top: 10px; display:flex; gap:6px;">
                <button class="btn ghost btn-compact" onclick="updateStatus('${t.id}', 'work')">В работу</button>
                <button class="btn ghost btn-compact" onclick="updateStatus('${t.id}', 'done')">Закрыть</button>
            </div>
        </div>
    `).join('');
}

async function updateStatus(id, status) {
    const tickets = await getAllTicketsFromDB();
    const ticket = tickets.find(t => t.id === id);
    if (ticket) {
        ticket.status = status;
        await addTicketToDB(ticket);
        await renderTickets();
    }
}

async function clearClosedTickets() {
    const tickets = await getAllTicketsFromDB();
    for (const t of tickets) {
        if (t.status === 'done') {
            await deleteTicketFromDB(t.id);
        }
    }
    await renderTickets();
}

function prefillTicket(service) {
    showSection('support');
    document.getElementById('ticketService').value = service;
    document.getElementById('ticketText').value = `Интересует пакет услуг: "${service}". Жду спецификацию проекта.`;
}

// Управление профилем ИП
function bindProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const prof = {
            company: document.getElementById('profCompany').value,
            inn: document.getElementById('profInn').value,
            email: document.getElementById('profEmail').value,
            about: document.getElementById('profAbout').value
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(prof));
        alert('Данные профиля ИП успешно обновлены!');
    });
}

function loadProfile() {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (!saved) return;
    const prof = JSON.parse(saved);
    document.getElementById('profCompany').value = prof.company || '';
    document.getElementById('profInn').value = prof.inn || '';
    document.getElementById('profEmail').value = prof.email || '';
    document.getElementById('profAbout').value = prof.about || '';
}

// Модальные окна
function showCase(id) {
    const c = caseData[id];
    openModal(`
        <span class="chip">${c.badge}</span>
        <h2 style="margin: 12px 0;">${c.title}</h2>
        <p>${c.text}</p>
        <p><strong>Результат решения:</strong> ${c.result}</p>
    `);
}

function showArticle(id) {
    const a = articleData[id];
    openModal(`
        <h2>${a.title}</h2>
        <p style="line-height:1.6;">${a.text}</p>
    `);
}

function openModal(html) {
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('modal').style.display = 'grid';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
