(() => {
  const el = document.getElementById('xm-launch');
  if (!el) return;

  try {
    if (sessionStorage.getItem('xm-launch-seen')) {
      el.remove();
      return;
    }
  } catch (e) {}

  el.hidden = false;
  let started = false;

  const start = () => {
    if (started || document.visibilityState !== 'visible') {
      return;
    }

    started = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('xm-running');

        try {
          sessionStorage.setItem('xm-launch-seen', '1');
        } catch (e) {}

        setTimeout(() => {
          el.classList.add('xm-exit');

          setTimeout(() => {
            el.remove();
          }, 350);
        }, 2500);
      });
    });
  };

  const ready = () => {
    if (document.visibilityState === 'visible') {
      start();
    } else {
      document.addEventListener('visibilitychange', start);
    }
  };

  if (document.readyState === 'complete') {
    ready();
  } else {
    window.addEventListener('load', ready, { once: true });
  }
})();
