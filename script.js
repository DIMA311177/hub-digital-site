const TICKETS_KEY = 'vpn_tickets_v1';
const PROFILE_KEY = 'vpn_profile_v1';

const seedTickets = [
    {
        id: 'VPN-1001',
        name: 'Дмитрий',
        contact: '@dmitry_dev',
        service: 'Проблема с подключением',
        text: 'Не подключается к серверу в Германии через мобильный интернет. На домашнем Wi-Fi всё работает супер.',
        status: 'work',
        createdAt: '2026-07-15T13:20:00Z'
    }
];

const tariffData = {
    monthly: {
        title: 'Тариф «Старт» (1 месяц)',
        badge: 'Популярно',
        text: 'Доступ ко всем локациям, скорость до 100 Мбит/с, 1 устройство. Идеально для быстрого теста.',
        result: 'Быстрый и безопасный интернет на месяц за 190₽.'
    },
    halfyear: {
        title: 'Тариф «Оптимум» (6 месяцев)',
        badge: 'Выгодно',
        text: 'Доступ ко всем локациям, скорость до 300 Мбит/с, до 3 устройств одновременно.',
        result: 'Экономия 30%. Полная свобода без ограничений за 890₽.'
    },
    yearly: {
        title: 'Тариф «Ультра» (1 год)',
        badge: 'Максимальный сейв',
        text: 'Максимальный приоритет в сети, скорость до 1 Гбит/с, до 5 устройств. Выделенный IP по запросу.',
        result: 'Скидка 50%. Бескомпромиссная защита на целый год за 1490₽.'
    }
};

const articleData = {
    setup: {
        title: 'Как настроить VPN на телефоне?',
        text: 'Скачайте приложение WireGuard или OpenVPN в App Store / Google Play. Перейдите в личный кабинет на нашем сайте, скачайте файл конфигурации (.conf / .ovpn) и просто импортируйте его в установленное приложение. Подключение произойдет автоматически.'
    },
    servers: {
        title: 'Какие локации доступны?',
        text: 'На наших премиум тарифах доступны сверхбыстрые серверы в Германии, Нидерландах, Финляндии, Турции, Казахстане, ОАЭ и США. Список пополняется каждый месяц.'
    },
    speed: {
        title: 'Падает ли скорость при работе?',
        text: 'Наши серверы подключены к гигабитным каналам. Потери скорости минимизированы с помощью современного протокола шифрования и составляют не более 5-10% от базовой скорости вашего провайдера.'
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
        showToast('Тикет успешно отправлен в поддержку!');
    });
}

function makeTicketId() {
    const number = 1000 + getTickets().length + 1;
    return `VPN-${number}`;
}

function renderTickets() {
    const list = document.getElementById('ticketList');
    if (!list) return;

    const tickets = getTickets();
    if (!tickets.length) {
        list.innerHTML = '<p class="ticket">Активных обращений нет.</p>';
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
        </article>
    `).join('');
}

function statusLabel(status) {
    if (status === 'work') return 'В обработке';
    if (status === 'done') return 'Решено';
    return 'Новый';
}

function clearClosedTickets() {
    const active = getTickets().filter(ticket => ticket.status !== 'done');
    saveTickets(active);
    renderTickets();
    showToast('Закрытые тикеты очищены.');
}

function bindAccount() {
    const loginForm = document.getElementById('loginForm');
    const panel = document.getElementById('profilePanel');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', event => {
            event.preventDefault();
            const profile = {
                name: document.getElementById('loginName').value.trim(),
                email: document.getElementById('loginEmail').value.trim(),
                tariff: 'Демо-доступ (3 дня)',
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
                balance: '0₽'
            };
            localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
            renderProfile();
            showToast('Вход успешно выполнен!');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(PROFILE_KEY);
            renderProfile();
            showToast('Вы вышли из аккаунта.');
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

    if (!loginForm || !panel) return;
    loginForm.style.display = profile ? 'none' : 'grid';
    panel.style.display = profile ? 'block' : 'none';

    if (!profile) return;

    document.getElementById('profileAvatar').textContent = getInitials(profile.name);
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileTariff').textContent = profile.tariff;
    document.getElementById('profileExpires').textContent = profile.expires;
    document.getElementById('profileBalance').textContent = profile.balance;
}

function buyTariff(tariffKey) {
    const profile = getProfile();
    if (!profile) {
        showSection('account');
        showToast('Сначала войдите в аккаунт!');
        return;
    }

    const t = tariffData[tariffKey];
    profile.tariff = t.title;
    
    const expDate = new Date();
    if (tariffKey === 'monthly') expDate.setMonth(expDate.getMonth() + 1);
    if (tariffKey === 'halfyear') expDate.setMonth(expDate.getMonth() + 6);
    if (tariffKey === 'yearly') expDate.setFullYear(expDate.getFullYear() + 1);
    
    profile.expires = expDate.toLocaleDateString('ru-RU');
    profile.balance = 'Оплачено';
    
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    renderProfile();
    showSection('account');
    showToast(`Тариф "${t.title}" успешно активирован!`);
}

function downloadConfig() {
    const profile = getProfile();
    if (!profile) {
        showToast('Ошибка: необходимо войти в аккаунт.');
        return;
    }
    
    showToast('Скачивание конфигурации...');
    const configContent = `client
dev tun
proto udp
remote 185.220.101.5 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
key-direction 1
# Данные пользователя: ${profile.name} (${profile.email})
<ca>
-----BEGIN CERTIFICATE-----
MIIB7TCCAZegAwIBAgIJAP9Z4dG... (fake certificate key)
-----END CERTIFICATE-----
</ca>
`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(configContent));
    element.setAttribute('download', `shield_vpn_${profile.name}.ovpn`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function getInitials(name) {
    return (name || 'VP')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'VP';
}

function showTariff(id) {
    const item = tariffData[id];
    if (!item) return;
    openModal(`
        <span class="badge">${escapeHtml(item.badge)}</span>
        <h2 style="margin: 15px 0;">${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.text)}</p>
        <p style="margin-top: 15px;"><strong>Преимущество:</strong> ${escapeHtml(item.result)}</p>
        <button class="btn primary" style="margin-top: 20px; width: 100%;" onclick="closeModal(); buyTariff('${id}')">Активировать подписку</button>
    `);
}

function showArticle(id) {
    const article = articleData[id];
    if (!article) return;
    openModal(`
        <p class="overline">База знаний</p>
        <h2>${escapeHtml(article.title)}</h2>
        <p style="margin-top: 15px; line-height: 1.6;">${escapeHtml(article.text)}</p>
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

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
});
