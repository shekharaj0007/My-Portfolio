/* Desktop shell: boot sequence, wallpaper particles, dock, icons, clock. */
(() => {
  const $ = id => document.getElementById(id);
  const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------------- boot sequence ---------------- */
  const BOOT_LINES = [
    'RajOS 1.0 — portfolio kernel',
    'mounting /profile ................ ok',
    'linking github.com/' + PROFILE.github + ' ... ok',
    'loading projects, journey, skills . ok',
    'starting window manager .......... ok',
    'welcome, visitor.'
  ];

  function boot() {
    const screen = $('boot');
    const linesHost = $('bootLines');
    const fill = $('bootFill');
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      screen.classList.add('is-gone');
      setTimeout(() => { screen.remove(); startDesktop(); }, 620);
    };

    if (reduceMotion) { finish(); return; }

    document.addEventListener('keydown', finish, { once: true });
    screen.addEventListener('click', finish, { once: true });

    let i = 0;
    const tick = () => {
      if (done) return;
      if (i < BOOT_LINES.length) {
        const p = document.createElement('p');
        p.textContent = BOOT_LINES[i];
        linesHost.appendChild(p);
        fill.style.width = Math.round(((i + 1) / BOOT_LINES.length) * 100) + '%';
        i++;
        setTimeout(tick, i === BOOT_LINES.length ? 420 : 230);
      } else finish();
    };
    setTimeout(tick, 380);
  }

  /* ---------------- wallpaper particles ---------------- */
  function startParticles() {
    const cv = $('stars');
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, pts = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.width = window.innerWidth * dpr;
      h = cv.height = window.innerHeight * dpr;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
      const count = Math.round((window.innerWidth * window.innerHeight) / 26000);
      pts = Array.from({ length: Math.min(count, 90) }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22 * dpr,
        vy: (Math.random() - 0.5) * 0.22 * dpr,
        r: (Math.random() * 1.6 + 0.5) * dpr
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150,215,255,.5)';
        ctx.fill();
      }
      // Faint links between nearby particles for a subtle constellation effect.
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          const lim = 130 * (window.devicePixelRatio || 1);
          if (d2 < lim * lim) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(110,190,255,${0.13 * (1 - Math.sqrt(d2) / lim)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }

  /* ---------------- desktop ---------------- */
  function startDesktop() {
    const desk = $('desktop');
    desk.classList.add('is-live');

    // Desktop icons
    $('icons').innerHTML = APPS.map((a, i) => `
      <button class="ico" data-app="${a.id}" style="animation-delay:${i * 70}ms">
        <span class="ico-glyph">${a.icon}</span>
        <span class="ico-label">${a.title}</span>
      </button>`).join('');

    // Dock
    $('dock').innerHTML = APPS.map(a => `
      <button class="dk" data-app="${a.id}" title="${a.title}">
        <span>${a.icon}</span><i class="dk-tip">${a.title}</i>
      </button>`).join('');

    document.querySelectorAll('[data-app]').forEach(btn => {
      btn.addEventListener('click', () => {
        const app = APPS.find(a => a.id === btn.dataset.app);
        if (app) WM.launch(app);
      });
    });

    // Clock
    const clock = $('clock');
    const tick = () => {
      const d = new Date();
      clock.innerHTML = `<b>${d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</b>
        <span>${d.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' })}</span>`;
    };
    tick();
    setInterval(tick, 1000);

    // Hero intro typewriter
    const tw = $('twRole');
    if (tw && !reduceMotion) {
      const text = PROFILE.role;
      let i = 0;
      const type = () => {
        tw.textContent = text.slice(0, i);
        if (i++ <= text.length) setTimeout(type, 34);
        else tw.classList.add('done');
      };
      setTimeout(type, 500);
    } else if (tw) { tw.textContent = PROFILE.role; tw.classList.add('done'); }

    $('heroName').textContent = PROFILE.name;
    $('heroTag').textContent = PROFILE.tagline;

    // Cursor-follow spotlight on the wallpaper
    if (!reduceMotion) {
      window.addEventListener('pointermove', e => {
        desk.style.setProperty('--mx', (e.clientX / window.innerWidth * 100).toFixed(2) + '%');
        desk.style.setProperty('--my', (e.clientY / window.innerHeight * 100).toFixed(2) + '%');
      });
    }

    // Live status chip in the top bar
    const chip = $('liveChip');
    LIVE.repos()
      .then(r => { chip.className = 'chip-live ok'; chip.innerHTML = `<i></i>${r.length} live repositories`; })
      .catch(() => { chip.className = 'chip-live bad'; chip.innerHTML = `<i></i>GitHub unreachable`; });

    $('btnStart').addEventListener('click', () => WM.launch(AppProjects));
    $('btnJourney').addEventListener('click', () => WM.launch(AppJourney));

    WM.syncDock();

    // Auto-open the projects window once so visitors immediately see the point.
    if (window.innerWidth >= 860) setTimeout(() => WM.launch(AppProjects), 900);
  }

  startParticles();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
