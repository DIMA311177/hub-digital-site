// ==================== НАСТРОЙКА SUPABASE ====================
// Твои личные данные для подключения к созданной базе
const SUPABASE_URL = 'https://iwcbyzpyayaryxtgugjr.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_7YFjuzQ518cbbY0dg34p4A_8ZTcUTvj';

// Инициализируем клиент Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ============================================================

const PROFILE_KEY = 'hubdigital_profile_v1';

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
    bindNavigation();
    bindFaq();
    bindTicketForm();
    bindAccount();
    renderTickets(); // Загружаем тикеты из Supabase
    renderProfile();
    showSection('home');
});

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

// ============== РАБОТА С ЗАЯВКАМИ/ТИКЕТАМИ (SUPABASE) ==============

function bindTicketForm() {
    const form = document.getElementById('ticketForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();

        const name = document.getElementById('ticketName').value.trim();
        const contact = document.getElementById('ticketContact').value.trim();
        const service = document.getElementById('ticketService').value;
        const text = document.getElementById('ticketText').value.trim();

        showToast('Отправка заявки...');

        // Записываем тикет напрямую в Supabase таблицу vpn_tickets
        const { data, error } = await supabase
            .from('vpn_tickets')
            .insert([
                { name, contact, service, text, status: 'new' }
            ]);

        if (error) {
            console.error('Ошибка Supabase:', error);
            showToast('Ошибка при отправке: ' + error.message);
        } else {
            form.reset();
            await renderTickets(); // Перерисовываем список свежими данными
            showToast('Заявка успешно отправлена в базу данных!');
        }
    });
}

async function renderTickets() {
    const list = document.getElementById('ticketList');
    if (!list) return;

    // Читаем из базы список тикетов, сортируя их по id в обратном порядке (новые вверху)
    const { data: tickets, error } = await supabase
        .from('vpn_tickets')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Ошибка получения данных:', error);
        list.innerHTML = '<p class="ticket">Не удалось загрузить обращения.</p>';
        return;
    }

    const ticketCount = document.getElementById('ticketCount');
    if (ticketCount) {
        ticketCount.textContent = String(tickets ? tickets.length : 0);
    }

    if (!tickets || !tickets.length) {
        list.innerHTML = '<p class="ticket">Заявок пока нет.</p>';
        return;
    }

    list.innerHTML = tickets.map(ticket => `
        <article class="ticket">
            <div class="ticket-head">
                <strong>HD-${ticket.id} · ${escapeHtml(ticket.service)}</strong>
                <span class="status status-${ticket.status}">${statusLabel(ticket.status)}</span>
            </div>
            <p>${escapeHtml(ticket.text)}</p>
            <small>${escapeHtml(ticket.name)} · ${escapeHtml(ticket.contact)} · ${formatDate(ticket.created_at)}</small>
            <div class="ticket-actions">
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'new')">Новая</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'work')">В работе</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'done')">Закрыть</button>
            </div>
        </article>
    `).join('');
}

function statusLabel(status) {
    if (status === 'work') return 'В работе';
    if (status === 'done') return 'Закрыта';
    return 'Новая';
}

async function setTicketStatus(id, status) {
    showToast('Обновление статуса...');
    
    const { error } = await supabase
        .from('vpn_tickets')
        .update({ status })
        .eq('id', id);

    if (error) {
        showToast('Ошибка обновления: ' + error.message);
    } else {
        await renderTickets();
        showToast(`Статус HD-${id} успешно обновлён.`);
    }
}

async function clearClosedTickets() {
    showToast('Очистка...');

    // Удаляем из облака решенные заявки (со статусом 'done')
    const { error } = await supabase
        .from('vpn_tickets')
        .delete()
        .eq('status', 'done');

    if (error) {
        showToast('Ошибка удаления: ' + error.message);
    } else {
        await renderTickets();
        showToast('Закрытые заявки очищены из базы.');
    }
}

function prefillTicket(service) {
    showSection('support');
    const select = document.getElementById('ticketService');
    if (select) select.value = service;
    const text = document.getElementById('ticketText');
    if (text && !text.value) text.value = `Интересует услуга: ${service}. Нужно обсудить детали проекта.`;
    document.getElementById('ticketName')?.focus();
}

// ============== ЛИЧНЫЙ КАБИНЕТ (SUPABASE + LOCALSTORAGE) ==============

function bindAccount() {
    const loginForm = document.getElementById('loginForm');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            
            const name = document.getElementById('loginName').value.trim();
            const email = document.getElementById('loginEmail').value.trim();
            const company = document.getElementById('loginCompany').value.trim();

            showToast('Вход в систему...');

            // Ищем пользователя по Email
            let { data: user, error } = await supabase
                .from('vpn_users')
                .select('*')
                .eq('email', email)
                .single();

            // Если пользователя нет — регистрируем в базе данных
            if (!user) {
                const { data: newUser, error: createError } = await supabase
                    .from('vpn_users')
                    .insert([
                        { 
                            name: name, 
                            email: email, 
                            tariff: company, // Поле компании запишем в tariff или сохраним в структуре
                            balance: 'Активен'
                        }
                    ])
                    .select()
                    .single();

                if (createError) {
                    showToast('Ошибка создания профиля: ' + createError.message);
                    return;
                }
                user = newUser;
            }

            // Локально сохраняем токен авторизации
            localStorage.setItem(PROFILE_KEY, JSON.stringify({
                name: user.name,
                email: user.email,
                company: user.tariff,
                about: user.balance
            }));

            renderProfile();
            showToast('Кабинет успешно создан в облаке!');
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async event => {
            event.preventDefault();
            const profile = getProfile();
            if (!profile) return;

            const aboutText = document.getElementById('aboutText').value.trim();
            profile.about = aboutText;

            showToast('Сохранение...');

            // Синхронизируем описание бизнеса с полем balance (или expires) в БД
            const { error } = await supabase
                .from('vpn_users')
                .update({ balance: aboutText })
                .eq('email', profile.email);

            if (error) {
                showToast('Ошибка сохранения: ' + error.message);
            } else {
                localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
                showToast('Описание бизнеса сохранено в БД.');
            }
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
