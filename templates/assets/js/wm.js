/* Window manager: open/close/focus/minimise/maximise, drag and resize.
   Pointer Events are used throughout so touch and mouse share one code path. */
const WM = (() => {
  const layer = () => document.getElementById('windows');
  const open = new Map();          // appId -> { el, app, min }
  let z = 100;
  let cascade = 0;

  const isCompact = () => window.innerWidth < 860;

  function focus(id) {
    const w = open.get(id);
    if (!w) return;
    z += 1;
    w.el.style.zIndex = z;
    document.querySelectorAll('.win').forEach(el => el.classList.remove('is-active'));
    w.el.classList.add('is-active');
    syncDock();
  }

  function launch(app) {
    if (open.has(app.id)) {
      const w = open.get(app.id);
      if (w.min) restore(app.id); else focus(app.id);
      return;
    }

    const el = document.createElement('section');
    el.className = 'win is-opening';
    el.dataset.app = app.id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', app.title);
    el.innerHTML = `
      <header class="win-bar">
        <div class="win-dots">
          <button class="wd wd-close" title="Close" aria-label="Close"></button>
          <button class="wd wd-min" title="Minimise" aria-label="Minimise"></button>
          <button class="wd wd-max" title="Maximise" aria-label="Maximise"></button>
        </div>
        <div class="win-title"><span class="win-ico">${app.icon}</span>${app.title}</div>
        <div class="win-sub">${app.sub || ''}</div>
      </header>
      <div class="win-body"><div class="app-loading"><span class="spinner"></span>Loading ${app.title.toLowerCase()}…</div></div>
      <div class="win-grip" aria-hidden="true"></div>`;

    // Cascade new windows so they never land exactly on top of each other.
    const w = app.w || 760, h = app.h || 520;
    const maxX = Math.max(12, window.innerWidth - w - 24);
    const maxY = Math.max(64, window.innerHeight - h - 130);
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.left = Math.min(60 + cascade * 34, maxX) + 'px';
    el.style.top = Math.min(78 + cascade * 28, maxY) + 'px';
    cascade = (cascade + 1) % 6;

    layer().appendChild(el);
    open.set(app.id, { el, app, min: false });
    if (isCompact()) el.classList.add('is-max');

    el.querySelector('.wd-close').onclick = e => { e.stopPropagation(); close(app.id); };
    el.querySelector('.wd-min').onclick   = e => { e.stopPropagation(); minimise(app.id); };
    el.querySelector('.wd-max').onclick   = e => { e.stopPropagation(); toggleMax(app.id); };
    el.querySelector('.win-bar').addEventListener('dblclick', () => toggleMax(app.id));
    el.addEventListener('pointerdown', () => focus(app.id));

    dragify(el, el.querySelector('.win-bar'));
    resizify(el, el.querySelector('.win-grip'));
    focus(app.id);
    setTimeout(() => el.classList.remove('is-opening'), 420);

    // Render app content after the open animation starts so it feels instant.
    const body = el.querySelector('.win-body');
    Promise.resolve()
      .then(() => app.render(body, { close: () => close(app.id) }))
      .catch(err => {
        body.innerHTML = `<div class="app-error">Could not load this app — ${err.message}</div>`;
      });

    syncDock();
  }

  function close(id) {
    const w = open.get(id);
    if (!w) return;
    w.el.classList.add('is-closing');
    setTimeout(() => { w.el.remove(); open.delete(id); syncDock(); }, 220);
  }

  function minimise(id) {
    const w = open.get(id);
    if (!w) return;
    w.min = true;
    w.el.classList.add('is-min');
    syncDock();
  }

  function restore(id) {
    const w = open.get(id);
    if (!w) return;
    w.min = false;
    w.el.classList.remove('is-min');
    focus(id);
  }

  function toggleMax(id) {
    const w = open.get(id);
    if (!w) return;
    w.el.classList.toggle('is-max');
    focus(id);
  }

  function dragify(el, handle) {
    let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('.wd')) return;
      if (el.classList.contains('is-max')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      handle.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
    });
    handle.addEventListener('pointermove', e => {
      if (!dragging) return;
      const nx = ox + (e.clientX - sx);
      const ny = oy + (e.clientY - sy);
      // Keep at least part of the title bar reachable on screen.
      el.style.left = Math.min(Math.max(-el.offsetWidth + 120, nx), window.innerWidth - 90) + 'px';
      el.style.top  = Math.min(Math.max(52, ny), window.innerHeight - 80) + 'px';
    });
    const stop = () => { dragging = false; el.classList.remove('is-dragging'); };
    handle.addEventListener('pointerup', stop);
    handle.addEventListener('pointercancel', stop);
  }

  function resizify(el, grip) {
    let sx = 0, sy = 0, sw = 0, sh = 0, active = false;
    grip.addEventListener('pointerdown', e => {
      active = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
      grip.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });
    grip.addEventListener('pointermove', e => {
      if (!active) return;
      el.style.width  = Math.max(360, sw + (e.clientX - sx)) + 'px';
      el.style.height = Math.max(260, sh + (e.clientY - sy)) + 'px';
    });
    const stop = () => { active = false; };
    grip.addEventListener('pointerup', stop);
    grip.addEventListener('pointercancel', stop);
  }

  /* Taskbar entries mirror currently open windows. */
  function syncDock() {
    const bar = document.getElementById('taskbar');
    if (!bar) return;
    if (!open.size) { bar.innerHTML = '<span class="task-empty">No windows open</span>'; return; }
    bar.innerHTML = [...open.values()].map(w => `
      <button class="task ${w.min ? 'is-min' : ''} ${w.el.classList.contains('is-active') ? 'is-active' : ''}"
              data-task="${w.app.id}">
        <span>${w.app.icon}</span>${w.app.title}
      </button>`).join('');
    bar.querySelectorAll('[data-task]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.task;
        const w = open.get(id);
        if (!w) return;
        if (w.min) restore(id);
        else if (w.el.classList.contains('is-active')) minimise(id);
        else focus(id);
      };
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const active = document.querySelector('.win.is-active');
    if (active) close(active.dataset.app);
  });

  return { launch, close, minimise, restore, focus, syncDock, isOpen: id => open.has(id) };
})();
