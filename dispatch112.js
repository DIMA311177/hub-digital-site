const CITY_CENTER = [55.751244, 37.618423];

const CHANNEL_LABELS = {
    1: 'Диспетчер',
    2: 'Полиция',
    3: 'МЧС',
    4: 'Скорая'
};

const CHANNEL_FREQ = {
    1: '145.500',
    2: '145.575',
    3: '145.625',
    4: '145.675'
};

const SERVICE_CHANNEL = {
    police: 2,
    fire: 3,
    ems: 4
};

const PRIORITY_CLASS = {
    high: 'high',
    medium: 'medium',
    low: 'low'
};

const CALL_TEMPLATES = [
    { title: 'ДТП с пострадавшими', service: 'ems', code: 'MED-01', priority: 'high' },
    { title: 'Возгорание в жилом доме', service: 'fire', code: 'FIR-04', priority: 'high' },
    { title: 'Потасовка во дворе', service: 'police', code: 'POL-08', priority: 'medium' },
    { title: 'Подозрительный предмет', service: 'police', code: 'POL-15', priority: 'high' },
    { title: 'Потеря сознания', service: 'ems', code: 'MED-07', priority: 'high' },
    { title: 'Дым из подвала', service: 'fire', code: 'FIR-12', priority: 'medium' },
    { title: 'Шум и нарушение порядка', service: 'police', code: 'POL-21', priority: 'low' },
    { title: 'Сильная боль в груди', service: 'ems', code: 'MED-14', priority: 'medium' }
];

const UNIT_SEED = [
    { id: 'P-101', callsign: 'ППС ЦАО-101', service: 'police', emoji: '🚓', base: [55.759, 37.629], speed: 0.0012 },
    { id: 'P-204', callsign: 'ППС СВАО-204', service: 'police', emoji: '🚔', base: [55.742, 37.61], speed: 0.00115 },
    { id: 'P-315', callsign: 'ДПС-315', service: 'police', emoji: '🚓', base: [55.748, 37.651], speed: 0.0011 },
    { id: 'F-11', callsign: 'ПСО МЧС-11', service: 'fire', emoji: '🚒', base: [55.761, 37.605], speed: 0.00105 },
    { id: 'F-22', callsign: 'ПСО МЧС-22', service: 'fire', emoji: '🚒', base: [55.736, 37.633], speed: 0.001 },
    { id: 'E-03', callsign: 'СМП-03-1', service: 'ems', emoji: '🚑', base: [55.745, 37.592], speed: 0.0013 },
    { id: 'E-09', callsign: 'СМП-03-2', service: 'ems', emoji: '🚑', base: [55.768, 37.642], speed: 0.00128 }
];

const RADIO_AUTO_LINES = {
    police: [
        'Патруль-12, на связи, квадрат чистый.',
        'Принял ориентировку, начинаем отработку адреса.',
        'Вышли на проверку, доклад через минуту.',
        'Контакт установлен, нарушений не выявлено.',
        'Работаем по объекту, связь держим.'
    ],
    fire: [
        'Пожарный расчет 41, на связи, выехали.',
        'Прибыли, осматриваем этажи.',
        'Гидрант в норме, приступаем к тушению.',
        'Дым есть, открываем стволы.',
        'Разведка завершена, ждем подкрепление.'
    ],
    ems: [
        'СМП-03, на связи, выезд.',
        'Приняли вызов, едем на адрес.',
        'Пациент стабилен, готовим транспортировку.',
        'Нужна помощь на месте, прошу встречу.',
        'Следуем в стационар, передаю отделению.'
    ]
};

// Local recordings of real radio chatter used in the live panel.
const REAL_RADIO_AUDIO = {
    chatter: {
        1: [
            {
                url: 'assets/radio/police-radio.mp3',
                startMin: 3,
                startMax: 12,
                snippet: 4.6
            },
            {
                url: 'assets/radio/fire-radio.mp3',
                startMin: 1,
                startMax: 8,
                snippet: 4.3
            },
            {
                url: 'assets/radio/ems-radio.mp3',
                startMin: 1,
                startMax: 8,
                snippet: 4.4
            }
        ],
        2: [
            {
                url: 'assets/radio/police-radio.mp3',
                startMin: 3,
                startMax: 10,
                snippet: 4.7
            },
            {
                url: 'assets/radio/police-radio.mp3',
                startMin: 12,
                startMax: 22,
                snippet: 4.6
            },
            {
                url: 'assets/radio/police-radio.mp3',
                startMin: 24,
                startMax: 34,
                snippet: 4.5
            },
            {
                url: 'assets/radio/police-radio.mp3',
                startMin: 36,
                startMax: 46,
                snippet: 4.5
            }
        ],
        3: [
            {
                url: 'assets/radio/fire-radio.mp3',
                startMin: 1,
                startMax: 6,
                snippet: 4.4
            },
            {
                url: 'assets/radio/fire-radio.mp3',
                startMin: 7,
                startMax: 12,
                snippet: 4.5
            },
            {
                url: 'assets/radio/fire-radio.mp3',
                startMin: 13,
                startMax: 18,
                snippet: 4.4
            },
            {
                url: 'assets/radio/fire-radio.mp3',
                startMin: 18,
                startMax: 23,
                snippet: 4.3
            }
        ],
        4: [
            {
                url: 'assets/radio/ems-radio.mp3',
                startMin: 1,
                startMax: 7,
                snippet: 4.5
            },
            {
                url: 'assets/radio/ems-radio.mp3',
                startMin: 8,
                startMax: 15,
                snippet: 4.5
            },
            {
                url: 'assets/radio/ems-radio.mp3',
                startMin: 16,
                startMax: 23,
                snippet: 4.4
            },
            {
                url: 'assets/radio/ems-radio.mp3',
                startMin: 24,
                startMax: 32,
                snippet: 4.3
            }
        ]
    },
    siren: [
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/79/WWS_Policecarsiren.ogg/WWS_Policecarsiren.ogg.mp3',
        'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/86/WWS_Policevan-sirenone.ogg/WWS_Policevan-sirenone.ogg.mp3'
    ],
    pttZip: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Zip_tone.ogg'
};

const state = {
    running: true,
    callSeq: 1001,
    calls: [],
    units: [],
    radio: {
        youtubeEnabled: true,
        voiceEnabled: true,
        sfxEnabled: true,
        audioArmed: false,
        volume: 0.75,
        squelch: 0.55,
        channel: 1,
        battery: 87,
        signalLevel: 3,
        tx: false
    }
};

let map;
let callLayer;
let unitLayer;
let audioCtx;
let activePtt = false;
let activeRealVoiceAudio;
let activeYoutubePlayback = false;
let activeYoutubeStopTimer = null;
let lastRealVoiceAt = 0;

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDom();
    initMap();
    initUnits();
    bindEvents();
    seedCalls();
    renderAll();
    setClock();
    setInterval(setClock, 1000);
    setInterval(simulationTick, 1000);
    setInterval(autoRadioTick, 9000);
    setInterval(updateRadioTelemetry, 2500);
    dom.radioChannel.value = String(state.radio.channel);
    dom.radioVoice.checked = state.radio.voiceEnabled;
    dom.radioReal.checked = state.radio.youtubeEnabled;
    dom.radioSfx.checked = state.radio.sfxEnabled;
    dom.radioVolume.value = String(Math.round(state.radio.volume * 100));
    dom.radioSquelch.value = String(Math.round(state.radio.squelch * 100));
    updateBaofengDisplay();
    radioLog(1, 'Диспетчер-Центр', 'Смена принята, все службы на линии.');
});

function cacheDom() {
    dom.callsList = document.getElementById('calls-list');
    dom.callsCount = document.getElementById('calls-count');
    dom.unitsGrid = document.getElementById('units-grid');
    dom.unitsCount = document.getElementById('units-count');
    dom.hudPolice = document.getElementById('hud-police');
    dom.hudFire = document.getElementById('hud-fire');
    dom.hudEms = document.getElementById('hud-ems');
    dom.hudAssigned = document.getElementById('hud-assigned');
    dom.clock = document.getElementById('ops-clock');
    dom.btnSim = document.getElementById('btn-sim-toggle');
    dom.btnAddCall = document.getElementById('btn-add-call');
    dom.radioLog = document.getElementById('radio-log');
    dom.radioForm = document.getElementById('radio-form');
    dom.radioText = document.getElementById('radio-text');
    dom.radioChannel = document.getElementById('radio-channel');
    dom.radioVoice = document.getElementById('radio-voice');
    dom.radioReal = document.getElementById('radio-real');
    dom.radioSfx = document.getElementById('radio-sfx');
    dom.radioVolume = document.getElementById('radio-volume');
    dom.radioSquelch = document.getElementById('radio-squelch');
    dom.ytRadioHost = document.getElementById('yt-radio-host');
    dom.bfChannel = document.getElementById('bf-channel');
    dom.bfFrequency = document.getElementById('bf-frequency');
    dom.bfBattery = document.getElementById('bf-battery');
    dom.bfSignal = document.getElementById('bf-signal');
    dom.bfPtt = document.getElementById('bf-ptt');
}

function initMap() {
    map = L.map('ops-map', { zoomControl: true, minZoom: 10, maxZoom: 18 }).setView(CITY_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    callLayer = L.layerGroup().addTo(map);
    unitLayer = L.layerGroup().addTo(map);
}

function initUnits() {
    state.units = UNIT_SEED.map(seed => {
        const marker = L.marker(seed.base, { icon: unitIcon(seed.service, seed.emoji) }).addTo(unitLayer);
        marker.bindTooltip(seed.callsign, { direction: 'top', offset: [0, -8] });
        return {
            ...seed,
            pos: [...seed.base],
            marker,
            status: 'free',
            target: null,
            sceneTicks: 0,
            assignedCallId: null
        };
    });
}

function bindEvents() {
    dom.btnSim.addEventListener('click', () => {
        state.radio.audioArmed = true;
        state.running = !state.running;
        dom.btnSim.textContent = state.running ? 'Пауза' : 'Продолжить';
        if (!state.running) {
            stopRealVoiceClip();
        }
        radioLog(1, 'Диспетчер-Центр', state.running ? 'Симуляция возобновлена.' : 'Симуляция поставлена на паузу.');
    });

    dom.btnAddCall.addEventListener('click', () => {
        state.radio.audioArmed = true;
        createCall(true);
        renderAll();
    });

    dom.radioForm.addEventListener('submit', e => {
        e.preventDefault();
        state.radio.audioArmed = true;
        const text = dom.radioText.value.trim();
        if (!text) return;
        const channel = Number(dom.radioChannel.value);
        radioLog(channel, 'Baofeng-112', text);
        dom.radioText.value = '';
    });

    dom.radioChannel.addEventListener('change', () => {
        state.radio.audioArmed = true;
        const nextChannel = Number(dom.radioChannel.value);
        setRadioChannel(nextChannel);
        radioLog(1, 'Диспетчер-Центр', `Переключение на канал ${state.radio.channel} (${CHANNEL_LABELS[state.radio.channel]}).`);
    });

    dom.radioVoice.addEventListener('change', () => {
        state.radio.audioArmed = true;
        state.radio.voiceEnabled = dom.radioVoice.checked;
        if (!state.radio.voiceEnabled) stopRealVoiceClip();
    });

    dom.radioReal.addEventListener('change', () => {
        state.radio.audioArmed = true;
        state.radio.youtubeEnabled = dom.radioReal.checked;
        if (!state.radio.youtubeEnabled) {
            stopRealVoiceClip();
            return;
        }
        stopRealVoiceClip();
        playYoutubeNegotiation('traffic');
    });

    dom.radioSfx.addEventListener('change', () => {
        state.radio.audioArmed = true;
        state.radio.sfxEnabled = dom.radioSfx.checked;
    });

    dom.radioVolume.addEventListener('input', () => {
        state.radio.audioArmed = true;
        state.radio.volume = Number(dom.radioVolume.value) / 100;
    });

    dom.radioSquelch.addEventListener('input', () => {
        state.radio.audioArmed = true;
        state.radio.squelch = Number(dom.radioSquelch.value) / 100;
        updateBaofengDisplay();
    });

    dom.bfPtt.addEventListener('mousedown', startPtt);
    dom.bfPtt.addEventListener('touchstart', startPtt);
    dom.bfPtt.addEventListener('mouseup', endPtt);
    dom.bfPtt.addEventListener('mouseleave', endPtt);
    dom.bfPtt.addEventListener('touchend', endPtt);
    dom.bfPtt.addEventListener('touchcancel', endPtt);

    document.querySelectorAll('.bf-btn[data-bf]').forEach(btn => {
        btn.addEventListener('click', () => {
            state.radio.audioArmed = true;
            const digit = Number(btn.dataset.bf);
            if (digit >= 1 && digit <= 4) {
                setRadioChannel(digit);
                radioLog(1, 'Диспетчер-Центр', `Рация переключена на канал ${digit} (${CHANNEL_LABELS[digit]}).`);
            } else {
                tone(640, 0.03, 'triangle');
            }
        });
    });
}

function seedCalls() {
    for (let i = 0; i < 3; i += 1) {
        createCall(false);
    }
}

function simulationTick() {
    if (!state.running) return;

    if (activeCalls().length < 8 && Math.random() > 0.73) {
        createCall(false);
    }

    state.units.forEach(unit => {
        if (unit.status === 'scene') {
            unit.sceneTicks -= 1;
            if (unit.sceneTicks <= 0) {
                resolveCallByUnit(unit);
            }
            return;
        }

        if (!unit.target) return;
        moveUnit(unit);
    });

    renderAll();
}

function autoRadioTick() {
    if (!state.running) return;
    const candidates = state.units.filter(unit => unit.status !== 'route');
    if (!candidates.length) return;
    const unit = candidates[Math.floor(Math.random() * candidates.length)];
    const lines = RADIO_AUTO_LINES[unit.service];
    const line = lines[Math.floor(Math.random() * lines.length)];
    radioLog(SERVICE_CHANNEL[unit.service], unit.callsign, line);
}

function createCall(announce) {
    const template = CALL_TEMPLATES[Math.floor(Math.random() * CALL_TEMPLATES.length)];
    const latlng = randomPoint(CITY_CENTER, 0.04);
    const call = {
        id: `C-${state.callSeq}`,
        ...template,
        latlng,
        status: 'new',
        assignedUnitId: null,
        createdAt: Date.now(),
        marker: null
    };
    state.callSeq += 1;
    call.marker = L.marker(latlng, { icon: callIcon(false) }).addTo(callLayer);
    call.marker.bindTooltip(`${call.id} • ${call.title}`, { direction: 'top', offset: [0, -8] });
    state.calls.unshift(call);

    if (announce) map.panTo(latlng);

    radioLog(1, 'Диспетчер-Центр', `Новый вызов ${call.id}: ${call.title}. Приоритет ${priorityRu(call.priority)}.`);
    if (announce) {
        playDispatchEvent('new-call', SERVICE_CHANNEL[call.service]);
    }
}

function assignCall(callId) {
    state.radio.audioArmed = true;
    const call = state.calls.find(item => item.id === callId && item.status !== 'resolved');
    if (!call) return;

    if (call.assignedUnitId) {
        map.panTo(call.latlng);
        return;
    }

    const pool = state.units.filter(unit => unit.service === call.service && unit.status === 'free');
    if (!pool.length) {
        radioLog(1, 'Диспетчер-Центр', `Нет свободных экипажей для ${call.id} (${serviceRu(call.service)}).`);
        return;
    }

    const unit = pool.reduce((best, candidate) => {
        if (!best) return candidate;
        const bestDist = distance(best.pos, call.latlng);
        const candDist = distance(candidate.pos, call.latlng);
        return candDist < bestDist ? candidate : best;
    }, null);

    unit.status = 'route';
    unit.target = [...call.latlng];
    unit.assignedCallId = call.id;

    call.status = 'assigned';
    call.assignedUnitId = unit.id;
    refreshCallMarker(call);

    radioLog(1, 'Диспетчер-Центр', `${unit.callsign} назначен на вызов ${call.id}.`);
    radioLog(SERVICE_CHANNEL[unit.service], unit.callsign, `Принял ${call.id}, выезжаю.`);
    playDispatchEvent('assign', SERVICE_CHANNEL[unit.service]);
}

function resolveCallByUnit(unit) {
    const call = state.calls.find(item => item.id === unit.assignedCallId);
    if (call) {
        call.status = 'resolved';
        call.resolvedAt = Date.now();
        if (call.marker) {
            callLayer.removeLayer(call.marker);
            call.marker = null;
        }
        radioLog(SERVICE_CHANNEL[unit.service], unit.callsign, `Работы по ${call.id} завершены, возвращаюсь.`);
        playDispatchEvent('resolved', SERVICE_CHANNEL[unit.service]);
    }
    unit.status = 'return';
    unit.target = [...unit.base];
    unit.sceneTicks = 0;
}

function moveUnit(unit) {
    const dist = distance(unit.pos, unit.target);
    if (dist <= unit.speed) {
        unit.pos = [...unit.target];
        unit.marker.setLatLng(unit.pos);
        handleArrival(unit);
        return;
    }
    const t = unit.speed / dist;
    unit.pos = [
        unit.pos[0] + (unit.target[0] - unit.pos[0]) * t,
        unit.pos[1] + (unit.target[1] - unit.pos[1]) * t
    ];
    unit.marker.setLatLng(unit.pos);
}

function handleArrival(unit) {
    if (unit.status === 'route') {
        unit.status = 'scene';
        unit.sceneTicks = 12 + Math.floor(Math.random() * 18);
        radioLog(SERVICE_CHANNEL[unit.service], unit.callsign, `Прибыл на место, приступаю к работе.`);
        playDispatchEvent('arrived', SERVICE_CHANNEL[unit.service]);
        const call = state.calls.find(item => item.id === unit.assignedCallId);
        if (call) call.status = 'scene';
        return;
    }

    if (unit.status === 'return') {
        unit.status = 'free';
        unit.target = null;
        unit.assignedCallId = null;
        radioLog(SERVICE_CHANNEL[unit.service], unit.callsign, 'Вернулся на базу, снова в готовности.');
    }
}

function renderAll() {
    renderCalls();
    renderUnits();
    renderHud();
}

function renderCalls() {
    const active = activeCalls();
    dom.callsList.innerHTML = '';

    if (!active.length) {
        dom.callsList.innerHTML = '<div class="call-card">Активных вызовов нет. Ожидаем новые события.</div>';
    }

    active.forEach(call => {
        const card = document.createElement('article');
        card.className = 'call-card';
        const assignedText = call.assignedUnitId ? `Назначен: ${call.assignedUnitId}` : 'Экипаж не назначен';
        card.innerHTML = `
            <div class="call-meta">
                <span>${call.id} • ${call.code}</span>
                <span class="priority ${PRIORITY_CLASS[call.priority]}">${priorityRu(call.priority)}</span>
            </div>
            <p class="call-title">${call.title}</p>
            <div class="call-meta">
                <span>${serviceRu(call.service)}</span>
                <span>${timeAgo(call.createdAt)}</span>
            </div>
            <div class="call-meta">
                <span>${assignedText}</span>
            </div>
            <div class="call-actions">
                <button class="btn btn-mini secondary" data-action="assign" data-call="${call.id}">${call.assignedUnitId ? 'К месту' : 'Назначить'}</button>
                <button class="btn btn-mini ghost" data-action="focus" data-call="${call.id}">На карте</button>
            </div>
        `;
        dom.callsList.appendChild(card);
    });

    dom.callsList.querySelectorAll('button[data-action="assign"]').forEach(btn => {
        btn.addEventListener('click', () => {
            assignCall(btn.dataset.call);
            renderAll();
        });
    });

    dom.callsList.querySelectorAll('button[data-action="focus"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const call = state.calls.find(item => item.id === btn.dataset.call);
            if (!call) return;
            map.panTo(call.latlng);
            map.setZoom(14);
        });
    });

    dom.callsCount.textContent = `${active.length} активных`;
}

function renderUnits() {
    dom.unitsGrid.innerHTML = '';
    state.units.forEach(unit => {
        const card = document.createElement('article');
        card.className = 'unit-card';
        card.innerHTML = `
            <div class="unit-top">
                <div>
                    <div class="unit-name">${unit.callsign}</div>
                    <div class="unit-service">${serviceRu(unit.service)}</div>
                </div>
                <span class="status-pill ${statusClass(unit.status)}">${statusRu(unit.status)}</span>
            </div>
            <div class="unit-extra">Позиция: ${unit.pos[0].toFixed(4)}, ${unit.pos[1].toFixed(4)}</div>
            <div class="unit-extra">${unit.assignedCallId ? `Вызов: ${unit.assignedCallId}` : 'Без активного вызова'}</div>
        `;
        dom.unitsGrid.appendChild(card);
    });
    dom.unitsCount.textContent = `${state.units.length} единиц`;
}

function renderHud() {
    const police = state.units.filter(unit => unit.service === 'police').length;
    const fire = state.units.filter(unit => unit.service === 'fire').length;
    const ems = state.units.filter(unit => unit.service === 'ems').length;
    const assigned = activeCalls().filter(call => !!call.assignedUnitId).length;
    dom.hudPolice.textContent = police;
    dom.hudFire.textContent = fire;
    dom.hudEms.textContent = ems;
    dom.hudAssigned.textContent = assigned;
}

function refreshCallMarker(call) {
    if (!call.marker) return;
    call.marker.setIcon(callIcon(Boolean(call.assignedUnitId)));
}

function unitIcon(service, emoji) {
    return L.divIcon({
        className: '',
        html: `<div class="unit-marker ${service}">${emoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
    });
}

function callIcon(assigned) {
    return L.divIcon({
        className: '',
        html: `<div class="call-marker ${assigned ? 'assigned' : ''}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
}

function activeCalls() {
    return state.calls.filter(call => call.status !== 'resolved');
}

function radioLog(channel, from, text) {
    const item = document.createElement('div');
    item.className = 'radio-item';
    item.innerHTML = `<span class="time">${nowTime()}</span><span class="channel">[CH${channel} ${CHANNEL_LABELS[channel]}]</span><strong>${from}:</strong> ${text}`;
    item.classList.toggle('muted-channel', channel !== state.radio.channel);
    dom.radioLog.prepend(item);
    while (dom.radioLog.children.length > 120) {
        dom.radioLog.removeChild(dom.radioLog.lastChild);
    }
    if (channel === state.radio.channel && state.radio.audioArmed) {
        playReceiveFx(channel);
    }
    if (state.radio.audioArmed && state.radio.voiceEnabled && !activeYoutubePlayback) {
        const voiceDelay = channel === state.radio.channel ? 120 : 0;
        window.setTimeout(() => {
            speakRadio(channel, from, text);
        }, voiceDelay);
    }
    updateBaofengDisplay();
}

function setRadioChannel(channel) {
    const safe = Math.min(4, Math.max(1, Number(channel) || 1));
    state.radio.channel = safe;
    dom.radioChannel.value = String(safe);
    playZipTone(0.55);
    tone(1120, 0.05, 'square', 0.75);
    updateBaofengDisplay();
}

function updateRadioTelemetry() {
    if (!state.running) return;
    const drift = Math.random() > 0.68 ? 1 : 0;
    state.radio.battery = Math.max(37, state.radio.battery - drift * 0.25);
    const baseSignal = 2 + Math.round((1 - state.radio.squelch) * 2);
    const jitter = Math.floor(Math.random() * 2);
    state.radio.signalLevel = Math.max(1, Math.min(5, baseSignal + jitter));
    updateBaofengDisplay();
}

function updateBaofengDisplay() {
    const channel = state.radio.channel;
    const freq = CHANNEL_FREQ[channel] || CHANNEL_FREQ[1];
    const signal = state.radio.tx ? 5 : state.radio.signalLevel;
    if (dom.bfChannel) dom.bfChannel.textContent = String(channel).padStart(2, '0');
    if (dom.bfFrequency) dom.bfFrequency.textContent = `${freq}`;
    if (dom.bfBattery) dom.bfBattery.textContent = `BAT ${Math.round(state.radio.battery)}%`;
    if (dom.bfSignal) dom.bfSignal.textContent = `SIG ${signalBars(signal)}`;
}

function signalBars(level) {
    const safe = Math.max(0, Math.min(5, level));
    return '█'.repeat(safe) + '▁'.repeat(5 - safe);
}

function ensureAudio() {
    if (audioCtx) return audioCtx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
    return audioCtx;
}

function tone(freq, duration = 0.06, wave = 'sine', gainBoost = 1) {
    if (!state.radio.sfxEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const volume = Math.max(0.01, Math.min(1, state.radio.volume)) * 0.12 * gainBoost;
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
}

function radioNoise(duration = 0.08, strength = 1) {
    if (!state.radio.sfxEnabled) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i += 1) {
        data[i] = (Math.random() * 2 - 1) * 0.35;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 0.9;
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const volume = Math.max(0.01, state.radio.volume) * 0.08 * strength;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.linearRampToValueAtTime(0.0001, now + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.01);
}

function playReceiveFx(channel) {
    if (!state.radio.audioArmed) return;
    const spread = Math.max(0.35, 1 - state.radio.squelch);
    tone(720 + channel * 40, 0.03, 'triangle', 0.6);
    radioNoise(0.03 + spread * 0.05, 0.85);
    if (state.radio.youtubeEnabled && Math.random() > 0.58) {
        playZipTone(0.35);
    }
}

function pickOne(list) {
    if (!Array.isArray(list) || !list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}

function stopRealVoiceClip() {
    if (activeRealVoiceAudio) {
        try {
            activeRealVoiceAudio.pause();
            activeRealVoiceAudio.src = '';
        } catch (e) {
            // no-op
        }
        activeRealVoiceAudio = null;
    }
    if (activeYoutubeStopTimer) {
        clearTimeout(activeYoutubeStopTimer);
        activeYoutubeStopTimer = null;
    }
    activeYoutubePlayback = false;
    if (dom.ytRadioHost) {
        dom.ytRadioHost.innerHTML = '';
    }
}

function playExternalSound(url, options = {}) {
    if (!url) return null;
    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = Math.max(0.01, Math.min(1, options.volume ?? state.radio.volume * 0.45));
    audio.playbackRate = Math.max(0.75, Math.min(1.2, options.playbackRate ?? 1));

    const duration = Math.max(0, options.duration ?? 0);
    const startMin = Math.max(0, options.startMin ?? 0);
    const startMax = Math.max(startMin, options.startMax ?? startMin);
    let started = false;

    const stopTimer = duration > 0 ? window.setTimeout(() => {
        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (e) {
            // no-op
        }
    }, (duration + 0.22) * 1000) : null;

    const startPlayback = () => {
        if (started) return;
        started = true;

        let start = startMin + Math.random() * Math.max(0, startMax - startMin);
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            const reserve = Math.max(0.45, duration + 0.2);
            const maxStart = Math.max(0, audio.duration - reserve);
            start = Math.min(start, maxStart);
        }
        try {
            audio.currentTime = Math.max(0, start);
        } catch (e) {
            // no-op
        }
        audio.play().catch(() => {
            if (stopTimer) window.clearTimeout(stopTimer);
        });
    };

    audio.addEventListener('loadedmetadata', startPlayback, { once: true });
    window.setTimeout(startPlayback, 420);
    return audio;
}

function playZipTone(strength = 1) {
    if (!state.radio.audioArmed || !state.radio.youtubeEnabled) return;
    playExternalSound(REAL_RADIO_AUDIO.pttZip, {
        duration: 0.35,
        volume: Math.max(0.05, state.radio.volume * 0.35 * strength)
    });
}

function playSirenBurst(duration = 1.6) {
    if (!state.radio.audioArmed || !state.radio.youtubeEnabled) return;
    const url = pickOne(REAL_RADIO_AUDIO.siren);
    if (!url) return;
    playExternalSound(url, {
        duration,
        volume: Math.max(0.08, state.radio.volume * 0.32)
    });
}

function playRealVoiceSnippet(mode = 'traffic', channel = state.radio.channel, force = false) {
    if (!state.radio.audioArmed || !state.radio.youtubeEnabled) return false;
    const now = Date.now();
    const minGap = mode === 'event' ? 1800 : 2600;
    if (!force && now - lastRealVoiceAt < minGap) return false;

    const list = REAL_RADIO_AUDIO.chatter[channel] || REAL_RADIO_AUDIO.chatter[1];
    const clip = pickOne(list);
    if (!clip) return false;

    lastRealVoiceAt = now;
    stopRealVoiceClip();
    const duration = clip.snippet + Math.random() * 0.8;
    activeRealVoiceAudio = playExternalSound(clip.url, {
        startMin: clip.startMin,
        startMax: clip.startMax,
        duration,
        volume: Math.max(0.08, state.radio.volume * (mode === 'event' ? 0.5 : 0.42))
    });
    if (activeRealVoiceAudio) {
        activeYoutubePlayback = true;
        activeYoutubeStopTimer = window.setTimeout(() => {
            activeYoutubePlayback = false;
            activeYoutubeStopTimer = null;
        }, (duration + 0.22) * 1000);
    }
    return Boolean(activeRealVoiceAudio);
}

function playYoutubeNegotiation(mode = 'traffic', channel = state.radio.channel, force = false) {
    if (!state.radio.audioArmed || !state.radio.youtubeEnabled) return false;
    return playRealVoiceSnippet(mode, channel, force);
}

function playDispatchEvent(kind, channel = state.radio.channel) {
    if (!state.radio.audioArmed) return;
    if (kind === 'new-call') {
        playZipTone(0.8);
        if (!playYoutubeNegotiation('event', channel) && !activeYoutubePlayback) {
            playRealVoiceSnippet('event', channel);
        }
        return;
    }
    if (kind === 'assign') {
        playSirenBurst(1.9);
        playZipTone(0.9);
        if (!playYoutubeNegotiation('assign', channel) && !activeYoutubePlayback) {
            playRealVoiceSnippet('event', channel);
        }
        return;
    }
    if (kind === 'arrived') {
        playSirenBurst(1.15);
        if (!playYoutubeNegotiation('event', channel) && !activeYoutubePlayback) {
            playRealVoiceSnippet('event', channel);
        }
        return;
    }
    if (kind === 'resolved') {
        playZipTone(0.7);
        if (!playYoutubeNegotiation('event', channel) && !activeYoutubePlayback) {
            playRealVoiceSnippet('event', channel);
        }
    }
}

function startPtt(event) {
    if (event) event.preventDefault();
    if (activePtt) return;
    state.radio.audioArmed = true;
    activePtt = true;
    state.radio.tx = true;
    if (dom.bfPtt) {
        dom.bfPtt.classList.add('active');
        dom.bfPtt.textContent = 'PTT / TX';
    }
    stopRealVoiceClip();
    playZipTone(1);
    playYoutubeNegotiation('traffic', state.radio.channel, true);
    tone(1480, 0.05, 'square', 0.95);
    radioNoise(0.05, 0.9);
    updateBaofengDisplay();
}

function endPtt(event) {
    if (event) event.preventDefault();
    if (!activePtt) return;
    activePtt = false;
    state.radio.tx = false;
    if (dom.bfPtt) {
        dom.bfPtt.classList.remove('active');
        dom.bfPtt.textContent = 'PTT / TALK';
    }
    playZipTone(0.8);
    tone(870, 0.05, 'square', 0.85);
    updateBaofengDisplay();
}

function speakRadio(channel, from, text) {
    if (!state.radio.voiceEnabled || !state.radio.audioArmed) return false;
    if (channel === 1 && from === 'Диспетчер-Центр') return false;
    const mode = channel === 1 ? 'event' : 'traffic';
    return playRealVoiceSnippet(mode, channel);
}

function setClock() {
    const now = new Date();
    dom.clock.textContent = now.toLocaleTimeString('ru-RU');
}

function randomPoint(center, radius) {
    const lat = center[0] + (Math.random() - 0.5) * radius;
    const lng = center[1] + (Math.random() - 0.5) * radius;
    return [lat, lng];
}

function distance(a, b) {
    const dx = a[0] - b[0];
    const dy = a[1] - b[1];
    return Math.sqrt(dx * dx + dy * dy);
}

function priorityRu(priority) {
    if (priority === 'high') return 'Высокий';
    if (priority === 'medium') return 'Средний';
    return 'Низкий';
}

function serviceRu(service) {
    if (service === 'police') return 'Полиция';
    if (service === 'fire') return 'МЧС';
    return 'Скорая помощь';
}

function statusRu(status) {
    if (status === 'route') return 'В пути';
    if (status === 'scene') return 'На месте';
    if (status === 'return') return 'Возврат';
    return 'Готов';
}

function statusClass(status) {
    if (status === 'route') return 'status-route';
    if (status === 'scene') return 'status-scene';
    if (status === 'return') return 'status-route';
    return 'status-free';
}

function nowTime() {
    return new Date().toLocaleTimeString('ru-RU');
}

function timeAgo(timestamp) {
    const sec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (sec < 60) return `${sec} сек назад`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} мин назад`;
    const hour = Math.floor(min / 60);
    return `${hour} ч назад`;
}
