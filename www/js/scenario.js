// js/scenario.js — XpressoMedic Scenarios
// Cedar Hollow static scenario renderer
// Structured EMS assessment layout

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
  emtb:
    typeof SCENARIOS_CEDAR_EMTB !== 'undefined'
      ? SCENARIOS_CEDAR_EMTB
      : {},

  aemt:
    typeof SCENARIOS_CEDAR_AEMT !== 'undefined'
      ? SCENARIOS_CEDAR_AEMT
      : {},

  medic:
    typeof SCENARIOS_CEDAR_MEDIC !== 'undefined'
      ? SCENARIOS_CEDAR_MEDIC
      : {}
};

const SCENARIOS_ACTIVE =
  SCENARIO_MAP[level] || SCENARIO_MAP.emtb;


/* ==========================================================
   CEDAR HOLLOW LOCATIONS
   ========================================================== */

const LOCATIONS = {

  cedar_school: {
    name: 'Cedar Hollow High School',
    shortName: 'High School',
    icon: '🏫',
    address: '100 Falcon Way'
  },

  cedar_pool: {
    name: 'Cedar Hollow Community Pool',
    shortName: 'Community Pool',
    icon: '🏊',
    address: '215 North Street'
  },

  cedar_family_medicine: {
    name: 'Cedar Hollow Family Medicine',
    shortName: 'Family Medicine',
    icon: '🩺',
    address: '310 Cedar Avenue'
  },

  cedar_care: {
    name: 'Cedar Care Nursing & Rehab',
    shortName: 'Cedar Care',
    icon: '🏥',
    address: '420 Cedar Avenue'
  },

  cedar_athletics: {
    name: 'Cedar Hollow Athletic Complex',
    shortName: 'Athletic Complex',
    icon: '🏟️',
    address: '610 Stadium Drive'
  },

  cedar_apartments: {
    name: 'Cedar Hollow Apartments',
    shortName: 'Apartments',
    icon: '🏢',
    address: '725 East Hollow Drive'
  },

  cedar_park: {
    name: 'Cedar Hollow Park',
    shortName: 'Community Park',
    icon: '🌳',
    address: '1 Park Circle'
  },

  cedar_grill: {
    name: 'Cedar Grill',
    shortName: 'Cedar Grill',
    icon: '🍽️',
    address: '80 Hollow Drive'
  },

  cedar_motor_lodge: {
    name: 'Cedar Motor Lodge',
    shortName: 'Motor Lodge',
    icon: '🏨',
    address: '175 Hollow Drive'
  },

  cedar_quick_mart: {
    name: 'Cedar Quick Mart',
    shortName: 'Quick Mart',
    icon: '⛽',
    address: '345 Market Street'
  },

  cedar_market: {
    name: 'Cedar Market',
    shortName: 'Cedar Market',
    icon: '🛒',
    address: '455 Market Street'
  },

  oakwood_estates: {
    name: 'Oakwood Estates',
    shortName: 'Oakwood Estates',
    icon: '🏡',
    address: 'Oakwood Court'
  }
};


const loc =
  LOCATIONS[locationId] || {
    name: 'Cedar Hollow',
    shortName: 'Scenario',
    icon: '🚑',
    address: 'Cedar Hollow'
  };


const pool =
  SCENARIOS_ACTIVE[locationId] || [];


const root =
  document.getElementById('scenarioRoot');

const pageBody =
  document.getElementById('scenarioPageBody');

const badge =
  document.getElementById('levelBadge');

const backButton =
  document.getElementById('backToMap');

const headerSub =
  document.getElementById('headerSub');


/* ==========================================================
   PAGE HEADER
   ========================================================== */

if (badge) {

  badge.textContent =
    LEVEL_LABELS[level] || 'EMT-B';

  badge.className =
    'header-badge ' + level;
}


if (headerSub) {

  headerSub.textContent =
    `${loc.shortName} · EMS Training Scenario`;
}


if (backButton) {

  backButton.addEventListener(
    'click',
    goBackToMap
  );
}


/* ==========================================================
   SCENARIO INDEX
   ========================================================== */

let scenarioIndex =
  getInitialScenarioIndex();


function getInitialScenarioIndex() {

  const requested =
    Number(params.get('scenario'));


  if (
    Number.isInteger(requested) &&
    requested >= 0 &&
    requested < pool.length
  ) {

    return requested;
  }


  return pool.length
    ? Math.floor(
        Math.random() * pool.length
      )
    : 0;
}


/* ==========================================================
   TEXT HELPERS
   ========================================================== */

function escapeHtml(value) {

  return String(value ?? '')

    .replaceAll('&', '&amp;')

    .replaceAll('<', '&lt;')

    .replaceAll('>', '&gt;')

    .replaceAll('"', '&quot;')

    .replaceAll("'", '&#039;');
}


function clean(value) {

  return escapeHtml(
    String(value ?? '').trim()
  );
}


/* ==========================================================
   GENERIC MARKER PARSER
   ========================================================== */

function splitByMarkers(
  text,
  markers
) {

  const raw =
    String(text || '');

  const found =
    [];


  markers.forEach(marker => {

    const idx =
      raw
        .toLowerCase()
        .indexOf(
          marker.key.toLowerCase()
        );


    if (idx !== -1) {

      found.push({
        ...marker,
        idx
      });
    }
  });


  found.sort(
    (a, b) =>
      a.idx - b.idx
  );


  const rows =
    [];


  found.forEach(
    (marker, i) => {

      const start =
        marker.idx +
        marker.key.length;

      const end =
        i + 1 < found.length
          ? found[i + 1].idx
          : raw.length;


      let value =
        raw
          .slice(start, end)
          .trim();


      value =
        value
          .replace(
            /^[\s:–—-]+/,
            ''
          )
          .trim();


      if (value) {

        rows.push({

          icon:
            marker.icon,

          label:
            marker.label,

          value
        });
      }
    }
  );


  return rows;
}


/* ==========================================================
   STRUCTURED ROW RENDERING
   ========================================================== */

function getRowClass(label) {

  return String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


function getPriorityClass(value) {

  const text =
    String(value || '').toLowerCase();

  if (
    text.includes('high') ||
    text.includes('immediate') ||
    text.includes('critical')
  ) {
    return 'priority-high';
  }

  if (
    text.includes('low') ||
    text.includes('non-emergent') ||
    text.includes('nonemergent')
  ) {
    return 'priority-low';
  }

  return 'priority-question';
}


function renderRows(
  rows,
  variant = 'assessment'
) {

  if (!rows.length)
    return '';


  return `
    <div class="ps-grid ps-grid-${variant}">

      ${rows.map(row => {

        const slug =
          getRowClass(row.label);

        const isPriority =
          String(row.label)
            .toLowerCase()
            .includes('patient priority');

        const valueHtml =
          isPriority
            ? `
              <span class="priority-badge ${getPriorityClass(row.value)}">
                ${clean(row.value)}
              </span>
            `
            : clean(row.value);

        return `

          <div class="ps-row ps-row-${variant} ps-row-${slug}">

            <div class="ps-row-icon" aria-hidden="true">
              ${row.icon}
            </div>

            <div class="ps-content">

              <div class="ps-label">
                ${escapeHtml(row.label)}
              </div>

              <div class="ps-value">
                ${valueHtml}
              </div>

            </div>

          </div>

        `;

      }).join('')}

    </div>
  `;
}


function renderHistoryRows(rows) {

  if (!rows.length)
    return '';


  return `
    <div class="history-grid">

      ${rows.map(row => {

        const slug =
          getRowClass(row.label);

        return `

          <article class="history-card history-${slug}">

            <div class="history-card-header">

              <span class="history-card-icon" aria-hidden="true">
                ${row.icon}
              </span>

              <span class="history-card-label">
                ${escapeHtml(row.label)}
              </span>

            </div>

            <div class="history-card-value">
              ${clean(row.value)}
            </div>

          </article>

        `;

      }).join('')}

    </div>
  `;
}


function renderFallback(
  label,
  icon,
  value
) {

  return renderRows([
    {
      label,
      icon,
      value:
        String(value || '')
    }
  ]);
}


/* ==========================================================
   SCENE SIZE-UP
   ========================================================== */

function parseSceneSizeUp(text) {

  const raw =
    String(text || '');


  const rows =
    [];


  /* BSI / PPE */

  if (
    /BSI taken/i.test(raw)
  ) {

    rows.push({
      icon: '🧤',
      label: 'BSI / PPE',
      value:
        'Standard precautions taken.'
    });
  }


  /* Scene Safety */

  let match =
    raw.match(
      /Scene is safe(?:\s*[—:-]\s*)?([^.]*)\./i
    );


  if (match) {

    rows.push({
      icon: '✅',
      label: 'Scene Safety',
      value:
        match[1].trim()
          ? `Scene is safe — ${match[1].trim()}.`
          : 'Scene is safe.'
    });

  } else {

    match =
      raw.match(
        /Scene safety:\s*([^.]*)\./i
      );


    if (match) {

      rows.push({
        icon: '✅',
        label: 'Scene Safety',
        value:
          match[1].trim()
      });
    }
  }


  /* Number of Patients */

  if (
    /\bOne patient\b/i.test(raw)
  ) {

    rows.push({
      icon: '👤',
      label: 'Patients',
      value: '1 patient'
    });

  } else if (
    /\bTwo patients\b/i.test(raw)
  ) {

    rows.push({
      icon: '👥',
      label: 'Patients',
      value: '2 patients'
    });
  }


  /* Nature of Illness */

  match =
    raw.match(
      /Nature of illness:\s*([^.]*)\./i
    );


  if (match) {

    rows.push({
      icon: '🩺',
      label: 'Nature of Illness',
      value:
        match[1].trim()
    });
  }


  /* Mechanism of Injury */

  match =
    raw.match(
      /Mechanism of injury:\s*([^.]*)\./i
    );


  if (match) {

    rows.push({
      icon: '💥',
      label: 'Mechanism of Injury',
      value:
        match[1].trim()
    });
  }


  /* C-Spine */

  match =
    raw.match(
      /C-spine:\s*([^.]*)\./i
    );


  if (match) {

    rows.push({
      icon: '🦴',
      label: 'C-Spine Consideration',
      value:
        match[1].trim()
    });

  } else {

    match =
      raw.match(
        /No mechanism for spinal injury\s*[—-]\s*([^.]*)\./i
      );


    if (match) {

      rows.push({
        icon: '🦴',
        label: 'C-Spine Consideration',
        value:
          `No mechanism for spinal injury — ${match[1].trim()}.`
      });
    }
  }


  /* Resources */

  match =
    raw.match(
      /Resources available:\s*([^.]*)\./i
    );


  if (match) {

    rows.push({
      icon: '🚑',
      label: 'Resources',
      value:
        match[1].trim()
    });

  } else if (
    /No additional resources needed/i.test(raw)
  ) {

    rows.push({
      icon: '🚑',
      label: 'Resources',
      value:
        'No additional resources needed.'
    });
  }


  /* Scene Description */

  const sceneStarts = [
    'You find ',
    'Upon arrival ',
    'On arrival ',
    'You are met by ',
    'You locate '
  ];


  let sceneIdx =
    -1;


  sceneStarts.forEach(
    phrase => {

      const idx =
        raw.indexOf(phrase);


      if (
        idx !== -1 &&
        (
          sceneIdx === -1 ||
          idx < sceneIdx
        )
      ) {

        sceneIdx =
          idx;
      }
    }
  );


  if (sceneIdx !== -1) {

    rows.push({
      icon: '📍',
      label: 'Scene Description',
      value:
        raw
          .slice(sceneIdx)
          .trim()
    });
  }


  return rows.length
    ? renderRows(rows, 'scene')
    : renderFallback(
        'Scene Size-Up',
        '🚨',
        raw
      );
}


/* ==========================================================
   PRIMARY SURVEY
   ========================================================== */

function parsePrimarySurvey(text) {

  const raw =
    String(text || '');


  const rows =
    splitByMarkers(
      raw,
      [

        {
          key:
            'General Impression:',
          label:
            'General Impression',
          icon:
            '👁️'
        },

        {
          key:
            'AVPU:',
          label:
            'AVPU / Mental Status',
          icon:
            '🧠'
        },

        {
          key:
            'Airway:',
          label:
            'Airway',
          icon:
            '💨'
        },

        {
          key:
            'Breathing:',
          label:
            'Breathing',
          icon:
            '🫁'
        },

        {
          key:
            'Circulation:',
          label:
            'Circulation',
          icon:
            '❤️'
        },

        {
          key:
            'Patient Priority',
          label:
            'Patient Priority',
          icon:
            '⚠️'
        }

      ]
    );


  return rows.length
    ? renderRows(rows, 'primary')
    : renderFallback(
        'Primary Survey',
        '⚡',
        raw
      );
}


/* ==========================================================
   HISTORY / SECONDARY
   ========================================================== */

function parseHistorySecondary(text) {

  const raw =
    String(text || '');


  const markers = [

    {
      key: 'OPQRST:',
      label: 'OPQRST',
      icon: '❓'
    },

    {
      key: 'SAMPLE:',
      label: 'SAMPLE',
      icon: '📋'
    },

    {
      key: 'Secondary exam:',
      label: 'Secondary Exam',
      icon: '🔍'
    },

    {
      key: 'Secondary Exam:',
      label: 'Secondary Exam',
      icon: '🔍'
    }

  ];


  const markerIndexes =
    markers

      .map(marker => ({
        ...marker,

        idx:
          raw
            .toLowerCase()
            .indexOf(
              marker.key.toLowerCase()
            )
      }))

      .filter(
        marker =>
          marker.idx !== -1
      )

      .sort(
        (a, b) =>
          a.idx - b.idx
      );


  const rows =
    [];


  if (markerIndexes.length) {

    const intro =
      raw
        .slice(
          0,
          markerIndexes[0].idx
        )
        .trim();


    if (intro) {

      rows.push({
        icon: '🧍',
        label: 'Patient',
        value: intro
      });
    }


    markerIndexes.forEach(
      (marker, i) => {

        const start =
          marker.idx +
          marker.key.length;


        const end =
          i + 1 <
          markerIndexes.length

            ? markerIndexes[
                i + 1
              ].idx

            : raw.length;


        const value =
          raw

            .slice(
              start,
              end
            )

            .replace(
              /^[\s:–—-]+/,
              ''
            )

            .trim();


        if (value) {

          rows.push({

            icon:
              marker.icon,

            label:
              marker.label,

            value
          });
        }
      }
    );
  }


  return rows.length
    ? renderHistoryRows(rows)
    : renderFallback(
        'History & Secondary Assessment',
        '🔍',
        raw
      );
}


/* ==========================================================
   TEACHING POINTS
   ========================================================== */

function parseTeachingPoints(raw) {

  return String(raw || '')

    .split(
      /\d+\.\s+/
    )

    .map(
      item =>
        item.trim()
    )

    .filter(Boolean);
}


/* ==========================================================
   LOCATION HEADER
   ========================================================== */

function renderTopCard(
  index,
  total
) {

  return `

    <section class="scenario-top-card">

      <div class="scenario-location-icon">
        ${loc.icon}
      </div>

      <div class="scenario-location-copy">

        <div class="scenario-location-name">
          ${escapeHtml(loc.name)}
        </div>

        <div class="scenario-location-meta">
          📍 ${escapeHtml(loc.address)}
        </div>

        <div class="scenario-counter">
          Scenario
          ${total ? index + 1 : 0}
          of
          ${total}
        </div>

      </div>

    </section>
  `;
}


/* ==========================================================
   VITALS
   ========================================================== */

function renderVitals(vitals) {

  const v =
    vitals || {};


  return `

    <div class="vitals-grid">

      <div class="vital">
        <div class="val">
          ${clean(v.bp)}
        </div>
        <div class="lbl">
          BP
        </div>
      </div>

      <div class="vital">
        <div class="val">
          ${clean(v.hr)}
        </div>
        <div class="lbl">
          HR
        </div>
      </div>

      <div class="vital">
        <div class="val">
          ${clean(v.rr)}
        </div>
        <div class="lbl">
          RR
        </div>
      </div>

      <div class="vital">
        <div class="val">
          ${clean(v.spo2)}
        </div>
        <div class="lbl">
          SpO₂
        </div>
      </div>

      <div class="vital">
        <div class="val">
          ${clean(v.gcs)}
        </div>
        <div class="lbl">
          GCS
        </div>
      </div>

      <div class="vital">
        <div class="val">
          ${clean(v.temp)}
        </div>
        <div class="lbl">
          Temp
        </div>
      </div>

    </div>
  `;
}


/* ==========================================================
   GENERIC REVEAL SECTION
   ========================================================== */

function renderSection(
  key,
  icon,
  label,
  sublabel,
  content
) {

  return `

    <div
      class="reveal-section"
      id="sec-${key}"
    >

      <button
        class="reveal-btn"
        id="btn-${key}"
        onclick="toggleReveal('${key}')"
      >

        <div class="reveal-btn-left">

          <span class="reveal-btn-icon">
            ${icon}
          </span>

          <div>

            <div class="reveal-btn-label">
              ${label}
            </div>

            <div class="reveal-btn-sub">
              ${sublabel}
            </div>

          </div>

        </div>

        <span class="reveal-chevron">
          ▶
        </span>

      </button>


      <div
        class="reveal-content"
        id="con-${key}"
      >

        ${content}

      </div>

    </div>
  `;
}


/* ==========================================================
   MAIN SCENARIO RENDERER
   ========================================================== */

function renderScenario() {

  if (!pool.length) {

    root.innerHTML = `

      ${renderTopCard(
        0,
        0
      )}


      <div class="scenario-empty">

        <div class="empty-icon">
          🚧
        </div>

        <h2>
          No Scenarios Yet
        </h2>

        <p>

          This location does not
          have a

          ${
            escapeHtml(
              LEVEL_LABELS[level] ||
              'EMS'
            )
          }

          scenario bank yet.

        </p>


        <button
          class="scenario-map-return"
          onclick="goBackToMap()"
        >

          ← Back to Cedar Hollow

        </button>

      </div>
    `;


    return;
  }


  const s =
    pool[scenarioIndex];


  const teachingPoints =
    parseTeachingPoints(
      s.teaching_points
    );


  root.innerHTML = `

    ${renderTopCard(
      scenarioIndex,
      pool.length
    )}


    <section class="dispatch-block">

      <div class="dispatch-label">
        📻 Dispatch
      </div>

      <div class="dispatch-text">
        ${clean(s.dispatch_line)}
      </div>


      <div
        class="content-label"
        style="margin-top:12px"
      >
        Chief Complaint
      </div>


      <div class="content-value">
        ${clean(s.chief_complaint)}
      </div>

    </section>


    <button
      class="reveal-all-btn"
      onclick="revealAll()"
    >
      👁 Reveal All Sections
    </button>


    ${renderSection(
      'scene',

      '🚨',

      'Scene Size-Up',

      'BSI · Safety · Patients · MOI/NOI · Resources',

      parseSceneSizeUp(
        s.sceneSizeUp
      )
    )}


    ${renderSection(
      'primary',

      '⚡',

      'Primary Survey',

      'General Impression · AVPU · Airway · Breathing · Circulation · Priority',

      parsePrimarySurvey(
        s.primarySurvey
      )
    )}


    ${renderSection(
      'vitals',

      '📊',

      'Vital Signs',

      'BP · HR · RR · SpO₂ · GCS · Temp',

      renderVitals(
        s.vitals
      )
    )}


    ${renderSection(
      'history',

      '🔍',

      'History & Secondary Assessment',

      'Patient · OPQRST · SAMPLE · Secondary Exam',

      parseHistorySecondary(
        s.historySecondary
      )
    )}


    ${renderSection(
      'teaching',

      '🎓',

      'Teaching Points',

      'Instructor debrief after student answers',

      `

        <div class="teaching-block">

          ${teachingPoints.map(
            (point, i) => `

              <div class="tp-item">

                <div class="tp-num">
                  ${i + 1}
                </div>

                <div class="tp-text">
                  ${clean(point)}
                </div>

              </div>

            `
          ).join('')}

        </div>
      `
    )}


    <div class="scenario-nav-row">

      <button
        class="btn btn-next"
        onclick="nextScenario()"
      >
        ➡ Next
      </button>


      <button
        class="btn btn-random"
        onclick="randomScenario()"
      >
        🎲 Random
      </button>


      <button
        class="btn btn-reset"
        onclick="resetReveals()"
      >
        ↺ Reset
      </button>

    </div>
  `;


  pageBody.scrollTo({
    top: 0,
    behavior: 'auto'
  });
}


/* ==========================================================
   REVEAL CONTROLS
   ========================================================== */

const revealKeys = [

  'scene',

  'primary',

  'vitals',

  'history',

  'teaching'
];


function toggleReveal(key) {

  const btn =
    document.getElementById(
      'btn-' + key
    );

  const con =
    document.getElementById(
      'con-' + key
    );


  if (!btn || !con)
    return;


  const open =
    con.classList.contains(
      'open'
    );


  con.classList.toggle(
    'open',
    !open
  );


  btn.classList.toggle(
    'revealed',
    !open
  );
}


function revealAll() {

  revealKeys.forEach(
    key => {

      const btn =
        document.getElementById(
          'btn-' + key
        );

      const con =
        document.getElementById(
          'con-' + key
        );


      if (con)
        con.classList.add(
          'open'
        );


      if (btn)
        btn.classList.add(
          'revealed'
        );
    }
  );
}


function resetReveals() {

  revealKeys.forEach(
    key => {

      const btn =
        document.getElementById(
          'btn-' + key
        );

      const con =
        document.getElementById(
          'con-' + key
        );


      if (con)
        con.classList.remove(
          'open'
        );


      if (btn)
        btn.classList.remove(
          'revealed'
        );
    }
  );


  pageBody.scrollTo({

    top: 0,

    behavior:
      'smooth'
  });
}


/* ==========================================================
   SCENARIO NAVIGATION
   ========================================================== */

function nextScenario() {

  if (!pool.length)
    return;


  scenarioIndex =
    (
      scenarioIndex + 1
    )
    %
    pool.length;


  renderScenario();
}


function randomScenario() {

  if (!pool.length)
    return;


  if (pool.length === 1) {

    scenarioIndex =
      0;

  } else {

    let next =
      scenarioIndex;


    while (
      next === scenarioIndex
    ) {

      next =
        Math.floor(
          Math.random() *
          pool.length
        );
    }


    scenarioIndex =
      next;
  }


  renderScenario();
}


function goBackToMap() {

  const source =
    params.get('from');

  if (source === 'browse') {

    const category =
      params.get('category') || '';

    const subcategory =
      params.get('subcategory') || '';

    const browseParams =
      new URLSearchParams();

    browseParams.set(
      'level',
      level
    );

    if (category) {
      browseParams.set(
        'category',
        category
      );
    }

    if (subcategory) {
      browseParams.set(
        'subcategory',
        subcategory
      );
    }

    window.location.href =
      `browse.html?${browseParams.toString()}`;

    return;
  }

  window.location.href =
    `map.html?level=${encodeURIComponent(level)}`;
}


/* ==========================================================
   EXPOSE INLINE HANDLERS
   ========================================================== */

window.toggleReveal =
  toggleReveal;

window.revealAll =
  revealAll;

window.resetReveals =
  resetReveals;

window.nextScenario =
  nextScenario;

window.randomScenario =
  randomScenario;

window.goBackToMap =
  goBackToMap;


/* ==========================================================
   START
   ========================================================== */

renderScenario();

})();
