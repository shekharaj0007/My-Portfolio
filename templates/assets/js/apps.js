/* App definitions. Each app renders itself into a window body supplied by WM. */
const U = {
  esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  nfmt: n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : String(n),
  days: iso => Math.floor((Date.now() - new Date(iso)) / 86400000),
  ago(iso) {
    const s = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (s < 60) return 'just now';
    const m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    const d = Math.floor(h / 24); if (d < 30) return d + 'd ago';
    const mo = Math.floor(d / 30); if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  },
  /* Animates a number from 0 to its target once it becomes visible. */
  countUp(el, target, suffix) {
    const dur = 900, t0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },
  reveal(root) {
    const els = root.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, root: root.closest('.win-body') || null });
    els.forEach(e => io.observe(e));
  },
  decodeB64(str) {
    try {
      const bin = atob(str.replace(/\s/g, ''));
      const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) { return ''; }
  },
  freshness(r) {
    const d = U.days(r.pushed_at || r.updated_at);
    if (d <= 14) return ['hot', 'Active'];
    if (d <= 90) return ['warm', 'Recent'];
    return ['cold', 'Archived'];
  },
  staleNote(key) {
    if (!LIVE.isStale(key)) return '';
    const age = LIVE.cacheAge(key);
    const h = age ? Math.round(age / 3600000) : 0;
    return `<div class="stale-note">⚠ Live source unreachable — showing last synced data${h ? ` (${h}h old)` : ''}.</div>`;
  }
};

/* ---------------- Projects ---------------- */
const AppProjects = {
  id: 'projects', icon: '🗂', title: 'Projects', sub: 'Live from GitHub', w: 980, h: 620,
  async render(body) {
    let repos;
    try { repos = await LIVE.repos(); }
    catch (err) {
      body.innerHTML = `<div class="app-error">Could not reach GitHub — ${U.esc(err.message)}.
        <a class="lnk" href="https://github.com/${PROFILE.github}?tab=repositories" target="_blank" rel="noopener">Browse on GitHub ↗</a></div>`;
      return;
    }

    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
    body.innerHTML = `
      <div class="px-toolbar">
        <input class="fld" id="pxq" type="search" placeholder="Search ${repos.length} projects…" autocomplete="off">
        <select class="fld" id="pxlang"><option value="">All languages</option>${langs.map(l => `<option>${U.esc(l)}</option>`).join('')}</select>
        <select class="fld" id="pxsort">
          <option value="updated">Recently pushed</option>
          <option value="created">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="size">Largest</option>
        </select>
        <span class="px-count" id="pxcount"></span>
      </div>
      ${U.staleNote('repos')}
      <div class="px-grid" id="pxgrid"></div>
      <div class="px-detail" id="pxdetail" hidden></div>`;

    const grid = body.querySelector('#pxgrid');
    const detail = body.querySelector('#pxdetail');

    function draw() {
      const q = body.querySelector('#pxq').value.trim().toLowerCase();
      const lang = body.querySelector('#pxlang').value;
      const sort = body.querySelector('#pxsort').value;

      let list = repos.filter(r => {
        if (lang && r.language !== lang) return false;
        if (!q) return true;
        return (r.name + ' ' + (r.description || '') + ' ' + (r.topics || []).join(' ')).toLowerCase().includes(q);
      });
      const cmp = {
        updated: (a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at),
        created: (a, b) => new Date(b.created_at) - new Date(a.created_at),
        name: (a, b) => a.name.localeCompare(b.name),
        size: (a, b) => b.size - a.size
      };
      list.sort(cmp[sort]);
      body.querySelector('#pxcount').textContent = `${list.length} / ${repos.length}`;

      if (!list.length) { grid.innerHTML = `<div class="px-empty">Nothing matches that filter.</div>`; return; }

      grid.innerHTML = list.map((r, i) => {
        const [cls, label] = U.freshness(r);
        const c = LIVE.color(r.language);
        return `
        <article class="px-card rv" style="--lc:${c};transition-delay:${Math.min(i * 26, 320)}ms" data-repo="${U.esc(r.name)}" tabindex="0">
          <div class="px-card-top">
            <h4>${U.esc(r.name)}</h4>
            <span class="chip chip-${cls}">${label}</span>
          </div>
          <p class="px-desc">${U.esc(r.description || 'No description on GitHub yet.')}</p>
          ${(r.topics || []).length ? `<div class="px-topics">${r.topics.slice(0, 4).map(t => `<span class="topic">${U.esc(t)}</span>`).join('')}</div>` : ''}
          <div class="px-meta">
            ${r.language ? `<span><i class="ldot" style="background:${c}"></i>${U.esc(r.language)}</span>` : ''}
            <span>★ ${r.stargazers_count}</span>
            <span>${U.nfmt(r.size)} KB</span>
            <span>${U.ago(r.pushed_at || r.updated_at)}</span>
          </div>
          <span class="px-open">Open workspace →</span>
        </article>`;
      }).join('');

      U.reveal(grid);
      grid.querySelectorAll('[data-repo]').forEach(card => {
        const go = () => showDetail(repos.find(r => r.name === card.dataset.repo));
        card.onclick = go;
        card.onkeydown = e => { if (e.key === 'Enter') go(); };
      });
    }

    async function showDetail(r) {
      if (!r) return;
      const c = LIVE.color(r.language);
      detail.hidden = false;
      grid.style.display = 'none';
      body.querySelector('.px-toolbar').style.display = 'none';
      detail.innerHTML = `
        <button class="btn btn-ghost" id="pxback">← All projects</button>
        <div class="px-head" style="--lc:${c}">
          <h3>${U.esc(r.name)}</h3>
          <p>${U.esc(r.description || 'No description on GitHub yet.')}</p>
          <div class="px-head-meta">
            ${r.language ? `<span><i class="ldot" style="background:${c}"></i>${U.esc(r.language)}</span>` : ''}
            <span>★ ${r.stargazers_count} stars</span>
            <span>⑂ ${r.forks_count} forks</span>
            <span>${U.nfmt(r.size)} KB</span>
            <span>Created ${new Date(r.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
            <span>Last push ${U.ago(r.pushed_at || r.updated_at)}</span>
          </div>
          <div class="px-head-actions">
            <a class="btn btn-primary" href="${U.esc(r.html_url)}" target="_blank" rel="noopener">View source ↗</a>
            ${r.homepage ? `<a class="btn" href="${U.esc(r.homepage)}" target="_blank" rel="noopener">Live demo ↗</a>` : ''}
          </div>
        </div>
        <div class="px-split">
          <div class="px-panel"><h5>Language breakdown</h5><div id="pxlangs"><span class="spinner"></span></div></div>
          <div class="px-panel"><h5>README</h5><div id="pxreadme"><span class="spinner"></span></div></div>
        </div>`;
      detail.querySelector('#pxback').onclick = () => {
        detail.hidden = true;
        grid.style.display = '';
        body.querySelector('.px-toolbar').style.display = '';
      };

      LIVE.langs(r.name).then(map => {
        const sum = Object.values(map).reduce((a, b) => a + b, 0);
        const host = detail.querySelector('#pxlangs');
        if (!host) return;
        if (!sum) { host.innerHTML = '<p class="muted">No language data.</p>'; return; }
        host.innerHTML = `<div class="langbar">${Object.entries(map).sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `<i style="width:${(v / sum * 100).toFixed(2)}%;background:${LIVE.color(k)}" title="${U.esc(k)} ${(v / sum * 100).toFixed(1)}%"></i>`).join('')}</div>
          <ul class="langlist">${Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
            .map(([k, v]) => `<li><i class="ldot" style="background:${LIVE.color(k)}"></i>${U.esc(k)}<b>${(v / sum * 100).toFixed(1)}%</b></li>`).join('')}</ul>`;
      }).catch(() => {
        const host = detail.querySelector('#pxlangs');
        if (host) host.innerHTML = '<p class="muted">Language data unavailable.</p>';
      });

      LIVE.readme(r.name).then(res => {
        const host = detail.querySelector('#pxreadme');
        if (!host) return;
        const text = U.decodeB64(res.content || '');
        if (!text.trim()) { host.innerHTML = '<p class="muted">This repository has no README yet.</p>'; return; }
        const plain = text
          .replace(/```[\s\S]*?```/g, '')
          .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
          .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
          .replace(/^#{1,6}\s*/gm, '')
          .replace(/[*_`>|-]/g, ' ')
          .replace(/\n{2,}/g, '\n')
          .split('\n').map(l => l.trim()).filter(Boolean).slice(0, 14);
        host.innerHTML = `<div class="readme">${plain.map(l => `<p>${U.esc(l)}</p>`).join('')}</div>
          <a class="lnk" href="${U.esc(r.html_url)}#readme" target="_blank" rel="noopener">Read full README ↗</a>`;
      }).catch(() => {
        const host = detail.querySelector('#pxreadme');
        if (host) host.innerHTML = '<p class="muted">No README available.</p>';
      });
    }

    ['pxq', 'pxlang', 'pxsort'].forEach(id => body.querySelector('#' + id).addEventListener('input', draw));
    draw();
  }
};

/* ---------------- Journey ---------------- */
const AppJourney = {
  id: 'journey', icon: '🧭', title: 'The Journey', sub: '2019 → today', w: 780, h: 600,
  async render(body) {
    body.innerHTML = `
      <div class="jr-intro rv in">
        <h3>From Olympiad problems to shipping AI platforms</h3>
        <p>${U.esc(PROFILE.tagline)} Scroll to walk through how I got here.</p>
      </div>
      <div class="jr-line">
        ${JOURNEY.map((s, i) => `
          <div class="jr-item rv" style="transition-delay:${i * 60}ms">
            <div class="jr-node"><span></span></div>
            <div class="jr-card">
              <div class="jr-top"><span class="jr-year">${U.esc(s.year)}</span><span class="jr-tag t-${s.tag.toLowerCase()}">${U.esc(s.tag)}</span></div>
              <h4>${U.esc(s.title)}</h4>
              <p>${U.esc(s.body)}</p>
            </div>
          </div>`).join('')}
      </div>
      <div class="jr-now rv">
        <h4>Where it stands today</h4>
        <div class="jr-stats" id="jrstats"><span class="spinner"></span></div>
      </div>`;
    U.reveal(body);

    try {
      const [repos, c] = await Promise.all([LIVE.repos(), LIVE.contrib().catch(() => null)]);
      const host = body.querySelector('#jrstats');
      if (!host) return;
      const langs = new Set(repos.map(r => r.language).filter(Boolean)).size;
      const cells = [
        ['Repositories shipped', repos.length],
        ['Languages used', langs],
        ['Contributions (12mo)', c && c.total ? c.total.lastYear : 0],
        ['Years at IIT Patna', new Date().getFullYear() - 2023]
      ];
      host.className = 'jr-stats';
      host.innerHTML = cells.map(([l, v]) => `<div class="jr-stat"><b data-n="${v}">0</b><span>${l}</span></div>`).join('');
      host.querySelectorAll('b').forEach(el => U.countUp(el, +el.dataset.n));
    } catch (e) {
      const host = body.querySelector('#jrstats');
      if (host) host.innerHTML = '<p class="muted">Live stats unavailable right now.</p>';
    }
  }
};

/* ---------------- Skills ---------------- */
const AppSkills = {
  id: 'skills', icon: '🧩', title: 'Skills', sub: 'Toolbox', w: 760, h: 560,
  async render(body) {
    body.innerHTML = `
      <p class="app-lead">Grouped by what I actually reach for. The bar shows how much of my public code leans on each area.</p>
      <div class="sk-groups">
        ${SKILLS.map((g, i) => `
          <section class="sk-group rv" style="transition-delay:${i * 70}ms">
            <header><span class="sk-ico">${g.icon}</span><h4>${U.esc(g.group)}</h4><span class="sk-n">${g.items.length}</span></header>
            <div class="sk-items">${g.items.map(s => `<span class="sk">${U.esc(s)}</span>`).join('')}</div>
          </section>`).join('')}
      </div>
      <section class="sk-live">
        <h4>Measured from my live repositories</h4>
        <div id="sklive"><span class="spinner"></span></div>
      </section>`;
    U.reveal(body);

    try {
      const repos = await LIVE.repos();
      const totals = await LIVE.langTotals(repos);
      const sum = Object.values(totals).reduce((a, b) => a + b, 0);
      const host = body.querySelector('#sklive');
      if (!host) return;
      if (!sum) { host.innerHTML = '<p class="muted">No language data available.</p>'; return; }
      host.innerHTML = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => {
        const pct = (v / sum * 100);
        return `<div class="sk-bar">
          <div class="sk-bar-top"><span>${U.esc(k)}</span><b>${pct.toFixed(1)}%</b></div>
          <div class="track"><i style="background:${LIVE.color(k)}" data-w="${pct.toFixed(2)}%"></i></div>
        </div>`;
      }).join('');
      requestAnimationFrame(() => host.querySelectorAll('.track i').forEach(el => { el.style.width = el.dataset.w; }));
    } catch (e) {
      const host = body.querySelector('#sklive');
      if (host) host.innerHTML = '<p class="muted">Live language data unavailable.</p>';
    }
  }
};

/* ---------------- Analytics ---------------- */
const AppStats = {
  id: 'stats', icon: '📈', title: 'Analytics', sub: 'Live metrics', w: 900, h: 620,
  async render(body) {
    body.innerHTML = `
      <div class="st-kpis" id="stkpi"></div>
      <section class="st-panel"><h4>Contribution activity — last 12 months</h4><div id="stheat"><span class="spinner"></span></div></section>
      <div class="st-row">
        <section class="st-panel"><h4>Tech stack by code volume</h4><div id="stlang"><span class="spinner"></span></div></section>
        <section class="st-panel"><h4>LeetCode</h4><div id="stleet"><span class="spinner"></span></div></section>
      </div>
      <section class="st-panel"><h4>Recent GitHub activity</h4><div id="stfeed"><span class="spinner"></span></div></section>`;

    let repos = [];
    try { repos = await LIVE.repos(); } catch (e) {}

    const kpiHost = body.querySelector('#stkpi');
    const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const active = repos.filter(r => U.days(r.pushed_at || r.updated_at) <= 30).length;
    const kb = repos.reduce((s, r) => s + (r.size || 0), 0);
    kpiHost.innerHTML = [
      ['Repositories', repos.length, `${active} pushed this month`],
      ['Stars + forks', stars + repos.reduce((s, r) => s + r.forks_count, 0), 'across all repos'],
      ['Code shipped', Math.round(kb / 1024), 'megabytes (MB)'],
      ['Languages', new Set(repos.map(r => r.language).filter(Boolean)).size, 'in active use']
    ].map(([l, v, s]) => `<div class="st-kpi"><span class="k">${l}</span><b data-n="${v}">0</b><span class="s">${s}</span></div>`).join('');
    kpiHost.querySelectorAll('b').forEach(el => U.countUp(el, +el.dataset.n));

    LIVE.contrib().then(c => {
      const host = body.querySelector('#stheat');
      if (!host) return;
      const days = (c.contributions || []).slice(-364);
      if (!days.length) { host.innerHTML = '<p class="muted">No contribution data.</p>'; return; }
      const max = Math.max(...days.map(d => d.count), 1);
      const lvl = n => n === 0 ? 0 : n >= max * .6 ? 4 : n >= max * .35 ? 3 : n >= max * .15 ? 2 : 1;
      const cols = [];
      for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));
      host.innerHTML = `
        <div class="heat-scroll"><div class="heat">
          ${cols.map(col => `<div class="hcol">${col.map(d =>
            `<i class="hc l${lvl(d.count)}" title="${d.count} on ${d.date}"></i>`).join('')}</div>`).join('')}
        </div></div>
        <div class="heat-foot"><b>${c.total ? c.total.lastYear : 0} contributions</b>
          <span>Less</span><i class="hc"></i><i class="hc l1"></i><i class="hc l2"></i><i class="hc l3"></i><i class="hc l4"></i><span>More</span></div>
        ${U.staleNote('contrib')}`;
    }).catch(() => { const h = body.querySelector('#stheat'); if (h) h.innerHTML = '<p class="muted">Contribution data unavailable.</p>'; });

    LIVE.langTotals(repos).then(totals => {
      const host = body.querySelector('#stlang');
      if (!host) return;
      const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
      if (!entries.length) { host.innerHTML = '<p class="muted">No language data.</p>'; return; }
      const sum = entries.reduce((s, [, v]) => s + v, 0);
      const top = entries.slice(0, 7);
      const rest = entries.slice(7).reduce((s, [, v]) => s + v, 0);
      if (rest) top.push(['Other', rest]);
      const R = 58, C = 2 * Math.PI * R;
      let off = 0;
      const rings = top.map(([n, v]) => {
        const frac = v / sum;
        const seg = `<circle cx="72" cy="72" r="${R}" fill="none" stroke="${n === 'Other' ? '#4a5a75' : LIVE.color(n)}"
          stroke-width="19" stroke-dasharray="${(frac * C).toFixed(2)} ${C.toFixed(2)}"
          stroke-dashoffset="${(-off * C).toFixed(2)}" transform="rotate(-90 72 72)"></circle>`;
        off += frac; return seg;
      }).join('');
      host.innerHTML = `<div class="donut-wrap">
        <div class="donut"><svg viewBox="0 0 144 144" width="144" height="144">${rings}</svg>
          <div class="donut-mid"><b>${entries.length}</b><span>langs</span></div></div>
        <ul class="donut-legend">${top.map(([n, v]) =>
          `<li><i style="background:${n === 'Other' ? '#4a5a75' : LIVE.color(n)}"></i>${U.esc(n)}<b>${(v / sum * 100).toFixed(1)}%</b></li>`).join('')}</ul>
      </div>`;
    }).catch(() => { const h = body.querySelector('#stlang'); if (h) h.innerHTML = '<p class="muted">Language data unavailable.</p>'; });

    LIVE.leetcode().then(d => {
      const host = body.querySelector('#stleet');
      if (!host) return;
      if (!d) {
        host.innerHTML = `<p class="muted">All public LeetCode mirrors are rate-limited right now.</p>
          <a class="lnk" href="https://leetcode.com/${PROFILE.leetcode}/" target="_blank" rel="noopener">Open profile ↗</a>`;
        return;
      }
      const rows = [['Easy', d.easy, '#3ddc97'], ['Medium', d.medium, '#ffb84d'], ['Hard', d.hard, '#ff5c7a']];
      const max = Math.max(...rows.map(r => r[1]), 1);
      host.innerHTML = `
        <div class="lc-wrap">
          <div class="lc-total"><b data-n="${d.total}">0</b><span>solved</span>
            ${d.rate != null ? `<em>${d.rate.toFixed(1)}% acceptance</em>` : ''}</div>
          <div class="lc-bars">${rows.map(([l, v, c]) => `
            <div class="sk-bar"><div class="sk-bar-top"><span>${l}</span><b>${v}</b></div>
            <div class="track"><i style="background:${c}" data-w="${(v / max * 100).toFixed(1)}%"></i></div></div>`).join('')}</div>
        </div>${U.staleNote('leet')}`;
      U.countUp(host.querySelector('.lc-total b'), d.total);
      requestAnimationFrame(() => host.querySelectorAll('.track i').forEach(el => { el.style.width = el.dataset.w; }));
    });

    const EV = {
      PushEvent: ['⬆', e => `Pushed ${(e.payload.commits || []).length} commit(s) to`],
      CreateEvent: ['✦', e => `Created ${e.payload.ref_type} in`],
      DeleteEvent: ['✕', () => 'Deleted a branch in'],
      WatchEvent: ['★', () => 'Starred'],
      ForkEvent: ['⑂', () => 'Forked'],
      IssuesEvent: ['◉', e => `${e.payload.action} an issue in`],
      PullRequestEvent: ['⇄', e => `${e.payload.action} a pull request in`],
      ReleaseEvent: ['🏷', () => 'Released in']
    };
    LIVE.events().then(list => {
      const host = body.querySelector('#stfeed');
      if (!host) return;
      if (!list.length) { host.innerHTML = '<p class="muted">No recent public activity.</p>'; return; }
      host.innerHTML = `<ul class="feed">${list.slice(0, 12).map(e => {
        const [ic, lab] = EV[e.type] || ['•', () => e.type.replace('Event', '')];
        const nm = e.repo.name.split('/')[1] || e.repo.name;
        return `<li><span class="fi">${ic}</span><div><p>${U.esc(lab(e))}
          <a href="https://github.com/${U.esc(e.repo.name)}" target="_blank" rel="noopener">${U.esc(nm)}</a></p>
          <time>${U.ago(e.created_at)}</time></div></li>`;
      }).join('')}</ul>`;
    }).catch(() => { const h = body.querySelector('#stfeed'); if (h) h.innerHTML = '<p class="muted">Activity feed unavailable.</p>'; });
  }
};

/* ---------------- Terminal ---------------- */
const AppTerminal = {
  id: 'terminal', icon: '▮', title: 'Terminal', sub: 'try: help', w: 720, h: 470,
  async render(body) {
    body.innerHTML = `
      <div class="tm">
        <div class="tm-out" id="tmout"></div>
        <div class="tm-in"><span class="tm-ps">raj@portfolio:~$</span><input id="tmi" autocomplete="off" spellcheck="false" aria-label="Terminal input"></div>
      </div>`;
    const out = body.querySelector('#tmout');
    const input = body.querySelector('#tmi');
    const history = [];
    let hi = -1;

    const write = (html, cls) => {
      const div = document.createElement('div');
      div.className = 'tm-line ' + (cls || '');
      div.innerHTML = html;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    };

    const CMDS = {
      help: () => `Available commands:
  <b>whoami</b>      who I am
  <b>projects</b>    list live repositories
  <b>skills</b>      my toolbox
  <b>journey</b>     career timeline
  <b>stats</b>       live GitHub + LeetCode numbers
  <b>contact</b>     how to reach me
  <b>open</b> &lt;app&gt;  launch an app (projects, journey, skills, stats, about, resume, contact)
  <b>github</b>      open my GitHub
  <b>neofetch</b>    system summary
  <b>clear</b>       clear the screen`,
      whoami: () => `${PROFILE.name} — ${PROFILE.role}\n${PROFILE.tagline}`,
      async projects() {
        const repos = await LIVE.repos();
        return repos.slice(0, 15).map(r =>
          `  <b>${U.esc(r.name)}</b>${r.language ? ` <i>[${U.esc(r.language)}]</i>` : ''} — ${U.esc((r.description || 'no description').slice(0, 58))}`
        ).join('\n') + `\n\n${repos.length} repositories total. Type <b>open projects</b> for the full explorer.`;
      },
      skills: () => SKILLS.map(g => `  <b>${g.group}</b>: ${g.items.join(', ')}`).join('\n'),
      journey: () => JOURNEY.map(s => `  <b>${s.year}</b>  ${s.title}`).join('\n'),
      async stats() {
        const repos = await LIVE.repos();
        const lc = await LIVE.leetcode();
        const c = await LIVE.contrib().catch(() => null);
        return `  repositories : ${repos.length}
  languages    : ${new Set(repos.map(r => r.language).filter(Boolean)).size}
  contributions: ${c && c.total ? c.total.lastYear : 'n/a'} (last 12 months)
  leetcode     : ${lc ? `${lc.total} solved (${lc.easy}E / ${lc.medium}M / ${lc.hard}H)` : 'rate-limited'}`;
      },
      contact: () => `  email    : ${PROFILE.email}
  phone    : ${PROFILE.phone}
  github   : github.com/${PROFILE.github}
  leetcode : leetcode.com/${PROFILE.leetcode}`,
      github: () => { window.open(`https://github.com/${PROFILE.github}`, '_blank', 'noopener'); return 'Opening GitHub…'; },
      neofetch: () => `  <b>RajOS</b> 1.0
  host     : ${PROFILE.institute}
  degree   : ${PROFILE.degree}
  uptime   : since 2023
  shell    : portfolio.sh
  cgpa     : ${PROFILE.cgpa}`,
      clear: () => { out.innerHTML = ''; return null; },
      open: arg => {
        const app = APPS.find(a => a.id === (arg || '').toLowerCase());
        if (!app) return `open: unknown app '${U.esc(arg || '')}'. Try: ${APPS.map(a => a.id).join(', ')}`;
        WM.launch(app);
        return `Launching ${app.title}…`;
      }
    };

    async function run(raw) {
      const line = raw.trim();
      write(`<span class="tm-ps">raj@portfolio:~$</span> ${U.esc(line)}`, 'tm-echo');
      if (!line) return;
      history.push(line); hi = history.length;
      const [cmd, ...rest] = line.split(/\s+/);
      const fn = CMDS[cmd.toLowerCase()];
      if (!fn) { write(`command not found: ${U.esc(cmd)} — type <b>help</b>`, 'tm-err'); return; }
      try {
        const res = await fn(rest.join(' '));
        if (res != null) write(String(res).replace(/\n/g, '<br>'));
      } catch (err) { write(`error: ${U.esc(err.message)}`, 'tm-err'); }
    }

    write(`<b>RajOS terminal</b> — type <b>help</b> to see what I can do.`, 'tm-hint');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { run(input.value); input.value = ''; }
      else if (e.key === 'ArrowUp') { if (hi > 0) { hi--; input.value = history[hi] || ''; } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hi < history.length - 1) { hi++; input.value = history[hi] || ''; } else { hi = history.length; input.value = ''; } e.preventDefault(); }
    });
    body.addEventListener('click', () => input.focus());
    setTimeout(() => input.focus(), 260);
  }
};

/* ---------------- About ---------------- */
const AppAbout = {
  id: 'about', icon: '👤', title: 'About Me', sub: PROFILE.institute, w: 720, h: 560,
  async render(body) {
    body.innerHTML = `
      <div class="ab-head rv in">
        <div class="ab-avatar" id="abav"><img src="https://github.com/${PROFILE.github}.png" alt="${U.esc(PROFILE.name)}"></div>
        <div>
          <h3>${U.esc(PROFILE.name)}</h3>
          <p class="ab-role">${U.esc(PROFILE.role)}</p>
          <p class="ab-bio" id="abbio">${U.esc(PROFILE.tagline)}</p>
        </div>
      </div>
      <section class="ab-sec rv"><h4>Education</h4>
        <ul class="ab-list">${EDUCATION.map(e => `
          <li><div><b>${U.esc(e.level)}</b><span>${U.esc(e.place)}</span></div>
          <div class="ab-right"><b>${U.esc(e.score)}</b><span>${U.esc(e.year)}</span></div></li>`).join('')}</ul></section>
      <section class="ab-sec rv"><h4>Achievements</h4>
        <ul class="ab-cards">${ACHIEVEMENTS.map(a => `
          <li><span class="ab-ico">${a.icon}</span><div><b>${U.esc(a.title)}</b><span>${U.esc(a.detail)}</span></div></li>`).join('')}</ul></section>
      <section class="ab-sec rv"><h4>Positions of Responsibility</h4>
        <ul class="ab-list">${POSITIONS.map(p => `
          <li><div><b>${U.esc(p.role)}</b><span>${U.esc(p.org)}</span></div>
          <div class="ab-right"><span>${U.esc(p.period)}</span></div></li>`).join('')}</ul></section>`;
    U.reveal(body);

    LIVE.user().then(u => {
      const bio = body.querySelector('#abbio');
      if (bio && u.bio) bio.textContent = u.bio;
    }).catch(() => {});
  }
};

/* ---------------- Resume ---------------- */
const AppResume = {
  id: 'resume', icon: '📄', title: 'Résumé', sub: 'resume.jpg', w: 700, h: 640,
  async render(body) {
    body.innerHTML = `
      <div class="rs-bar">
        <button class="btn" id="rszo">− Zoom out</button>
        <button class="btn" id="rszi">+ Zoom in</button>
        <a class="btn btn-primary" href="resume.jpg" target="_blank" rel="noopener">Open full size ↗</a>
      </div>
      <div class="rs-view"><img id="rsimg" src="resume.jpg" alt="Résumé of ${U.esc(PROFILE.name)}"></div>`;
    let scale = 1;
    const img = body.querySelector('#rsimg');
    const apply = () => { img.style.transform = `scale(${scale})`; };
    body.querySelector('#rszi').onclick = () => { scale = Math.min(3, scale + 0.2); apply(); };
    body.querySelector('#rszo').onclick = () => { scale = Math.max(0.4, scale - 0.2); apply(); };
  }
};

/* ---------------- Contact ---------------- */
const AppContact = {
  id: 'contact', icon: '✉', title: 'Contact', sub: 'Let’s talk', w: 620, h: 470,
  async render(body) {
    const links = [
      ['✉', 'Email', PROFILE.email, 'mailto:' + PROFILE.email],
      ['📞', 'Phone', PROFILE.phone, 'tel:' + PROFILE.phone.replace(/[^+\d]/g, '')],
      ['🐙', 'GitHub', 'github.com/' + PROFILE.github, 'https://github.com/' + PROFILE.github],
      ['🧠', 'LeetCode', 'leetcode.com/' + PROFILE.leetcode, 'https://leetcode.com/' + PROFILE.leetcode + '/'],
      ['📊', 'Full analytics dashboard', 'dashboard.html', 'dashboard.html'],
      ['🗄', 'Classic portfolio', 'classic.html', 'classic.html']
    ];
    body.innerHTML = `
      <p class="app-lead">Open to internships and collaborations in AI, machine learning and full-stack engineering.</p>
      <ul class="ct-list">
        ${links.map(([ic, label, val, href], i) => `
          <li class="rv" style="transition-delay:${i * 60}ms">
            <a href="${U.esc(href)}" ${href.startsWith('http') || href.endsWith('.html') ? 'target="_blank" rel="noopener"' : ''}>
              <span class="ct-ico">${ic}</span>
              <div><b>${U.esc(label)}</b><span>${U.esc(val)}</span></div>
              <span class="ct-go">→</span>
            </a>
          </li>`).join('')}
      </ul>`;
    U.reveal(body);
  }
};

const APPS = [AppProjects, AppJourney, AppSkills, AppStats, AppTerminal, AppAbout, AppResume, AppContact];
