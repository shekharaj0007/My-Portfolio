/* Project Nexus — main application logic */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let REPOS = [];

  /* ---------- loader ---------- */
  function hideLoader() {
    const el = $('loader');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => el.remove(), 800);
  }

  /* ---------- particle canvas ---------- */
  function initCanvas() {
    const cv = $('bg-canvas');
    if (!cv || reduceMotion) return;
    const ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;

    let w, h, pts = [];
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = innerWidth * dpr;
      h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + 'px';
      cv.style.height = innerHeight + 'px';
      const n = Math.min(Math.round((innerWidth * innerHeight) / 22000), 80);
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * dpr,
        vy: (Math.random() - 0.5) * 0.25 * dpr,
        r: (Math.random() * 1.4 + 0.4) * dpr
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
        ctx.fillStyle = 'rgba(168,85,247,0.45)';
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.hypot(dx, dy);
          const lim = 120 * (devicePixelRatio || 1);
          if (d < lim) {
            ctx.strokeStyle = `rgba(34,211,238,${0.12 * (1 - d / lim)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    addEventListener('resize', resize);
    requestAnimationFrame(draw);
  }

  /* ---------- nav scroll ---------- */
  function initNav() {
    const nav = $('nav');
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal, .proj-card, .j-card, .skill-block, .about-card');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  /* ---------- counter animation ---------- */
  function countUp(el, target, suffix) {
    if (reduceMotion || isNaN(target)) { el.textContent = target + (suffix || ''); return; }
    const dur = 1200, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- stats ---------- */
  async function loadStats() {
    const badge = $('liveBadge');
    try {
      const [repos, contrib, lc] = await Promise.all([
        LIVE.repos(),
        LIVE.contrib().catch(() => null),
        LIVE.leetcode().catch(() => null)
      ]);
      REPOS = repos;
      badge.className = 'live-badge';
      badge.innerHTML = '<span class="dot"></span>' + repos.length + ' live projects';

      const langs = new Set(repos.map(r => r.language).filter(Boolean)).size;
      const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
      const active = repos.filter(r => {
        const d = Math.floor((Date.now() - new Date(r.pushed_at || r.updated_at)) / 86400000);
        return d <= 30;
      }).length;

      const cells = [
        ['statRepos', repos.length, ''],
        ['statLangs', langs, ''],
        ['statContrib', contrib && contrib.total ? contrib.total.lastYear : '—', ''],
        ['statActive', active, ''],
        ['statLeet', lc ? lc.total : '—', '']
      ];
      cells.forEach(([id, val, sfx]) => {
        const el = $(id);
        if (!el) return;
        if (typeof val === 'number') countUp(el, val, sfx);
        else el.textContent = val;
      });

      renderProjects(repos);
      renderLeetcode(lc);
    } catch (err) {
      badge.className = 'live-badge err';
      badge.innerHTML = '<span class="dot"></span>offline';
      $('projGrid').innerHTML = `<div class="proj-card" style="grid-column:1/-1;text-align:center;padding:48px;">
        <p style="color:var(--muted);margin-bottom:16px">Could not reach GitHub — ${esc(err.message)}</p>
        <a class="btn btn-primary" href="https://github.com/${PROFILE.github}?tab=repositories" target="_blank" rel="noopener">Browse on GitHub ↗</a>
      </div>`;
    }
  }

  /* ---------- projects ---------- */
  function freshness(r) {
    const d = Math.floor((Date.now() - new Date(r.pushed_at || r.updated_at)) / 86400000);
    if (d <= 14) return ['hot', 'Active'];
    if (d <= 90) return ['warm', 'Recent'];
    return ['cold', 'Archived'];
  }

  function ago(iso) {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return d + 'd ago';
    if (d < 365) return Math.floor(d / 30) + 'mo ago';
    return Math.floor(d / 365) + 'y ago';
  }

  function renderProjects(repos) {
    const grid = $('projGrid');
    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
    const langSel = $('projLang');
    if (langSel && langSel.options.length <= 1) {
      langs.forEach(l => {
        const o = document.createElement('option');
        o.value = l; o.textContent = l;
        langSel.appendChild(o);
      });
    }

    function draw() {
      const q = ($('projSearch')?.value || '').trim().toLowerCase();
      const lang = $('projLang')?.value || '';
      const sort = $('projSort')?.value || 'updated';

      let list = repos.filter(r => {
        if (lang && r.language !== lang) return false;
        if (!q) return true;
        return (r.name + ' ' + (r.description || '') + ' ' + (r.topics || []).join(' ')).toLowerCase().includes(q);
      });

      const sorters = {
        updated: (a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at),
        created: (a, b) => new Date(b.created_at) - new Date(a.created_at),
        name: (a, b) => a.name.localeCompare(b.name),
        size: (a, b) => b.size - a.size
      };
      list.sort(sorters[sort] || sorters.updated);

      $('projCount').textContent = `${list.length} of ${repos.length} projects`;

      if (!list.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">No projects match your filters.</p>';
        return;
      }

      grid.innerHTML = list.map((r, i) => {
        const [stCls, stLabel] = freshness(r);
        const c = LIVE.color(r.language);
        const featured = i === 0 ? ' featured' : '';
        const delay = Math.min(i * 40, 400);
        return `
        <article class="proj-card${featured}" style="--card-accent:${c};transition-delay:${delay}ms"
                 data-repo="${esc(r.name)}" tabindex="0">
          <span class="status-pill ${stCls}">${stLabel}</span>
          <h3>${esc(r.name)}</h3>
          <p class="desc">${esc(r.description || 'No description on GitHub yet.')}</p>
          <div class="proj-tags">
            ${r.language ? `<span class="proj-tag"><i class="lang-dot" style="background:${c}"></i>${esc(r.language)}</span>` : ''}
            ${(r.topics || []).slice(0, 3).map(t => `<span class="proj-tag">${esc(t)}</span>`).join('')}
          </div>
          <div class="proj-meta">
            <span>★ ${r.stargazers_count}</span>
            <span>⑂ ${r.forks_count}</span>
            <span>${r.size} KB</span>
            <span>${ago(r.pushed_at || r.updated_at)}</span>
          </div>
        </article>`;
      }).join('');

      grid.querySelectorAll('.proj-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
          card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
        });
        const open = () => openModal(repos.find(r => r.name === card.dataset.repo));
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
      });

      initReveal();
    }

    ['projSearch', 'projLang', 'projSort'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', draw);
    });
    draw();
  }

  /* ---------- project modal ---------- */
  function openModal(r) {
    if (!r) return;
    const c = LIVE.color(r.language);
    $('modalTitle').textContent = r.name;
    $('modalDesc').textContent = r.description || 'No description on GitHub yet.';
    $('modalSource').href = r.html_url;
    $('modalDemo').style.display = r.homepage ? '' : 'none';
    if (r.homepage) $('modalDemo').href = r.homepage;
    $('modalOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    $('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---------- leetcode ---------- */
  function renderLeetcode(d) {
    const host = $('lcWidget');
    if (!host) return;
    if (!d) {
      host.innerHTML = `<p style="color:var(--muted);text-align:center;padding:20px">LeetCode stats temporarily unavailable.
        <a href="https://leetcode.com/${PROFILE.leetcode}/" target="_blank" rel="noopener" style="color:var(--violet)">View profile ↗</a></p>`;
      return;
    }
    const max = Math.max(d.easy, d.medium, d.hard, 1);
    const rows = [
      ['Easy', d.easy, '#4ade80'],
      ['Med', d.medium, '#fbbf24'],
      ['Hard', d.hard, '#f87171']
    ];
    host.innerHTML = `
      <div class="lc-big"><b id="lcTotal">0</b><span>problems solved</span>
        ${d.rate != null ? `<small style="display:block;margin-top:8px;color:var(--green);font-weight:600">${d.rate.toFixed(1)}% acceptance</small>` : ''}
      </div>
      <div class="lc-bars">${rows.map(([l, v, col]) => `
        <div class="lc-row"><label>${l}</label>
          <div class="bar"><i style="background:${col}" data-w="${(v / max * 100).toFixed(1)}%"></i></div>
          <span class="val">${v}</span></div>`).join('')}
      </div>`;
    countUp($('lcTotal'), d.total);
    requestAnimationFrame(() => host.querySelectorAll('.bar i').forEach(el => { el.style.width = el.dataset.w; }));
  }

  /* ---------- journey ---------- */
  function renderJourney() {
    const track = $('journeyTrack');
    if (!track) return;
    track.innerHTML = JOURNEY.map((s, i) => `
      <article class="j-card" style="transition-delay:${i * 80}ms">
        <div class="j-year">${esc(s.year)}</div>
        <span class="j-tag">${esc(s.tag)}</span>
        <h4>${esc(s.title)}</h4>
        <p>${esc(s.body)}</p>
      </article>`).join('');
    initReveal();
  }

  /* ---------- skills ---------- */
  function renderSkills() {
    const grid = $('skillsGrid');
    if (!grid) return;
    grid.innerHTML = SKILLS.map((g, i) => `
      <div class="skill-block" style="transition-delay:${i * 60}ms">
        <h4><span>${g.icon}</span>${esc(g.group)}</h4>
        <div class="skill-pills">${g.items.map(s => `<span class="skill-pill">${esc(s)}</span>`).join('')}</div>
      </div>`).join('');
    initReveal();
  }

  /* ---------- about ---------- */
  function renderAbout() {
    $('aboutAvatar').src = `https://github.com/${PROFILE.github}.png`;
    $('aboutAvatar').alt = PROFILE.name;
    $('aboutName').textContent = PROFILE.name;
    $('aboutRole').textContent = PROFILE.role;
    $('aboutBio').textContent = PROFILE.tagline;

    $('eduList').innerHTML = EDUCATION.map(e => `
      <li><div><b>${esc(e.level)}</b><small>${esc(e.place)} · ${esc(e.year)}</small></div>
      <span class="score">${esc(e.score)}</span></li>`).join('');

    $('achList').innerHTML = ACHIEVEMENTS.map(a => `
      <div class="ach-item"><span>${a.icon}</span><div><b>${esc(a.title)}</b><small>${esc(a.detail)}</small></div></div>`).join('');

    $('rolesList').innerHTML = POSITIONS.map(p => `
      <li><div><b>${esc(p.role)}</b><small>${esc(p.org)}</small></div><span class="score">${esc(p.period)}</span></li>`).join('');

    LIVE.user().then(u => { if (u.bio) $('aboutBio').textContent = u.bio; }).catch(() => {});
  }

  /* ---------- contact ---------- */
  function renderContact() {
    const links = [
      ['✉', 'Email', PROFILE.email, 'mailto:' + PROFILE.email],
      ['📞', 'Phone', PROFILE.phone, 'tel:' + PROFILE.phone.replace(/[^+\d]/g, '')],
      ['🐙', 'GitHub', 'github.com/' + PROFILE.github, 'https://github.com/' + PROFILE.github],
      ['🧠', 'LeetCode', PROFILE.leetcode, 'https://leetcode.com/' + PROFILE.leetcode + '/']
    ];
    $('contactGrid').innerHTML = links.map(([ic, label, val, href]) => `
      <a class="contact-card" href="${esc(href)}" ${href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <span class="ico">${ic}</span><div><b>${esc(label)}</b><span>${esc(val)}</span></div>
      </a>`).join('');
  }

  /* ---------- init ---------- */
  function init() {
    initCanvas();
    initNav();
    renderJourney();
    renderSkills();
    renderAbout();
    renderContact();
    initReveal();

    $('modalClose')?.addEventListener('click', closeModal);
    $('modalOverlay')?.addEventListener('click', e => { if (e.target === $('modalOverlay')) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    loadStats().finally(() => setTimeout(hideLoader, reduceMotion ? 0 : 600));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
