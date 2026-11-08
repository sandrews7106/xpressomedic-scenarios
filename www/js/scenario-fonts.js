/* XpressoMedic Scenarios — Font Controls */
(() => {
  'use strict';

  const KEY = 'xpresso-scenario-font-size';
  const MIN = 18;
  const MAX = 28;
  const DEFAULT = 22;
  const STEP = 2;

  let size = DEFAULT;

  try {
    const saved = Number(localStorage.getItem(KEY));
    if (Number.isFinite(saved) &&
        saved >= MIN && saved <= MAX) {
      size = saved;
    }
  } catch (_) {}

  function applySize() {
    document.documentElement.style.setProperty(
      '--scenario-font-size', size + 'px'
    );
    document.documentElement.style.setProperty(
      '--scenario-scale', String(size / DEFAULT)
    );

    const output = document.getElementById(
      'scenario-font-value'
    );

    if (output) output.textContent = size + 'px';

    const smaller = document.getElementById(
      'scenario-font-smaller'
    );
    const larger = document.getElementById(
      'scenario-font-larger'
    );

    if (smaller) smaller.disabled = size <= MIN;
    if (larger) larger.disabled = size >= MAX;
  }

  function changeSize(delta) {
    size = Math.min(MAX, Math.max(MIN, size + delta));

    try {
      localStorage.setItem(KEY, String(size));
    } catch (_) {}

    applySize();
  }

  function insertControls() {
    const topCard = document.querySelector(
      '.scenario-top-card'
    );

    if (!topCard || document.getElementById(
      'scenario-font-controls'
    )) return;

    topCard.insertAdjacentHTML('beforebegin', `
      <div class="scenario-font-controls"
           id="scenario-font-controls">
        <span class="scenario-font-label">Text Size</span>
        <div class="scenario-font-actions">
          <button type="button"
                  id="scenario-font-smaller"
                  aria-label="Decrease scenario text size">
            A−
          </button>
          <span class="scenario-font-value"
                id="scenario-font-value"
                aria-live="polite"></span>
          <button type="button"
                  id="scenario-font-larger"
                  aria-label="Increase scenario text size">
            A+
          </button>
        </div>
      </div>
    `);

    applySize();
  }

  applySize();

  document.addEventListener('click', (event) => {
    if (event.target.closest(
      '#scenario-font-smaller'
    )) {
      changeSize(-STEP);
    }

    if (event.target.closest(
      '#scenario-font-larger'
    )) {
      changeSize(STEP);
    }
  });

  function init() {
    insertControls();

    const observer = new MutationObserver(() => {
      insertControls();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
