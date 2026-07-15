/* global supabase */
// ==================== НАСТРОЙКА SUPABASE ====================
const SUPABASE_URL = 'https://iwcbyzpyayaryxtgugjr.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_7YFjuzQ518cbbY0dg34p4A_8ZTcUTvj';

// Используем supabaseClient для избежания конфликта с глобальным объектом библиотеки
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ============================================================

const PROFILE_KEY = 'hubdigital_profile_v1';

const caseData = {
    clinic: {
        title: 'Тариф: Демо-доступ',
        badge: 'Попробовать',
        text: 'Бесплатный тестовый период на 3 дня. Скорость до 100 Мбит/с, доступен 1 сервер.',
        result: 'Отличный способ проверить пинг и скорость работы.'
    },
    agency: {
        title: 'Тариф: Стандарт',
        badge: 'Популярно',
        text: 'Подписка на 30 дней. До 5 устройств одновременно, автовыбор быстрого сервера, безлимитный трафик.',
        result: 'Оптимальный баланс цены и возможностей для каждого дня.'
    },
    shop: {
        title: 'Тариф: Премиум',
        badge: 'Максимум',
        text: 'Подписка на 90 дней. Приоритетный канал, выделенные IP, поддержка 24/7 и максимальная скорость.',
        result: 'Для тех, кому важна абсолютная стабильность и анонимность.'
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    bindNavigation();
    bindFaq();
    bindTicketForm();
    bindAccount();
    
    // Проверяем активную сессию при загрузке страницы
    await checkUserSession();
    
    renderTickets(); // Загружаем тикеты поддержки
    showSection('home'); // Открываем главную страницу по умолчанию
});

// Переключение мобильного меню
function toggleNav() {
    const nav = document.getElementById('main-nav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

// НАВИГАЦИЯ МЕЖДУ СЕКЦИЯМИ
function bindNavigation() {
    document.body.addEventListener('click', event => {
        const targetEl = event.target.closest('[data-section]');
        if (targetEl) {
            event.preventDefault();
            const sectionId = targetEl.getAttribute('data-section');
            if (sectionId) {
                showSection(sectionId);
            }
        }
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
    if (nav) {
        nav.classList.remove('active');
    }

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

        showToast('Отправка обращения...');

        const { data, error } = await supabaseClient
            .from('vpn_tickets')
            .insert([
                { name, contact, service, text, status: 'new' }
            ]);

        if (error) {
            console.error('Ошибка Supabase:', error);
            showToast('Ошибка при отправке: ' + error.message);
        } else {
            form.reset();
            await renderTickets();
            showToast('Обращение отправлено в техподдержку!');
        }
    });
}

async function renderTickets() {
    const list = document.getElementById('ticketList');
    if (!list) return;

    const { data: tickets, error } = await supabaseClient
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
        list.innerHTML = '<p class="ticket">Активных обращений нет.</p>';
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
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'new')">Новый</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'work')">В работе</button>
                <button class="btn ghost btn-compact" onclick="setTicketStatus(${ticket.id}, 'done')">Решён</button>
            </div>
        </article>
    `).join('');
}

function statusLabel(status) {
    if (status === 'work') return 'В работе';
    if (status === 'done') return 'Решён';
    return 'Новый';
}

async function setTicketStatus(id, status) {
    showToast('Обновление статуса...');
    
    const { error } = await supabaseClient
        .from('vpn_tickets')
        .update({ status })
        .eq('id', id);

    if (error) {
        showToast('Ошибка обновления: ' + error.message);
    } else {
        await renderTickets();
        showToast(`Статус тикета HD-${id} обновлён.`);
    }
}

async function clearClosedTickets() {
    showToast('Очистка...');

    const { error } = await supabaseClient
        .from('vpn_tickets')
        .delete()
        .eq('status', 'done');

    if (error) {
        showToast('Ошибка удаления: ' + error.message);
    } else {
        await renderTickets();
        showToast('Закрытые тикеты удалены из базы.');
    }
}

function prefillTicket(service) {
    showSection('support');
    const select = document.getElementById('ticketService');
    if (select) select.value = service;
    const text = document.getElementById('ticketText');
    if (text && !text.value) text.value = `Проблема с подключением по тарифу: ${service}.`;
    document.getElementById('ticketName')?.focus();
}

// ============== АВТОРИЗАЦИЯ (SUPABASE AUTH) ==============

async function checkUserSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
        let { data: userProfile } = await supabaseClient
            .from('vpn_users')
            .select('*')
            .eq('email', session.user.email)
            .single();

        if (userProfile) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
        }
    } else {
        localStorage.removeItem(PROFILE_KEY);
    }
    renderProfile();
}

function bindAccount() {
    const loginForm = document.getElementById('loginForm');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', async event => {
            event.preventDefault();
            
            const name = document.getElementById('loginName').value.trim();
            const email = document.getElementById('loginEmail').value.trim();
            const passwordInput = document.getElementById('loginPassword');
            const password = passwordInput ? passwordInput.value : 'DefaultVpnPass123!';

            showToast('Вход / Регистрация...');

            const { data: signInData, error: signInError } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (signInError) {
                if (signInError.message.includes('Invalid login credentials') || signInError.status === 400) {
                    showToast('Регистрация нового пользователя...');
                    
                    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: { display_name: name }
                        }
                    });

                    if (signUpError) {
                        showToast('Ошибка регистрации: ' + signUpError.message);
                        return;
                    }

                    const expireDate = new Date();
                    expireDate.setDate(expireDate.getDate() + 3);
                    const formattedDate = expireDate.toISOString().split('T')[0];

                    const { data: newUser, error: createError } = await supabaseClient
                        .from('vpn_users')
                        .insert([
                            { 
                                name: name, 
                                email: email, 
                                tariff: 'Демо-доступ (3 дня)', 
                                expires: formattedDate,
                                balance: '0₽'
                            }
                        ])
                        .select()
                        .single();

                    if (createError) {
                        showToast('Ошибка создания профиля: ' + createError.message);
                        return;
                    }

                    localStorage.setItem(PROFILE_KEY, JSON.stringify(newUser));
                    renderProfile();
                    showToast('Аккаунт успешно создан!');
                } else {
                    showToast('Ошибка авторизации: ' + signInError.message);
                }
            } else {
                let { data: userProfile } = await supabaseClient
                    .from('vpn_users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (userProfile) {
                    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
                }
                renderProfile();
                showToast('Добро пожаловать назад!');
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async event => {
            event.preventDefault();
            const profile = getProfile();
            if (!profile) return;

            const promoCode = document.getElementById('aboutText').value.trim();
            if (!promoCode) return;

            showToast('Активация промокода...');

            let newBalance = profile.balance;
            let newTariff = profile.tariff;
            let msg = 'Промокод не найден';

            if (promoCode.toLowerCase() === 'shield500') {
                newBalance = '500₽';
                msg = 'Начислено 500₽ на баланс!';
            } else if (promoCode.toLowerCase() === 'premium') {
                newTariff = 'Премиум VPN';
                msg = 'Активирован Премиум тариф!';
            }

            if (msg === 'Промокод не найден') {
                showToast(msg);
                return;
            }

            const { error } = await supabaseClient
                .from('vpn_users')
                .update({ balance: newBalance, tariff: newTariff })
                .eq('email', profile.email);

            if (error) {
                showToast('Ошибка при активации: ' + error.message);
            } else {
                profile.balance = newBalance;
                profile.tariff = newTariff;
                localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
                renderProfile();
                document.getElementById('aboutText').value = '';
                showToast(msg);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            showToast('Выход...');
            await supabaseClient.auth.signOut();
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
    
    const companyLabel = document.getElementById('profileCompany');
    if (companyLabel) {
        companyLabel.innerHTML = `
            <strong>Тариф:</strong> ${escapeHtml(profile.tariff)} <br>
            <strong>Баланс:</strong> ${escapeHtml(profile.balance || '0₽')} <br>
            <strong>Действует до:</strong> ${profile.expires ? formatDateOnly(profile.expires) : 'Не установлено'}
        `;
    }
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

function showCase(id) {
    const item = caseData[id];
    if (!item) return;
    openModal(`
        <span class="badge">${escapeHtml(item.badge)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.text)}</p>
        <p><strong>Результат:</strong> ${escapeHtml(item.result)}</p>
        <button class="btn primary" onclick="closeModal(); prefillTicket('${escapeAttr(item.title)}')">Подключить тариф</button>
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

function formatDateOnly(value) {
    const date = new Date(value);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
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
