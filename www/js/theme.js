// XpressoMedic global theme support
(() => {
  'use strict';

  const STORAGE_KEY = 'xm-theme';

  function getTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    const button = document.getElementById('globalThemeToggle');

    if (button) {
      button.textContent = theme === 'dark' ? '☀️' : '🌙';

      button.setAttribute(
        'aria-label',
        theme === 'dark'
          ? 'Switch to light mode'
          : 'Switch to dark mode'
      );
    }
  }

  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.app-header');

    if (!header || document.getElementById('globalThemeToggle')) {
      return;
    }

    const button = document.createElement('button');

    button.id = 'globalThemeToggle';
    button.className = 'theme-toggle';
    button.type = 'button';

    const current =
      document.documentElement.getAttribute('data-theme') || 'dark';

    button.textContent =
      current === 'dark' ? '☀️' : '🌙';

    button.addEventListener('click', event => {
      event.stopPropagation();

      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'dark';

      applyTheme(
        currentTheme === 'dark'
          ? 'light'
          : 'dark'
      );
    });

    const badge = header.querySelector('.header-badge');

    if (badge) {
      header.insertBefore(button, badge);
    } else {
      header.appendChild(button);
    }
  });
})();
