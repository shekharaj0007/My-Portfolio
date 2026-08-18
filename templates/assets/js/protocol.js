/* RECRUITMENT PROTOCOL — gamified portfolio controller */
(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let REPOS = [];
  let viewerTimer = null;

  /* ---- boot sequence ---- */
  function boot() {
    const logs = [
      'INITIALIZING RECRUITMENT PROTOCOL v3.0',
      'SYNC github.com/' + PROFILE.github + ' ... OK',
      'MAPPING LIVE DEPLOYMENTS ... OK',
      'CANDIDATE DOSSIER READY',
      'AWAITING RECRUITER INPUT'
    ];
    const host = $('bootLog');
    const fill = $('bootFill');
    let i = 0;

    const finish = () => {
      $('boot').classList.add('done');
      setTimeout(() => $('boot').remove(), 900);
    };

    if (reduceMotion) { finish(); return; }

    const tick = () => {
      if (i < logs.length) {
        const p = document.createElement('p');
        p.textContent = '> ' + logs[i];
        host.appendChild(p);
        fill.style.width = ((i + 1) / logs.length * 100) + '%';
        i++;
        setTimeout(tick, i === logs.length ? 400 : 280);
      } else setTimeout(finish, 500);
    };
    setTimeout(tick, 300);
    $('boot').addEventListener('click', finish, { once: true });
    document.addEventListener('keydown', finish, { once: true });
  }

  /* ---- candidate score (gamified but data-driven) ---- */
  function calcScore(repos, lc, contrib) {
    let s = 0;
    s += Math.min(repos.length * 4, 40);
    s += repos.filter(r => liveUrl(r)).length * 3;
    if (lc) s += Math.min(lc.total / 10, 25);
    if (contrib && contrib.total) s += Math.min(contrib.total.lastYear / 5, 20);
    return Math.min(99, Math.round(s));
  }

  function renderScoreRing(score) {
    const R = 54, C = 2 * Math.PI * R;
    const off = C - (score / 100) * C;
    $('scoreRing').innerHTML = `
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="${R}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="8"/>
        <circle cx="60" cy="60" r="${R}" fill="none" stroke="#00ff88" stroke-width="8"
          stroke-dasharray="${C}" stroke-dashoffset="${off}" stroke-linecap="round"
          style="transition:stroke-dashoffset 1.5s cubic-bezier(.22,1,.36,1)"/>
      </svg>
      <div class="val"><b data-n="${score}">0</b><small>CANDIDATE SCORE</small></div>`;
    animateNum($('scoreRing').querySelector('b'), score);
  }

  function animateNum(el, target) {
    if (!el || reduceMotion) { if (el) el.textContent = target; return; }
    const t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / 1200);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---- scroll reveal ---- */
  function reveal() {
    const els = document.querySelectorAll('.deploy-card, .t-node, .arsenal-block, .d-card');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
  }

  /* ---- deploy grid ---- */
  function ago(iso) {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d <= 0) return 'today';
    if (d < 30) return d + 'd';
    if (d < 365) return Math.floor(d / 30) + 'mo';
    return Math.floor(d / 365) + 'y';
  }

  function renderDeploy(repos) {
    REPOS = repos;
    const grid = $('deployGrid');
    const liveCount = repos.filter(r => liveUrl(r)).length;

    $('deployLiveCount').textContent = liveCount + ' systems online';
    $('dossierRepos').textContent = repos.length;
    $('dossierLive').textContent = liveCount;
    $('hudStatus').innerHTML = '<span class="pulse"></span>' + liveCount + ' LIVE SYSTEMS';

    function draw() {
      const q = ($('deploySearch')?.value || '').trim().toLowerCase();
      const lang = $('deployLang')?.value || '';
      let list = repos.filter(r => {
        if (lang && r.language !== lang) return false;
        if (!q) return true;
        return (r.name + ' ' + (r.description || '')).toLowerCase().includes(q);
      });
      list.sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));

      $('deployCount').textContent = list.length + ' / ' + repos.length;

      if (!list.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);font-family:var(--mono);font-size:0.8rem;padding:40px;text-align:center">NO MATCHING SYSTEMS</p>';
        return;
      }

      grid.innerHTML = list.map((r, i) => {
        const url = liveUrl(r);
        const c = LIVE.color(r.language);
        return `
        <article class="deploy-card ${url ? '' : 'no-live'}" data-name="${esc(r.name)}"
                 style="transition-delay:${Math.min(i * 35, 350)}ms" tabindex="0">
          <div class="deploy-top">
            <h3>${esc(r.name)}</h3>
            <span class="live-badge ${url ? '' : 'off'}">${url ? 'LIVE' : 'SOURCE'}</span>
          </div>
          <p class="deploy-desc">${esc(r.description || 'Production system — click to inspect.')}</p>
          <div class="deploy-meta">
            ${r.language ? `<span><i class="lang-dot" style="background:${c}"></i>${esc(r.language)}</span>` : ''}
            <span>UPD ${ago(r.pushed_at || r.updated_at)}</span>
            <span>★ ${r.stargazers_count}</span>
          </div>
          <div class="deploy-action">${url ? '▶ INITIATE LIVE PREVIEW' : '◎ VIEW SOURCE CODE'}</div>
        </article>`;
      }).join('');

      grid.querySelectorAll('.deploy-card').forEach(card => {
        const go = () => {
          const r = repos.find(x => x.name === card.dataset.name);
          if (!r) return;
          const url = liveUrl(r);
          if (url) openViewer(r, url);
          else window.open(r.html_url, '_blank', 'noopener');
        };
        card.addEventListener('click', go);
        card.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
      });
      reveal();
    }

    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
    const sel = $('deployLang');
    langs.forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = l; sel.appendChild(o); });
    ['deploySearch', 'deployLang'].forEach(id => $(id)?.addEventListener('input', draw));
    draw();
  }

  /* ---- fullscreen live viewer ---- */
  function openViewer(repo, url) {
    const v = $('deployViewer');
    $('viewerTitle').textContent = repo.name;
    $('viewerOpen').href = url;
    $('viewerSource').href = repo.html_url;
    $('viewerFrame').style.display = 'none';
    $('viewerLoading').style.display = 'grid';
    $('viewerFallback').classList.remove('show');
    $('viewerFrame').src = '';
    v.classList.add('open');
    document.body.style.overflow = 'hidden';

    clearTimeout(viewerTimer);
    viewerTimer = setTimeout(() => showFallback(repo, url), 12000);

    $('viewerFrame').onload = () => {
      clearTimeout(viewerTimer);
      $('viewerLoading').style.display = 'none';
      $('viewerFrame').style.display = 'block';
    };

    $('viewerFrame').src = url;
  }

  function showFallback(repo, url) {
    $('viewerLoading').style.display = 'none';
    $('viewerFrame').style.display = 'none';
    $('viewerFallback').classList.add('show');
    $('viewerLaunch').href = url;
    $('viewerLaunch').onclick = () => { window.open(url, '_blank', 'noopener'); };
  }

  function closeViewer() {
    $('deployViewer').classList.remove('open');
    document.body.style.overflow = '';
    $('viewerFrame').src = '';
    clearTimeout(viewerTimer);
  }

  /* ---- static sections ---- */
  function renderTimeline() {
    $('timelineTrack').innerHTML = JOURNEY.map((j, i) => `
      <article class="t-node" style="transition-delay:${i * 70}ms">
        <div class="t-phase">PHASE ${j.phase}</div>
        <div class="t-year">${esc(j.year)}</div>
        <div class="t-type">${esc(j.type)}</div>
        <h4>${esc(j.title)}</h4>
        <p>${esc(j.body)}</p>
      </article>`).join('');
  }

  function renderArsenal() {
    $('arsenalGrid').innerHTML = SKILLS.map((s, i) => `
      <div class="arsenal-block" style="transition-delay:${i * 60}ms">
        <div class="arsenal-head"><h4>${esc(s.group)}</h4><span class="tier tier-${s.tier}">TIER ${s.tier}</span></div>
        <div class="arsenal-tags">${s.items.map(t => `<span>${esc(t)}</span>`).join('')}</div>
      </div>`).join('');
  }

  function renderDossier() {
    $('profileImg').src = `https://github.com/${PROFILE.github}.png`;
    $('profileName').textContent = PROFILE.name;
    $('profileSub').textContent = PROFILE.subtitle;
    $('profileBio').textContent = PROFILE.tagline;

    $('eduList').innerHTML = EDUCATION.map(e => `
      <li><div><b>${esc(e.level)}</b><small>${esc(e.place)} · ${esc(e.year)}</small></div>
      <span class="val">${esc(e.score)}</span></li>`).join('');

    $('achList').innerHTML = ACHIEVEMENTS.map(a => `
      <div class="ach-row">
        <span class="ach-tier tier-${a.tier}">${a.tier}</span>
        <div><b>${esc(a.title)}</b><small>${esc(a.detail)}</small></div>
      </div>`).join('');

    $('rolesList').innerHTML = POSITIONS.map(p => `
      <li><div><b>${esc(p.role)}</b><small>${esc(p.org)}</small></div><span class="val">${esc(p.period)}</span></li>`).join('');

    LIVE.user().then(u => { if (u.bio) $('profileBio').textContent = u.bio; }).catch(() => {});
  }

  function renderComms() {
    const items = [
      ['EMAIL', PROFILE.email, 'mailto:' + PROFILE.email],
      ['PHONE', PROFILE.phone, 'tel:' + PROFILE.phone.replace(/[^+\d]/g, '')],
      ['GITHUB', PROFILE.github, 'https://github.com/' + PROFILE.github],
      ['LEETCODE', PROFILE.leetcode, 'https://leetcode.com/' + PROFILE.leetcode + '/']
    ];
    $('commsGrid').innerHTML = items.map(([l, v, h]) => `
      <a class="comm-card" href="${esc(h)}" ${h.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <div><b>${l}</b><span>${esc(v)}</span></div>
      </a>`).join('');
  }

  /* ---- load live data ---- */
  async function sync() {
    try {
      const [repos, lc, contrib] = await Promise.all([
        LIVE.repos(),
        LIVE.leetcode().catch(() => null),
        LIVE.contrib().catch(() => null)
      ]);
      const score = calcScore(repos, lc, contrib);
      renderScoreRing(score);
      $('dossierLeet').textContent = lc ? lc.total : '—';
      $('dossierContrib').textContent = contrib && contrib.total ? contrib.total.lastYear : '—';
      renderDeploy(repos);
    } catch (err) {
      $('deployGrid').innerHTML = `<p style="grid-column:1/-1;color:var(--red);font-family:var(--mono);font-size:0.8rem;padding:40px">
        SYNC FAILED — ${esc(err.message)}. <a href="https://github.com/${PROFILE.github}" style="color:var(--green)">Open GitHub ↗</a></p>`;
      $('hudStatus').innerHTML = '<span class="pulse" style="background:var(--red)"></span>OFFLINE';
    }
  }

  /* ---- init ---- */
  function init() {
    boot();
    renderTimeline();
    renderArsenal();
    renderDossier();
    renderComms();
    reveal();
    sync();

    $('viewerClose').addEventListener('click', closeViewer);
    $('viewerOpen').addEventListener('click', e => { e.preventDefault(); window.open($('viewerOpen').href, '_blank', 'noopener'); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });

    document.querySelectorAll('.hud-links a, .hero-actions a').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
