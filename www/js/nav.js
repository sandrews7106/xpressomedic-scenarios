// XpressoMedic shared navigation
(() => {
  'use strict';

  // Training Hub -> Home / certification selection
  window.goHome = function() {
    window.location.href = 'index.html';
  };

  // Town Map -> Training Hub, preserving certification level
  window.goBackToHub = function() {
    const params = new URLSearchParams(window.location.search);
    const level = params.get('level') || 'emtb';

    window.location.href =
      'hub.html?level=' + encodeURIComponent(level);
  };

  // Generic deterministic fallback helper.
  // Does NOT use browser history, preventing navigation loops.
  window.goBack = function(destination = 'index.html') {
    window.location.href = destination;
  };
})();
