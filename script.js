const DB_KEY = 'msk112_forum_db_v2';
const USER_KEY = 'msk112_user_profile_v2';
const POSTS_KEY = 'msk112_user_posts_v2';
const CHAT_KEY = 'msk112_chat_messages_v2';
const LAST_POST_COUNT_KEY = 'msk112_last_post_count_v2';
const SERVER_ENDPOINT = 'hub-digital.ru:7001';

const state = {
    currentSubforum: 'general',
    currentTopicId: null
};

const seedDb = {
    version: 2,
    categories: [
        { slug: 'general', title: 'Диспетчерская' },
        { slug: 'offtopic', title: 'Курилка смен' },
        { slug: 'help', title: 'Полиция' },
        { slug: 'bugs', title: 'МЧС' },
        { slug: 'art', title: 'Скорая помощь' },
        { slug: 'videos', title: 'Техотдел / клиент' }
    ],
    topics: [
        { id: 't1', subforum: 'general', title: 'Смена 01.05: готовность служб', author: 'Dispatch_01', content: 'Подтвердите готовность: ППС, МЧС, СМП. Укажите канал и район дежурства.', createdAt: '2026-05-01T07:00:00Z', updatedAt: '2026-05-01T07:00:00Z' },
        { id: 't2', subforum: 'general', title: 'Как запустить клиент на телефоне?', author: 'Tech_Lead', content: 'Скачать через лаунчер, распаковать модпак, выбрать сервер hub-digital.ru:7001 и нажать «Запуск».', createdAt: '2026-05-01T09:20:00Z', updatedAt: '2026-05-01T09:20:00Z' },
        { id: 't3', subforum: 'help', title: 'Патруль ЦАО: отчёт по маршруту', author: 'PPS_204', content: 'Маршрут выполнен, два вызова обработаны, задержек не было. Логи прикреплю в конце смены.', createdAt: '2026-04-30T18:10:00Z', updatedAt: '2026-04-30T18:10:00Z' },
        { id: 't4', subforum: 'bugs', title: 'МЧС: сбой маршрута на юге карты', author: 'MCHS_11', content: 'На развязке в ЮАО юнит периодически теряет путь. Нужна проверка нодов.', createdAt: '2026-04-30T20:30:00Z', updatedAt: '2026-04-30T20:30:00Z' },
        { id: 't5', subforum: 'art', title: 'Скорая: протокол передачи пациента', author: 'SMP_03', content: 'Поделитесь шаблоном краткого рапорта для радиоканала после доставки пациента.', createdAt: '2026-04-29T12:40:00Z', updatedAt: '2026-04-29T12:40:00Z' },
        { id: 't6', subforum: 'videos', title: 'Клиент 2.0: ошибки после обновления', author: 'Operator_MSK', content: 'Собираем логи и скрины по обновлению 2.0. Пишите модель устройства и версию Android.', createdAt: '2026-05-01T10:05:00Z', updatedAt: '2026-05-01T10:05:00Z' },
        { id: 't7', subforum: 'offtopic', title: 'Кофе-брейк смены', author: 'Dispatch_02', content: 'Кто чем спасается на ночной смене? Делимся лайфхаками для бодрости.', createdAt: '2026-04-30T22:15:00Z', updatedAt: '2026-04-30T22:15:00Z' }
    ],
    replies: [
        { id: 'r1', topicId: 't1', author: 'PPS_204', content: 'ППС ЦАО на связи, канал 2, экипаж готов.', createdAt: '2026-05-01T07:02:00Z' },
        { id: 'r2', topicId: 't1', author: 'MCHS_11', content: 'МЧС подтвердил готовность, канал 3.', createdAt: '2026-05-01T07:03:00Z' },
        { id: 'r3', topicId: 't1', author: 'SMP_03', content: 'СМП на линии, канал 4, стартуем дежурство.', createdAt: '2026-05-01T07:04:00Z' },
        { id: 'r4', topicId: 't6', author: 'Tech_Lead', content: 'По логам уже вижу повторяемый крэш на Android 10, фиксим.', createdAt: '2026-05-01T10:20:00Z' }
    ]
};

const randomNames = ['Dispatch_03', 'PPS_315', 'MCHS_22', 'SMP_09', 'Tech_Shift', 'Operator_ZAO', 'MedicFox', 'ControlRoom'];
const randomReplies = [
    'Подтверждаю, на моём маршруте то же самое.',
    'Добавьте это в регламент смены.',
    'Принял, проверю после следующего вызова.',
    'Логи отправил в техотдел, жду ответ.',
    'В эфире зафиксировал, отмечу в рапорте.',
    'Проверено, после перезапуска канала стало лучше.'
];

document.addEventListener('DOMContentLoaded', () => {
    seedDatabase();
    bindNavigation();
    bindFaq();
    bindTopicForm();
    bindAccountForms();
    loadUserPosts();
    loadChatMessages();
    document.getElementById('postForm').addEventListener('submit', addUserPost);
    document.getElementById('chatForm').addEventListener('submit', sendChatMessage);

    showSection('home');
    renderTopicCounts();
    renderAccount();
    setInterval(updateRealtimeData, 5000);
    setInterval(simulateIncomingReply, 12000);
});

function seedDatabase() {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
        localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
        return;
    }
    try {
        const parsed = JSON.parse(raw);
        if (!parsed || parsed.version !== seedDb.version) {
            localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
        }
    } catch (e) {
        localStorage.setItem(DB_KEY, JSON.stringify(seedDb));
    }
}

function getDb() {
    return JSON.parse(localStorage.getItem(DB_KEY));
}

function saveDb(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function loadUserProfile() {
    return JSON.parse(localStorage.getItem(USER_KEY));
}

function saveUserProfile(profile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
}

function toggleNav() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    nav.classList.toggle('active');
}

function bindNavigation() {
    document.querySelectorAll('[data-section]').forEach(el => {
        el.addEventListener('click', e => {
            const target = el.getAttribute('data-section');
            if (target) {
                e.preventDefault();
                showSection(target);
                // закрыть мобильное меню после перехода
                const nav = document.getElementById('main-nav');
                if (nav && nav.classList.contains('active')) nav.classList.remove('active');
            }
        });
    });
}

function bindFaq() {
    document.querySelectorAll('.faq-item h3').forEach(title => {
        title.addEventListener('click', () => {
            const content = title.nextElementSibling;
            if (!content) return;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });
}

function toggleFaq(id) {
    const content = document.getElementById(`faq-${id}`);
    if (!content) return;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function bindTopicForm() {
    const form = document.getElementById('topicForm');
    if (!form) return;
    form.addEventListener('submit', e => {
        e.preventDefault();
        const db = getDb();
        const author = document.getElementById('topicAuthor').value.trim() || 'Гость';
        const title = document.getElementById('topicTitle').value.trim();
        const content = document.getElementById('topicContent').value.trim();
        const subforum = state.currentSubforum || 'general';
        if (!title || !content) return;
        const now = new Date().toISOString();
        db.topics.push({ id: uid('t'), subforum, title, author, content, createdAt: now, updatedAt: now });
        saveDb(db);
        document.getElementById('topicTitle').value = '';
        document.getElementById('topicContent').value = '';
        renderTopicCounts();
        renderTopicList(subforum);
    });
}

function bindAccountForms() {
    const loginForm = document.getElementById('loginForm');
    const profileForm = document.getElementById('profileForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const aboutField = document.getElementById('aboutText');
    const aboutCounter = document.getElementById('aboutCounter');

    const updateCounter = () => {
        if (aboutField && aboutCounter) {
            const len = aboutField.value.length;
            aboutCounter.textContent = `${len} / 240`;
        }
    };

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const profile = {
                name: document.getElementById('loginName').value.trim(),
                email: document.getElementById('loginEmail').value.trim(),
                password: document.getElementById('loginPassword').value.trim(), // локально
                avatar: '',
                about: '',
                role: 'Оператор'
            };
            if (!profile.name || !profile.email || !profile.password) return;
            saveUserProfile(profile);
            renderAccount();
            showNotification('Вы вошли локально. Данные хранятся только на этом устройстве.');
            loginForm.reset();
        });
    }
    if (profileForm) {
        profileForm.addEventListener('submit', e => {
            e.preventDefault();
            const profile = loadUserProfile();
            if (!profile) return;
            profile.avatar = document.getElementById('avatarUrl').value.trim();
            profile.about = document.getElementById('aboutText').value.trim();
            saveUserProfile(profile);
            renderAccount();
            showNotification('Профиль сохранен локально.');
        });
    }
    if (aboutField) {
        aboutField.addEventListener('input', () => {
            const profile = loadUserProfile();
            if (profile) {
                profile.about = aboutField.value.trim();
                saveUserProfile(profile);
            }
            updateCounter();
            const aboutEl = document.getElementById('profileAbout');
            const aboutDisplay = document.getElementById('profileAboutDisplay');
            if (aboutEl) aboutEl.textContent = aboutField.value.trim() || 'О себе пока пусто';
            if (aboutDisplay) aboutDisplay.textContent = aboutField.value.trim() || 'О себе пока пусто';
        });
        updateCounter();
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem(USER_KEY);
            renderAccount();
            showNotification('Вы вышли.');
        });
    }
}

function updateRealtimeData() {
    updateOnlineStats();
    loadUserPosts();
    loadChatMessages();
    checkForNewUserPosts();
}

function updateOnlineStats() {
    const stats = document.querySelectorAll('.stat');
    if (stats.length > 0) {
        const online = 240 + Math.floor(Math.random() * 180);
        stats[0].textContent = `На линии: ${online}`;
    }
}

function checkForNewUserPosts() {
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    const lastCount = parseInt(localStorage.getItem(LAST_POST_COUNT_KEY) || '0', 10);
    if (posts.length > lastCount) {
        showNotification(`Новая тема в пользовательском блоке! (+${posts.length - lastCount})`);
        localStorage.setItem(LAST_POST_COUNT_KEY, posts.length.toString());
    }
}

function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Форум 112 Москвы', { body: message });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Форум 112 Москвы', { body: message });
            }
        });
    }
    console.log(message);
}

function loadChatMessages() {
    const messages = JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
    const chatContainer = document.getElementById('chat-messages');
    chatContainer.innerHTML = '';
    messages.forEach(msg => {
        const msgElement = document.createElement('div');
        msgElement.className = 'message';
        msgElement.innerHTML = `<strong>${msg.user}:</strong> ${msg.text} <small>(${msg.time})</small>`;
        chatContainer.appendChild(msgElement);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chatMessage');
    const text = input.value.trim();
    if (!text) return;
    const user = loadUserProfile()?.name || 'Оператор';
    const time = new Date().toLocaleTimeString('ru-RU');

    const messages = JSON.parse(localStorage.getItem(CHAT_KEY)) || [];
    messages.push({ user, text, time });
    if (messages.length > 50) messages.shift();
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));

    input.value = '';
    loadChatMessages();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('main .section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
        activeSection.classList.add('active');
        activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

function renderTopicCounts() {
    const db = getDb();
    document.querySelectorAll('.subforum').forEach(el => {
        const slug = el.dataset.subforum;
        if (!slug) return;
        const count = db.topics.filter(t => t.subforum === slug).length;
        const badge = el.querySelector('.topic-count');
        if (badge) badge.textContent = `(${count} тем)`;
    });
}

function renderAccount() {
    const profile = loadUserProfile();
    const guest = document.getElementById('account-guest');
    const prof = document.getElementById('account-profile');
    if (!guest || !prof) return;
    if (!profile) {
        guest.style.display = 'block';
        prof.style.display = 'none';
        return;
    }
    guest.style.display = 'none';
    prof.style.display = 'block';
    document.getElementById('profileName').textContent = profile.name || 'Оператор';
    document.getElementById('profileEmail').textContent = profile.email || '—';
    document.getElementById('profileRole').textContent = profile.role || 'Оператор';
    document.getElementById('avatarUrl').value = profile.avatar || '';
    document.getElementById('aboutText').value = profile.about || '';
    const aboutEl = document.getElementById('profileAbout');
    if (aboutEl) aboutEl.textContent = profile.about ? profile.about : 'О себе пока пусто';
    const aboutDisplay = document.getElementById('profileAboutDisplay');
    if (aboutDisplay) aboutDisplay.textContent = profile.about ? profile.about : 'О себе пока пусто';
    const aboutCounter = document.getElementById('aboutCounter');
    if (aboutCounter) aboutCounter.textContent = `${(profile.about || '').length} / 240`;

    const avatarEl = document.getElementById('profileAvatar');
    if (profile.avatar) {
        avatarEl.style.backgroundImage = `url(${profile.avatar})`;
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.textContent = '';
    } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.textContent = (profile.name || '112').slice(0, 2).toUpperCase();
    }

    const db = getDb();
    const topics = db.topics.length;
    const replies = db.replies.length;
    const chat = (JSON.parse(localStorage.getItem(CHAT_KEY)) || []).length;
    document.getElementById('statTopics').textContent = topics;
    document.getElementById('statReplies').textContent = replies;
    document.getElementById('statChat').textContent = chat;

    const xp = topics * 5 + replies * 2 + chat;
    const level = Math.max(1, Math.floor(xp / 50) + 1);
    const progress = xp % 50;
    const fill = document.getElementById('activityProgress');
    const label = document.getElementById('activityLabel');
    const lvlChip = document.getElementById('profileLevel');
    if (fill) fill.style.width = `${Math.min(100, (progress / 50) * 100)}%`;
    if (label) label.textContent = `${progress} / 50 XP до следующего уровня`;
    if (lvlChip) lvlChip.textContent = `Уровень ${level}`;
}

function showSubforum(subforum) {
    state.currentSubforum = subforum;
    state.currentTopicId = null;
    document.getElementById('subforum-title').textContent = getSubforumTitle(subforum);
    document.getElementById('subforum-view').style.display = 'block';
    const cats = document.querySelector('.forum-categories');
    if (cats) cats.style.display = 'none';
    renderTopicList(subforum);
    document.getElementById('topic-view').innerHTML = 'Выберите тему слева, чтобы прочитать её.';
}

function backToForum() {
    document.getElementById('subforum-view').style.display = 'none';
    const cats = document.querySelector('.forum-categories');
    if (cats) cats.style.display = 'grid';
    state.currentTopicId = null;
}

function getSubforumTitle(slug) {
    const db = getDb();
    return db.categories.find(c => c.slug === slug)?.title || 'Подфорум';
}

function renderTopicList(subforum) {
    const db = getDb();
    const list = document.getElementById('topic-list');
    list.innerHTML = '';
    const topics = db.topics
        .filter(t => t.subforum === subforum)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    if (!topics.length) {
        list.innerHTML = '<div class="topic-item">Нет тем. Создайте первую!</div>';
        return;
    }

    topics.forEach(topic => {
        const replies = db.replies.filter(r => r.topicId === topic.id);
        const lastReply = replies.length ? replies[replies.length - 1] : null;
        const lastTime = lastReply ? lastReply.createdAt : topic.updatedAt;
        const item = document.createElement('div');
        item.className = `topic-item ${state.currentTopicId === topic.id ? 'active' : ''}`;
        item.dataset.topicId = topic.id;
        item.innerHTML = `
            <h4 class="topic-title">${topic.title}</h4>
            <div class="topic-meta">
                <span>${topic.author}</span>
                <span>${formatDate(topic.createdAt)}</span>
                <span>Ответов: ${replies.length}</span>
                <span>Обновлено: ${formatDate(lastTime)}</span>
            </div>
        `;
        item.addEventListener('click', () => showTopicView(topic.id));
        list.appendChild(item);
    });
}

function showTopicView(topicId) {
    const db = getDb();
    const topic = db.topics.find(t => t.id === topicId);
    if (!topic) return;
    state.currentTopicId = topicId;
    const replies = db.replies.filter(r => r.topicId === topicId).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const container = document.getElementById('topic-view');
    const repliesHtml = replies.length
        ? replies.map(r => `<div class="reply-item"><strong>${r.author}</strong> <small>${formatDate(r.createdAt)}</small><p>${r.content}</p></div>`).join('')
        : '<p>Пока нет ответов. Будьте первым!</p>';

    container.innerHTML = `
        <h4>${topic.title}</h4>
        <div class="meta-line">
            <span>Автор: ${topic.author}</span>
            <span>Создано: ${formatDate(topic.createdAt)}</span>
            <span>Обновлено: ${formatDate(topic.updatedAt)}</span>
        </div>
        <p>${topic.content.replace(/\n/g, '<br>')}</p>
        <div class="reply-section">
            <h4>Ответы</h4>
            ${repliesHtml}
        </div>
        <form id="replyForm" class="reply-form">
            <input type="text" id="replyAuthor" placeholder="Ваш ник" required>
            <textarea id="replyText" placeholder="Написать ответ..." required></textarea>
            <button type="submit" class="btn secondary">Отправить ответ</button>
        </form>
    `;

    document.querySelectorAll('.topic-item').forEach(item => item.classList.remove('active'));
    const activeItem = Array.from(document.querySelectorAll('.topic-item')).find(el => el.dataset.topicId === topic.id);
    if (activeItem) activeItem.classList.add('active');

    const replyForm = document.getElementById('replyForm');
    replyForm.addEventListener('submit', e => {
        e.preventDefault();
        const author = document.getElementById('replyAuthor').value.trim() || 'Гость';
        const text = document.getElementById('replyText').value.trim();
        if (!text) return;
        addReply(topicId, author, text);
        document.getElementById('replyAuthor').value = '';
        document.getElementById('replyText').value = '';
    });
}

function addReply(topicId, author, text) {
    const db = getDb();
    const reply = { id: uid('r'), topicId, author, content: text, createdAt: new Date().toISOString() };
    db.replies.push(reply);
    const topic = db.topics.find(t => t.id === topicId);
    if (topic) topic.updatedAt = reply.createdAt;
    saveDb(db);
    renderTopicCounts();
    if (state.currentSubforum) renderTopicList(state.currentSubforum);
    showTopicView(topicId);
}

function simulateIncomingReply() {
    const db = getDb();
    const topics = db.topics;
    if (!topics.length) return;
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const author = randomNames[Math.floor(Math.random() * randomNames.length)];
    const text = randomReplies[Math.floor(Math.random() * randomReplies.length)];
    db.replies.push({ id: uid('r'), topicId: topic.id, author, content: text, createdAt: new Date().toISOString() });
    topic.updatedAt = new Date().toISOString();
    saveDb(db);
    renderTopicCounts();
    if (state.currentSubforum === topic.subforum) {
        renderTopicList(topic.subforum);
        if (state.currentTopicId === topic.id) {
            showTopicView(topic.id);
        }
    }
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

// Пользовательские темы (нижний блок)
function loadUserPosts() {
    const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <h4>${post.title}</h4>
            <p>${post.content}</p>
            <small>${post.date}</small>
        `;
        postsContainer.appendChild(postElement);
    });
}

function addUserPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();
    if (!title || !content) return;
    const date = new Date().toLocaleString('ru-RU');

    const posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
    posts.push({ title, content, date });
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    loadUserPosts();
    showNotification('Тема создана и сохранена локально.');
}

// Модалки новостей/объявлений и профилей
const newsDetails = {
    1: {
        title: 'Карта Москвы расширена',
        content: '- Добавлены новые кварталы и магистрали.\n- Ускорены маршруты для ППС/МЧС/СМП.\n- Улучшена логика назначения ближайшего экипажа.'
    },
    2: {
        title: 'Рация Baofeng: голосовой режим',
        content: '- Добавлены PTT-сигналы и фоновый шум эфира.\n- Каналы 1–4 переключаются с экрана рации.\n- Входящие сообщения озвучиваются в активном канале.'
    },
    3: {
        title: 'Личный кабинет обновлён',
        content: '- Блок «О себе» сохраняется мгновенно.\n- Витрина профиля и XP считаются по темам/ответам/чату.\n- Добавлены быстрые кнопки Discord и поддержки.'
    },
    4: {
        title: 'Оптимизация мобильного запуска',
        content: '- Ускорен старт лаунчера.\n- Проверка обновлений стала стабильнее на Android.\n- Уменьшены фризы при первом входе.'
    }
};

const announcementDetails = {
    1: {
        title: 'Регламент радиообмена обновлён',
        content: '- Введён единый формат переговоров.\n- Обязательное подтверждение вызова от экипажа.\n- Уточнены правила приоритета канала 1.'
    },
    2: {
        title: 'Техническое окно',
        content: '03.05.2026, 02:00–03:00 МСК. Плановое обслуживание мини-БД и шлюза подключения.'
    },
    3: {
        title: 'Набор модераторов и диспетчеров',
        content: 'Ищем активных участников для поддержки форума и координации вызовов в тестовых сменах.'
    },
    4: {
        title: 'Пакет «Командный доступ»',
        content: 'До 10 мая действует скидка на командные тарифы и ранний доступ к новым сборкам.'
    }
};

function showNewsDetail(id) {
    const detail = newsDetails[id];
    if (!detail) return;
    showModal(detail.title, detail.content.replace(/\n/g, '<br>'));
}

function showAnnouncementDetail(id) {
    const detail = announcementDetails[id];
    if (!detail) return;
    showModal(detail.title, detail.content.replace(/\n/g, '<br>'));
}

function showProfile(username) {
    showModal(`Профиль ${username}`, `Информация по роли и активности пользователя ${username} отображается в личном кабинете.`);
}

function showModal(title, content) {
    document.getElementById('modal-body').innerHTML = `<h3>${title}</h3><p>${content}</p>`;
    document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function mobilePlay() {
    // Пробуем открыть кастомный протокол клиента, fallback — раздел скачивания.
    try {
        window.location.href = `krmp112://connect?host=${encodeURIComponent(SERVER_ENDPOINT)}`;
    } catch (e) {
        showSection('download');
    }
    showNotification('Пробуем открыть клиент. Если не сработало — используйте раздел «Скачать».');
}

function quickLink(kind) {
    switch (kind) {
        case 'discord':
            window.open('https://hub-digital.ru/discord', '_blank');
            showNotification('Открываем Discord: hub-digital.ru/discord');
            break;
        case 'support':
            window.open('mailto:support@hub-digital.ru', '_blank');
            showNotification('Открываем почту для support@hub-digital.ru');
            break;
        case 'req':
            alert('Подробные требования:\nAndroid: 10+\nCPU: 4 ядра 2.0 ГГц+\nRAM: 4 ГБ (реком. 6 ГБ)\nGPU: Adreno 610 / Mali-G57+\nДиск: 6 ГБ свободно');
            break;
        default:
            break;
    }
}

function copyServer() {
    const ip = SERVER_ENDPOINT;
    if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(ip).then(() => showNotification('IP скопирован: ' + ip));
    } else {
        const input = document.createElement('input');
        input.value = ip;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
        showNotification('IP скопирован: ' + ip);
    }
}
