const TICKETS_KEY = 'hubdigital_tickets_v1';
const PROFILE_KEY = 'hubdigital_profile_v1';

const seedTickets = [
    {
        id: 'HD-1001',
        name: 'Антон',
        contact: '@anton_business',
        service: 'Сайт для бизнеса',
        text: 'Нужен сайт услуг с заявками и нормальной мобильной версией.',
        status: 'new',
        createdAt: '2026-06-28T13:20:00Z'
    },
    {
        id: 'HD-1002',
        name: 'Мария',
        contact: 'maria@company.ru',
        service: 'CRM и автоматизация',
        text: 'Хотим собирать лиды с сайта и видеть статусы заявок.',
        status: 'work',
        createdAt: '2026-06-29T08:45:00Z'
    },
    {
        id: 'HD-1003',
        name: 'Илья',
        contact: '+7 900 000-00-00',
        service: 'Telegram-бот',
        text: 'Нужен бот для записи клиентов и быстрых ответов.',
        status: 'done',
        createdAt: '2026-06-29T10:15:00Z'
    }
];

const caseData = {
    clinic: {
        title: 'Сайт клиники с заявками',
        badge: 'Запись клиентов',
        text: 'Структура услуг, карточки специалистов, формы записи и уведомления администратору. Такой формат подходит для медицинских центров, салонов и частных специалистов.',
        result: 'Быстрый путь от просмотра услуги до заявки.'
    },
    agency: {
        title: 'Портал агентства',
        badge: 'B2B',
        text: 'Услуги, портфолио, личный кабинет клиента, база знаний и заявочная система в одном интерфейсе.',
        result: 'Меньше ручных переписок, больше прозрачности для клиента.'
    },
    shop: {
        title: 'Каталог услуг и оплат',
        badge: 'Продажи',
        text: 'Тарифы, пакеты, формы заказа, статусы и понятный путь к повторной покупке.',
        result: 'Удобнее продавать услуги и вести текущих клиентов.'
    }
};

const articleData = {
    brief: {
        title: 'Как подготовить ТЗ без сложных слов',
        text: 'Опишите цель проекта, кто будет пользоваться сайтом, какие действия должны быть на странице и какие примеры вам нравятся. Этого достаточно, чтобы начать прототип.'
    },
    domain: {
        title: 'Что нужно для запуска на домене',
        text: 'Нужен домен, доступ к DNS, хостинг или GitHub Pages, а также проверка HTTPS. Для hub-digital.ru уже используется рабочий домен.'
    },
    cabinet: {
        title: 'Зачем бизнесу личный кабинет',
        text: 'Кабинет помогает клиенту видеть статусы заявок, документы, этапы проекта и историю общения без хаоса в мессенджерах.'
    },
    support: {
        title: 'Как работает поддержка после релиза',
        text: 'После запуска можно вести правки через заявки: новый блок, текст, фото, ошибка, интеграция или небольшое улучшение.'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ensureTickets();
    bindNavigation();
    bindFaq();
    bindTicketForm();
    bindAccount();
    renderTickets();
    renderProfile();
    showSection('home');
});

function ensureTickets() {
    if (!localStorage.getItem(TICKETS_KEY)) {
        localStorage.setItem(TICKETS_KEY, JSON.stringify(seedTickets));
    }
}

function getTickets() {
    try {
        const tickets = JSON.parse(localStorage.getItem(TICKETS_KEY));
        return Array.isArray(tickets) ? tickets : [];
    } catch (e) {
        return [];
    }
}

function saveTickets(tickets) {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
}

function toggleNav() {
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('active');
}

// Оживляем вообще все элементы с атрибутом data-section на странице
function bindNavigation() {
    document.querySelectorAll('[data-section]').forEach(el => {
        el.addEventListener('click', event => {
            const target = el.getAttribute('data-section');
            if (!target) return;
            event.preventDefault();
            showSection(target);
        });
    });
}

function showSection(id) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === id);
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === id);
    });

    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindFaq() {
    document.querySelectorAll('.faq-item h3').forEach(title => {
        title.addEventListener('click', () => {
            title.closest('.faq-item').classList.toggle('open');
        });
    });
}

function bindTicketForm() {
    const form = document.getElementById('ticketForm');
    if (!form) return;

    form.addEventListener('submit', event => {
        event.preventDefault();

        const ticket = {
            id: makeTicketId(),
            name: document.getElementById('ticketName').value.trim(),
            contact: document.getElementById('ticketContact').value.trim(),
            service: document.getElementById('ticketService').value,
            text: document.getElementById('ticketText').value.trim(),
            status: 'new',
            createdAt: new Date().toISOString()
        };

        const tickets = getTickets();
        tickets.unshift(ticket);
        saveTickets(tickets);
        form.reset();
        renderTickets();
        renderProfile();
        showToast('Заявка создана. Она появилась в локальной мини-базе.');
    });
}

function makeTicketId() {
    const number = 1000 + getTickets().length + 1;
    return `HD-${number}`;
}

function renderTickets() {
    const list = document.getElementById('ticketList');
    if (!list) return;

    const tickets = getTickets();
    if (!tickets.length) {
        list.innerHTML = '<p class="ticket">Заявок пока нет.</p>';
        return;
    }

    list.innerHTML = tickets.map(ticket => `
        <article class="ticket">
            <div class="ticket-head">
                <strong>${escapeHtml(ticket.id)} · ${escapeHtml(ticket.service)}</strong>
                <span class="status status-${ticket.status}">${statusLabel(ticket.status)}</span>
            </div>
            <p>${escapeHtml(ticket.text)}</p>
            <small>${escapeHtml(ticket.name)} · ${escapeHtml(ticket.contact)} · ${formatDate(ticket.createdAt)}</small>
            <div class="ticket-actions">
                <button class="btn ghost btn-compact" onclick="setTicketStatus('${ticket.id}', 'new')">Новая</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus('${ticket.id}', 'work')">В работе</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus('${ticket.id}', 'done')">Закрыть</button>
            </div>
        </article>
    `).join('');

    const ticketCount = document.getElementById('ticketCount');
    if (ticketCount) ticketCount.textContent = String(tickets.length);
}

function statusLabel(status) {
    if (status === 'work') return 'В работе';
    if (status === 'done') return 'Закрыта';
    return 'Новая';
}

function setTicketStatus(id, status) {
    const tickets = getTickets().map(ticket => (
        ticket.id === id ? { ...ticket, status } : ticket
    ));
    saveTickets(tickets);
    renderTickets();
    showToast(`Статус ${id} обновлён.`);
}

function clearClosedTickets() {
    const active = getTickets().filter(ticket => ticket.status !== 'done');
    saveTickets(active);
    renderTickets();
    renderProfile();
    showToast('Закрытые заявки очищены.');
}

function prefillTicket(service) {
    showSection('support');
    const select = document.getElementById('ticketService');
    if (select) select.value = service;
    const text = document.getElementById('ticketText');
    if (text && !text.value) text.value = `Интересует услуга: ${service}. Нужно обсудить детали проекта.`;
    document.getElementById('ticketName')?.focus();
}

function bindAccount() {
    const loginForm = document.getElementById('loginForm');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const profile = {
                name: document.getElementById('loginName').value.trim(),
                email: document.getElementById('loginEmail').value.trim(),
                company: document.getElementById('loginCompany').value.trim(),
                about: ''
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
            renderProfile();
            showToast('Кабинет создан локально.');
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', event => {
            event.preventDefault();
            const profile = getProfile();
            profile.about = document.getElementById('aboutText').value.trim();
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
            showToast('Описание бизнеса сохранено.');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(PROFILE_KEY);
            renderProfile();
            showToast('Вы вышли из кабинета.');
        });
    }
}

function getProfile() {
    try {
        return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
    } catch (e) {
        return null;
    }
}

function renderProfile() {
    const profile = getProfile();
    const loginForm = document.getElementById('loginForm');
    const panel = document.getElementById('profilePanel');
    const ticketCount = document.getElementById('ticketCount');

    if (ticketCount) ticketCount.textContent = String(getTickets().length);

    if (!loginForm || !panel) return;
    loginForm.style.display = profile ? 'none' : 'grid';
    panel.style.display = profile ? 'block' : 'none';

    if (!profile) return;

    document.getElementById('profileAvatar').textContent = getInitials(profile.name);
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileCompany').textContent = profile.company;
    document.getElementById('aboutText').value = profile.about || '';
}

function getInitials(name) {
    return (name || 'HD')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'HD';
}

function showCase(id) {
    const item = caseData[id];
    if (!item) return;
    openModal(`
        <span class="badge">${escapeHtml(item.badge)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.text)}</p>
        <p><strong>Результат:</strong> ${escapeHtml(item.result)}</p>
        <button class="btn primary" onclick="closeModal(); prefillTicket('${escapeAttr(item.title)}')">Хочу похожий проект</button>
    `);
}

function showArticle(id) {
    const article = articleData[id];
    if (!article) return;
    openModal(`
        <p class="overline">База знаний</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p>${escapeHtml(article.text)}</p>
    `);
}

function openModal(html) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;
    body.innerHTML = html;
    modal.style.display = 'grid';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

function showToast(message) {
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 3200);
}

function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
    return escapeHtml(value).replaceAll('`', '&#096;');
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
});
