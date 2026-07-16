/* global supabase */

// ==================== НАСТРОЙКА SUPABASE ====================
const SUPABASE_URL = 'https://iwcbyzpyayaryxtgugjr.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_7YFjuzQ518cbbY0dg34p4A_8ZTcUTvj';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// ============================================================

const PROFILE_KEY = 'hubdigital_profile_v1';
let isSignUpMode = false; // Переключатель режимов Вход / Регистрация

// Достаёт читаемый текст ошибки из объекта Supabase, даже если .message пустой
function getErrorMessage(err) {
    if (!err) return 'неизвестная ошибка';
    if (typeof err.message === 'string' && err.message && err.message !== '{}') return err.message;
    if (err.error_description) return err.error_description;
    if (err.msg) return err.msg;
    if (err.status === 429) return 'слишком много попыток, подождите немного';
    try {
        const str = JSON.stringify(err);
        return str && str !== '{}' ? str : 'сервис недоступен, проверьте соединение';
    } catch (e) {
        return 'неизвестная ошибка';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    bindNavigation();
    bindFaq();
    bindTicketForm();
    bindAccount();
    
    // Проверяем сессию пользователя при старте
    await checkUserSession();
    
    // Если вернулись со страницы оплаты — проверяем статус вместо обычного старта
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'return') {
        window.history.replaceState({}, '', window.location.pathname);
        showSection('account');
        handlePaymentReturn();
    } else {
        // Показываем главную страницу по умолчанию
        showSection('home');
    }
});

// Навигация
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

// ============== АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ ==============

async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session && session.user) {
        // Ищем профиль пользователя в таблице vpn_users
        let { data: userProfile } = await supabaseClient
            .from('vpn_users')
            .select('*')
            .eq('email', session.user.email)
            .single();

        // Если пользователь есть в Auth, а профиля в таблице нет (например, не создался при регистрации) — создаём
        if (!userProfile) {
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + 3);
            const formattedDate = expireDate.toISOString().split('T')[0];

            const { data: createdProfile, error: createError } = await supabaseClient
                .from('vpn_users')
                .insert([
                    {
                        name: session.user.user_metadata?.display_name || 'Пользователь',
                        email: session.user.email,
                        tariff: 'Демо-доступ (3 дня)',
                        expires: formattedDate,
                        balance: '0₽'
                    }
                ])
                .select()
                .single();

            if (!createError) {
                userProfile = createdProfile;
            } else {
                console.error('Не удалось создать профиль:', getErrorMessage(createError));
            }
        }

        if (userProfile) {
            localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
        }
    } else {
        localStorage.removeItem(PROFILE_KEY);
    }
    renderProfile();
}

function bindAccount() {
    const authForm = document.getElementById('loginForm');
    const toggleAuthModeBtn = document.getElementById('toggleAuthMode');
    const logoutBtn = document.getElementById('logoutBtn');
    const promoForm = document.getElementById('profileForm');

    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isSignUpMode = !isSignUpMode;
            
            const submitBtn = authForm.querySelector('button[type="submit"]');
            const nameField = document.getElementById('nameFieldGroup');
            const formTitle = document.getElementById('authFormTitle');

            if (isSignUpMode) {
                formTitle.textContent = 'Регистрация аккаунта';
                nameField.style.display = 'flex';
                submitBtn.textContent = 'Создать аккаунт';
                toggleAuthModeBtn.textContent = 'Уже есть аккаунт? Войти';
            } else {
                formTitle.textContent = 'Вход в систему';
                nameField.style.display = 'none';
                submitBtn.textContent = 'Войти';
                toggleAuthModeBtn.textContent = 'Нет аккаунта? Зарегистрироваться';
            }
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async event => {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            const name = document.getElementById('loginName').value.trim();

            if (isSignUpMode) {
                // РЕГИСТРАЦИЯ
                showToast('Создание аккаунта...');
                const { error: signUpError } = await supabaseClient.auth.signUp({
                    email: email,
                    password: password,
                    options: { data: { display_name: name } }
                });

                if (signUpError) {
                    console.error('signUpError', signUpError);
                    showToast('Ошибка регистрации: ' + getErrorMessage(signUpError));
                    return;
                }

                // Создаем запись в vpn_users
                const expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 3); // Демо на 3 дня
                const formattedDate = expireDate.toISOString().split('T')[0];

                const { data: newUser, error: createError } = await supabaseClient
                    .from('vpn_users')
                    .insert([
                        { 
                            name: name || 'Пользователь', 
                            email: email, 
                            tariff: 'Демо-доступ (3 дня)', 
                            expires: formattedDate,
                            balance: '0₽'
                        }
                    ])
                    .select()
                    .single();

                if (createError) {
                    showToast('Ошибка создания профиля: ' + getErrorMessage(createError));
                    return;
                }

                localStorage.setItem(PROFILE_KEY, JSON.stringify(newUser));
                showToast('Вы успешно зарегистрировались!');
            } else {
                // ВХОД
                showToast('Выполняется вход...');
                const { error: signInError } = await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password,
                });

                if (signInError) {
                    showToast('Неверный логин или пароль!');
                    return;
                }

                // Тянем профиль из базы
                let { data: userProfile } = await supabaseClient
                    .from('vpn_users')
                    .select('*')
                    .eq('email', email)
                    .single();

                if (userProfile) {
                    localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile));
                }
                showToast('С возвращением!');
            }

            await checkUserSession();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            showToast('Выход из аккаунта...');
            await supabaseClient.auth.signOut();
            localStorage.removeItem(PROFILE_KEY);
            renderProfile();
            showToast('Вы вышли.');
        });
    }

    if (promoForm) {
        promoForm.addEventListener('submit', async event => {
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
                msg = 'Активирован Премиум тариф на 30 дней!';
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
                showToast('Ошибка при активации: ' + getErrorMessage(error));
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
    const loginCard = document.getElementById('loginCard');
    const panel = document.getElementById('profilePanel');
    const nonAuthFields = document.getElementById('nonAuthFields');

    if (!loginCard || !panel) return;

    if (profile) {
        loginCard.style.display = 'none';
        panel.style.display = 'block';
        if (nonAuthFields) nonAuthFields.style.display = 'none'; // Убираем повторные поля в тикете

        document.getElementById('profileAvatar').textContent = getInitials(profile.name);
        document.getElementById('profileName').textContent = profile.name;
        document.getElementById('profileEmail').textContent = profile.email;
        
        document.getElementById('infoTariff').textContent = profile.tariff || 'Не активен';
        document.getElementById('infoBalance').textContent = profile.balance || '0₽';
        document.getElementById('infoExpires').textContent = profile.expires ? formatDateOnly(profile.expires) : '—';
        
        // Показываем тикеты пользователя
        renderTickets(profile.email);
    } else {
        loginCard.style.display = 'block';
        panel.style.display = 'none';
        if (nonAuthFields) nonAuthFields.style.display = 'flex';
    }
}

function getInitials(name) {
    return (name || 'U')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'U';
}

// ============== ОПЛАТА ТАРИФОВ (ЮKassa) ==============

async function startCheckout(tariffId) {
    const profile = getProfile();
    if (!profile) {
        closeModal();
        showToast('Сначала войдите в личный кабинет');
        showSection('account');
        return;
    }

    showToast('Переходим к оплате...');

    try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/create-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: profile.email,
                tariffId,
                returnUrl: window.location.origin + window.location.pathname + '?payment=return'
            })
        });

        const data = await res.json();

        if (!res.ok || !data.confirmationUrl) {
            showToast('Ошибка оплаты: ' + (data.error || 'попробуйте позже'));
            return;
        }

        window.location.href = data.confirmationUrl;
    } catch (e) {
        showToast('Не удалось начать оплату. Проверьте соединение.');
    }
}

async function handlePaymentReturn() {
    showToast('Проверяем статус оплаты...');
    const previousTariff = getProfile()?.tariff;

    for (let i = 0; i < 6; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkUserSession();
        const updated = getProfile();
        if (updated && updated.tariff !== previousTariff) {
            showToast('Оплата прошла успешно! Тариф обновлён 🎉');
            return;
        }
    }

    showToast('Платёж обрабатывается. Если тариф не обновится — обновите страницу через пару минут.');
}

// ============== СКАЧИВАНИЕ КОНФИГУРАЦИЙ VPN ==============

function downloadConfig() {
    const profile = getProfile();
    if (!profile) return;

    const proto = document.getElementById('vpnProto').value;
    const filename = `ShieldVPN-${profile.name.replace(/\s+/g, '_')}.${proto}`;
    
    let fileContent = '';

    if (proto === 'ovpn') {
        fileContent = `client
dev tun
proto udp
remote vpn.shield-digital.ru 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
verb 3
<ca>
-----BEGIN CERTIFICATE-----
MIIB7TCCAZegAwIBAgIJALp7b1zX... [SHIELD VPN ROOT CA] ...
-----END CERTIFICATE-----
</ca>
<cert>
-----BEGIN CERTIFICATE-----
MIIDITCCAgmgAwIBAgIRAIP7g... [USER CERTIFICATE FOR ${profile.email}] ...
-----END CERTIFICATE-----
</cert>
<key>
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BA... [USER PRIVATE KEY] ...
-----END PRIVATE KEY-----
</key>`;
    } else {
        fileContent = `[Interface]
PrivateKey = eE55K...[WG PRIVATE KEY FOR ${profile.email}]...
Address = 10.8.0.2/24
DNS = 1.1.1.1, 8.8.8.8

[Peer]
PublicKey = vpnServerPubKeyY6F2...
Endpoint = vpn.shield-digital.ru:51820
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 20`;
    }

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Конфигурация ${proto.toUpperCase()} успешно сохранена!`);
}

// ============== ТЕХПОДДЕРЖКА ==============

function bindTicketForm() {
    const form = document.getElementById('ticketForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        const profile = getProfile();

        const name = profile ? profile.name : document.getElementById('ticketName').value.trim();
        const contact = profile ? profile.email : document.getElementById('ticketContact').value.trim();
        const service = document.getElementById('ticketService').value;
        const text = document.getElementById('ticketText').value.trim();

        showToast('Отправка тикета...');

        const { error } = await supabaseClient
            .from('vpn_tickets')
            .insert([
                { name, contact, service, text, status: 'new' }
            ]);

        if (error) {
            showToast('Ошибка: ' + getErrorMessage(error));
        } else {
            form.reset();
            showToast('Ваше обращение принято!');
            if (profile) {
                renderTickets(profile.email);
            }
        }
    });
}

async function renderTickets(userEmail = '') {
    const list = document.getElementById('ticketList');
    if (!list) return;

    let query = supabaseClient.from('vpn_tickets').select('*');
    if (userEmail) {
        query = query.eq('contact', userEmail);
    }
    
    const { data: tickets, error } = await query.order('id', { ascending: false });

    if (error) {
        list.innerHTML = '<p class="ticket">Не удалось загрузить обращения.</p>';
        return;
    }

    if (!tickets || !tickets.length) {
        list.innerHTML = '<p class="no-tickets">Обращений ещё не создано.</p>';
        return;
    }

    list.innerHTML = tickets.map(ticket => `
        <article class="ticket-item">
            <div class="ticket-item-header">
                <span class="ticket-id">Тикет HD-${ticket.id}</span>
                <span class="ticket-status-badge status-${ticket.status}">${statusLabel(ticket.status)}</span>
            </div>
            <div class="ticket-body">
                <strong>Тема:</strong> ${escapeHtml(ticket.service)}<br>
                <p class="ticket-text">${escapeHtml(ticket.text)}</p>
            </div>
            <div class="ticket-date">${formatDate(ticket.created_at)}</div>
        </article>
    `).join('');
}

function statusLabel(status) {
    if (status === 'work') return 'В работе';
    if (status === 'done') return 'Решено';
    return 'Новый';
}

function showCase(id) {
    const cases = {
        clinic: {
            title: 'Демо-доступ',
            badge: 'Тест',
            text: 'Бесплатный период на 3 дня. Скорость работы канала до 100 Мбит/с. Доступен 1 сервер.',
            result: 'Идеально для проверки задержки (пинга) в онлайн-играх.',
            ctaLabel: 'Понятно',
            ctaAction: 'closeModal()'
        },
        agency: {
            title: 'Стандарт',
            badge: 'Популярно',
            text: 'План на 30 дней. Безлимитный трафик, высокая скорость доступа на любых устройствах.',
            result: 'Отличный повседневный вариант без переплат.',
            ctaLabel: 'Оплатить картой — 199₽',
            ctaAction: "startCheckout('standard')"
        },
        shop: {
            title: 'Премиум',
            badge: 'Максимум',
            text: 'План на 90 дней. Доступ к VIP серверам с минимальной нагрузкой, выделенный статический IP.',
            result: 'Стабильность для серьезной работы или стриминга.',
            ctaLabel: 'Оплатить картой — 499₽',
            ctaAction: "startCheckout('premium')"
        }
    };

    const item = cases[id];
    if (!item) return;

    openModal(`
        <span class="badge">${escapeHtml(item.badge)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p style="margin-top: 1rem;">${escapeHtml(item.text)}</p>
        <p style="margin-top: 1rem; color: var(--accent-color);"><strong>Назначение:</strong> ${escapeHtml(item.result)}</p>
        <button style="margin-top: 1.5rem; width: 100%;" class="btn primary" onclick="${item.ctaAction}">${escapeHtml(item.ctaLabel)}</button>
    `);
}

function prefillTicket(service) {
    showSection('support');
    const select = document.getElementById('ticketService');
    if (select) select.value = 'Другое';
    const text = document.getElementById('ticketText');
    if (text) text.value = `Интересует подключение тарифа: ${service}.`;
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

function toggleNav() {
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.toggle('active');
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
});
