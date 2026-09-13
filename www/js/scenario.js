// js/scenario.js — XpressoMedic Scenarios
// Cedar Hollow full-screen scenario page

(() => {
'use strict';

const params = new URLSearchParams(window.location.search);
const level = params.get('level') || 'emtb';
const locationId = params.get('location') || 'cedar_school';

const LEVEL_LABELS = {
  emtb: 'EMT-B',
  aemt: 'AEMT',
  medic: 'Paramedic'
};

const SCENARIO_MAP = {
  emtb: typeof SCENARIOS_CEDAR_EMTB !== 'undefined' ? SCENARIOS_CEDAR_EMTB : {},
  aemt: typeof SCENARIOS_CEDAR_AEMT !== 'undefined' ? SCENARIOS_CEDAR_AEMT : {},
  medic: typeof SCENARIOS_CEDAR_MEDIC !== 'undefined' ? SCENARIOS_CEDAR_MEDIC : {}
};

const LOCATIONS = {
  cedar_school: { name:'Cedar Hollow High School', shortName:'High School', icon:'🏫', address:'100 Falcon Way' },
  cedar_pool: { name:'Cedar Hollow Community Pool', shortName:'Community Pool', icon:'🏊', address:'215 North Street' },
  cedar_park: { name:'Cedar Hollow Park', shortName:'Community Park', icon:'🌳', address:'1 Park Circle' },
  cedar_athletics: { name:'Cedar Hollow Athletic Complex', shortName:'Athletic Complex', icon:'🏟️', address:'610 Stadium Drive' },
  cedar_care: { name:'Cedar Care Nursing & Rehab', shortName:'Cedar Care', icon:'🏥', address:'420 Cedar Avenue' },
  cedar_family_medicine: { name:'Cedar Family Medicine', shortName:'Family Medicine', icon:'🩺', address:'310 Cedar Avenue' },
  cedar_apartments: { name:'Cedar Hollow Apartments', shortName:'Apartments', icon:'🏢', address:'725 East Hollow Drive' },
  oakwood_estates: { name:'Oakwood Estates', shortName:'Oakwood Estates', icon:'🏡', address:'Oakwood Court' },
  cedar_quick_mart: { name:'Cedar Quick Mart', shortName:'Quick Mart', icon:'⛽', address:'345 Market Street' },
  cedar_market: { name:'Cedar Market', shortName:'Cedar Market', icon:'🛒', address:'455 Market Street' },
  cedar_motor_lodge: { name:'Cedar Motor Lodge', shortName:'Motor Lodge', icon:'🏨', address:'175 Hollow Drive' },
  cedar_grill: { name:'Cedar Grill', shortName:'Cedar Grill', icon:'🍽️', address:'80 Hollow Drive' }
};

const activeBank = SCENARIO_MAP[level] || SCENARIO_MAP.emtb;
const loc = LOCATIONS[locationId] || LOCATIONS.cedar_school;
const pool = activeBank[locationId] || [];

const root = document.getElementById('scenarioRoot');
const pageBody = document.getElementById('scenarioPageBody');
const badge = document.getElementById('levelBadge');
const backButton = document.getElementById('backToMap');
const headerSub = document.getElementById('headerSub');

if (badge) {
  badge.textContent = LEVEL_LABELS[level] || 'EMT-B';
  badge.className = 'header-badge ' + level;
}

if (headerSub) {
  headerSub.textContent = loc.shortName + ' · EMS Training Scenario';
}

if (backButton) {
  backButton.addEventListener('click', () => {
    window.location.href = `map.html?level=${encodeURIComponent(level)}`;
  });
}

let scenarioIndex = getInitialScenarioIndex();

function getInitialScenarioIndex() {
  const requested = Number(params.get('scenario'));
  if (Number.isInteger(requested) && requested >= 0 && requested < pool.length) return requested;
  return pool.length ? Math.floor(Math.random() * pool.length) : 0;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function parseTeachingPoints(raw) {
  return String(raw || '').split(/\d+\.\s+/).map(p => p.trim()).filter(Boolean);
}

function renderTopCard(index, total) {
  return `
    <section class="scenario-top-card">
      <div class="scenario-location-icon">${loc.icon}</div>
      <div class="scenario-location-copy">
        <div class="scenario-location-name">${escapeHtml(loc.name)}</div>
        <div class="scenario-location-meta">📍 ${escapeHtml(loc.address)}</div>
        <div class="scenario-counter">Scenario ${index + 1} of ${total}</div>
      </div>
    </section>`;
}

function renderVitals(v = {}) {
  return `
    <div class="vitals-grid">
      <div class="vital"><div class="val">${escapeHtml(v.bp)}</div><div class="lbl">BP</div></div>
      <div class="vital"><div class="val">${escapeHtml(v.hr)}</div><div class="lbl">HR</div></div>
      <div class="vital"><div class="val">${escapeHtml(v.rr)}</div><div class="lbl">RR</div></div>
      <div class="vital"><div class="val">${escapeHtml(v.spo2)}</div><div class="lbl">SpO₂</div></div>
      <div class="vital"><div class="val">${escapeHtml(v.gcs)}</div><div class="lbl">GCS</div></div>
      <div class="vital"><div class="val">${escapeHtml(v.temp)}</div><div class="lbl">Temp</div></div>
    </div>`;
}

function renderSection(key, icon, label, sublabel, content) {
  return `
    <div class="reveal-section" id="sec-${key}">
      <button class="reveal-btn" id="btn-${key}" onclick="toggleReveal('${key}')">
        <div class="reveal-btn-left">
          <span class="reveal-btn-icon">${icon}</span>
          <div>
            <div class="reveal-btn-label">${label}</div>
            <div class="reveal-btn-sub">${sublabel}</div>
          </div>
        </div>
        <span class="reveal-chevron">▶</span>
      </button>
      <div class="reveal-content" id="con-${key}">${content}</div>
    </div>`;
}

function block(label, value) {
  return `<div class="ps-grid"><div class="ps-row"><div class="ps-content"><div class="ps-label">${label}</div><div class="ps-value">${escapeHtml(value)}</div></div></div></div>`;
}

function renderScenario() {
  if (!pool.length) {
    root.innerHTML = `${renderTopCard(0,0)}<div class="scenario-empty"><div class="empty-icon">🚧</div><h2>No Scenario Bank</h2><p>No ${escapeHtml(LEVEL_LABELS[level] || 'EMS')} scenarios are available for this location yet.</p><button class="scenario-map-return" onclick="goBackToMap()">← Back to Cedar Hollow</button></div>`;
    return;
  }

  const s = pool[scenarioIndex];
  const teaching = parseTeachingPoints(s.teaching_points);

  root.innerHTML = `
    ${renderTopCard(scenarioIndex, pool.length)}

    <section class="dispatch-block">
      <div class="dispatch-label">📻 Dispatch</div>
      <div class="dispatch-text">${escapeHtml(s.dispatch_line)}</div>
      <div class="content-label" style="margin-top:12px">Chief Complaint</div>
      <div class="content-value">${escapeHtml(s.chief_complaint)}</div>
    </section>

    <button class="reveal-all-btn" onclick="revealAll()">👁 Reveal All Sections</button>

    ${renderSection('scene','🚨','Scene Size-Up','BSI · Safety · MOI/NOI · Resources',block('🚨 Scene Size-Up',s.sceneSizeUp))}
    ${renderSection('primary','⚡','Primary Survey','General Impression · AVPU · xABC · Priority',block('⚡ Primary Survey',s.primarySurvey))}
    ${renderSection('vitals','📊','Vital Signs','BP · HR · RR · SpO₂ · GCS · Temp',renderVitals(s.vitals))}
    ${renderSection('history','🔍','History & Secondary Assessment','OPQRST · SAMPLE · Secondary Exam',block('🔍 History & Secondary Assessment',s.historySecondary))}
    ${renderSection('teaching','🎓','Teaching Points','Debrief after student answers',`<div class="teaching-block">${teaching.map((p,i)=>`<div class="tp-item"><div class="tp-num">${i+1}</div><div class="tp-text">${escapeHtml(p)}</div></div>`).join('')}</div>`)}

    <div class="scenario-nav-row">
      <button class="btn btn-next" onclick="nextScenario()">➡ Next</button>
      <button class="btn btn-random" onclick="randomScenario()">🎲 Random</button>
      <button class="btn btn-reset" onclick="resetReveals()">↺ Reset</button>
    </div>`;

  pageBody.scrollTo({top:0,behavior:'auto'});
}

const revealKeys = ['scene','primary','vitals','history','teaching'];

function toggleReveal(key) {
  const btn=document.getElementById('btn-'+key), con=document.getElementById('con-'+key);
  if(!btn||!con) return;
  const open=con.classList.contains('open');
  con.classList.toggle('open',!open);
  btn.classList.toggle('revealed',!open);
}

function revealAll() {
  revealKeys.forEach(key=>{
    const btn=document.getElementById('btn-'+key), con=document.getElementById('con-'+key);
    if(con) con.classList.add('open');
    if(btn) btn.classList.add('revealed');
  });
}

function resetReveals() {
  revealKeys.forEach(key=>{
    const btn=document.getElementById('btn-'+key), con=document.getElementById('con-'+key);
    if(con) con.classList.remove('open');
    if(btn) btn.classList.remove('revealed');
  });
  pageBody.scrollTo({top:0,behavior:'smooth'});
}

function nextScenario() {
  if(!pool.length) return;
  scenarioIndex=(scenarioIndex+1)%pool.length;
  renderScenario();
}

function randomScenario() {
  if(!pool.length) return;
  if(pool.length===1){scenarioIndex=0;} else {
    let next=scenarioIndex;
    while(next===scenarioIndex) next=Math.floor(Math.random()*pool.length);
    scenarioIndex=next;
  }
  renderScenario();
}

function goBackToMap() {
  window.location.href=`map.html?level=${encodeURIComponent(level)}`;
}

Object.assign(window,{toggleReveal,revealAll,resetReveals,nextScenario,randomScenario,goBackToMap});
renderScenario();
})();
