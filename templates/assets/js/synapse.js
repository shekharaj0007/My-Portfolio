(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---- nav scroll ---- */
  const nav = $('nav');
  addEventListener('scroll', () => nav.classList.toggle('solid', scrollY > 60), { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ---- reveal ---- */
  function reveal() {
    const els = document.querySelectorAll('.ml-layer, .proj-flip, .bento-card, .j-chip, .skill-col');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
  }

  /* ---- ML stack accordion ---- */
  function renderML() {
    $('mlStack').innerHTML = ML_STACK.map((layer, i) => `
      <article class="ml-layer" style="--layer-color:${layer.color};transition-delay:${i * 50}ms">
        <div class="ml-head" role="button" tabindex="0" aria-expanded="false">
          <span class="ml-step">${layer.step}</span>
          <div class="ml-head-text">
            <h3>${esc(layer.title)}</h3>
            <p>${esc(layer.summary)}</p>
          </div>
          <span class="ml-toggle">+</span>
        </div>
        <div class="ml-body">
          <p class="ml-detail">${esc(layer.detail)}</p>
          <div class="ml-groups">
            ${(layer.groups || []).map(g => `
              <div class="ml-group">
                <h5>${esc(g.label)}</h5>
                <div class="ml-topics">
                  ${g.items.map(t => `<span>${esc(t)}</span>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
      </article>`).join('');

    $('mlStack').querySelectorAll('.ml-head').forEach(head => {
      const toggle = () => {
        const layer = head.closest('.ml-layer');
        const open = layer.classList.toggle('open');
        head.setAttribute('aria-expanded', open);
        if (open) {
          $('mlStack').querySelectorAll('.ml-layer.open').forEach(other => {
            if (other !== layer) {
              other.classList.remove('open');
              other.querySelector('.ml-head').setAttribute('aria-expanded', 'false');
            }
          });
        }
      };
      head.addEventListener('click', toggle);
      head.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    });

    const first = $('mlStack').querySelector('.ml-layer');
    if (first) { first.classList.add('open'); first.querySelector('.ml-head').setAttribute('aria-expanded', 'true'); }
  }

  /* ---- skills ---- */
  function renderSkills() {
    $('skillsRow').innerHTML = SKILLS.map((g, i) => `
      <div class="skill-col" style="transition-delay:${i * 40}ms">
        <h4>${esc(g.group)}</h4>
        <div>${g.items.map(s => `<span>${esc(s)}</span>`).join('')}</div>
      </div>`).join('');
  }

  /* ---- journey ---- */
  function renderJourney() {
    $('journeyRow').innerHTML = JOURNEY.map((j, i) => `
      <article class="j-chip" style="transition-delay:${i * 50}ms">
        <div class="yr">${esc(j.year)}</div>
        <h4>${esc(j.title)}</h4>
        <p>${esc(j.body)}</p>
      </article>`).join('');
  }

  /* ---- resume sidebar ---- */
  function renderResume() {
    const img = $('resumeImg');
    if (img) img.src = `https://github.com/${PROFILE.github}.png`;
    const hl = $('resumeHighlights');
    if (hl && typeof RESUME_HIGHLIGHTS !== 'undefined') {
      hl.innerHTML = RESUME_HIGHLIGHTS.map(h => `
        <div class="resume-stat">
          <b>${esc(h.value)}</b>
          <span>${esc(h.label)}</span>
        </div>`).join('');
    }
  }

  /* ---- about ---- */
  function renderAbout() {
    $('aboutName').textContent = PROFILE.name;
    $('aboutSub').textContent = PROFILE.subtitle;
    $('aboutBio').textContent = PROFILE.tagline;
    $('aboutImg').src = `https://github.com/${PROFILE.github}.png`;

    $('eduList').innerHTML = EDUCATION.map(e => `
      <li><div><b>${esc(e.level)}</b><small>${esc(e.place)} · ${esc(e.year)}</small></div>
      <span class="v">${esc(e.score)}</span></li>`).join('');

    $('achList').innerHTML = ACHIEVEMENTS.map(a => `
      <li><div><b>${esc(a.title)}</b><small>${esc(a.detail)}</small></div></li>`).join('');

    $('rolesList').innerHTML = POSITIONS.map(p => `
      <li><div><b>${esc(p.role)}</b><small>${esc(p.org)}</small></div><span class="v">${esc(p.period)}</span></li>`).join('');

    LIVE.user().then(u => { if (u.bio) $('aboutBio').textContent = u.bio; }).catch(() => {});
  }

  /* ---- contact ---- */
  function renderContact() {
    const items = [
      ['Email', PROFILE.email, 'mailto:' + PROFILE.email],
      ['Phone', PROFILE.phone, 'tel:' + PROFILE.phone.replace(/[^+\d]/g, '')],
      ['GitHub', 'github.com/' + PROFILE.github, 'https://github.com/' + PROFILE.github],
      ['LeetCode', PROFILE.leetcode, 'https://leetcode.com/' + PROFILE.leetcode + '/']
    ];
    $('contactRow').innerHTML = items.map(([l, v, h]) => `
      <a class="contact-card" href="${esc(h)}" ${h.startsWith('http') ? 'target="_blank" rel="noopener"' : ''}>
        <b>${l.toUpperCase()}</b><span>${esc(v)}</span>
      </a>`).join('');
  }

  /* ---- projects ---- */
  function ago(iso) {
    const d = Math.floor((Date.now() - new Date(iso)) / 86400000);
    if (d <= 0) return 'today';
    if (d < 30) return d + 'd ago';
    return Math.floor(d / 30) + 'mo ago';
  }

  function openViewer(repo, url) {
    $('viewerTitle').textContent = repo.name;
    $('viewerOpen').href = url;
    $('viewerSource').href = repo.html_url;
    $('viewerLaunch').href = url;
    $('viewerFrame').style.display = 'none';
    $('viewerMsg').classList.remove('show');
    $('viewer').classList.add('open');
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      $('viewerFrame').style.display = 'none';
      $('viewerMsg').classList.add('show');
    }, 10000);

    $('viewerFrame').onload = () => {
      clearTimeout(timer);
      $('viewerFrame').style.display = 'block';
      $('viewerMsg').classList.remove('show');
    };
    $('viewerFrame').src = url;
  }

  function closeViewer() {
    $('viewer').classList.remove('open');
    document.body.style.overflow = '';
    $('viewerFrame').src = '';
  }

  const CARD_ACCENTS = ['#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#34d399', '#22d3ee', '#6366f1', '#fb923c'];

  function renderProjects(repos) {
    const liveN = repos.filter(r => liveUrl(r)).length;
    $('statRepos').textContent = repos.length;
    $('statLive').textContent = liveN;
    $('projLiveLine').textContent = liveN + ' deployed systems online · hover for details · click to preview';

    const langs = [...new Set(repos.map(r => r.language).filter(Boolean))].sort();
    langs.forEach(l => { const o = document.createElement('option'); o.value = l; o.textContent = l; $('projLang').appendChild(o); });

    function draw() {
      const q = ($('projSearch')?.value || '').trim().toLowerCase();
      const lang = $('projLang')?.value || '';
      let list = repos.filter(r => {
        if (lang && r.language !== lang) return false;
        if (!q) return true;
        const meta = projectMeta(r);
        return (r.name + ' ' + (r.description || '') + ' ' + meta.summary + ' ' + meta.stack.join(' ')).toLowerCase().includes(q);
      });
      list.sort((a, b) => new Date(b.pushed_at || b.updated_at) - new Date(a.pushed_at || a.updated_at));
      $('projCount').textContent = list.length + ' / ' + repos.length;

      $('projGrid').innerHTML = list.map((r, i) => {
        const url = liveUrl(r);
        const c = LIVE.color(r.language);
        const meta = projectMeta(r);
        const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
        const idx = String(i + 1).padStart(2, '0');
        return `
        <article class="proj-flip" data-name="${esc(r.name)}"
          style="--card-accent:${accent};--float-delay:${(i % 5) * 0.4}s;transition-delay:${Math.min(i * 40, 400)}ms"
          tabindex="0">
          <div class="proj-flip-inner">
            <div class="proj-front">
              <span class="proj-card-index">${idx}</span>
              <div class="proj-card-top">
                <h3>${esc(r.name)}</h3>
                <span class="live-tag ${url ? '' : 'off'}">${url ? 'LIVE' : 'CODE'}</span>
              </div>
              <p class="proj-hint">${esc((r.description || meta.summary).slice(0, 90))}${(r.description || meta.summary).length > 90 ? '…' : ''}</p>
              <div class="proj-foot">
                ${r.language ? `<span><i class="lang-dot" style="background:${c}"></i>${esc(r.language)}</span>` : ''}
                <span>${ago(r.pushed_at || r.updated_at)}</span>
              </div>
              <span class="flip-hint">Hover to flip</span>
            </div>
            <div class="proj-back">
              <h4>${esc(r.name)}</h4>
              <p>${esc(meta.summary)}</p>
              <div class="proj-tech">
                ${meta.stack.map(t => `<span>${esc(t)}</span>`).join('')}
              </div>
              <span class="launch-cta">${url ? 'Click to preview live →' : 'Click for GitHub →'}</span>
            </div>
          </div>
        </article>`;
      }).join('');

      $('projGrid').querySelectorAll('.proj-flip').forEach(card => {
        let touchReady = false;
        const go = () => {
          const r = repos.find(x => x.name === card.dataset.name);
          const url = liveUrl(r);
          if (url) openViewer(r, url);
          else window.open(r.html_url, '_blank', 'noopener');
        };
        card.addEventListener('click', e => {
          if ('ontouchstart' in window && !touchReady) {
            e.preventDefault();
            card.classList.add('flipped');
            touchReady = true;
            return;
          }
          go();
        });
        card.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        card.addEventListener('mouseleave', () => { touchReady = false; card.classList.remove('flipped'); });
      });
      reveal();
    }

    ['projSearch', 'projLang'].forEach(id => $(id)?.addEventListener('input', draw));
    draw();
  }

  async function sync() {
    try {
      const [repos, lc, contrib] = await Promise.all([
        LIVE.repos(),
        LIVE.leetcode().catch(() => null),
        LIVE.contrib().catch(() => null)
      ]);
      $('statLeet').textContent = lc ? lc.total : '—';
      $('statContrib').textContent = contrib && contrib.total ? contrib.total.lastYear : '—';
      const leetLink = $('leetStatLink');
      if (leetLink) leetLink.href = 'https://leetcode.com/' + PROFILE.leetcode + '/';
      renderProjects(repos);
    } catch (err) {
      $('projGrid').innerHTML = `<p style="color:#f87171;grid-column:1/-1;padding:40px">Could not sync GitHub. <a href="https://github.com/${PROFILE.github}" style="color:#a5b4fc">View profile ↗</a></p>`;
    }
  }

  /* ---- init ---- */
  renderML();
  renderSkills();
  renderJourney();
  renderAbout();
  renderContact();
  renderResume();
  reveal();
  sync();

  $('viewerClose').addEventListener('click', closeViewer);
  $('viewerLaunch').addEventListener('click', e => { e.preventDefault(); window.open($('viewerLaunch').href, '_blank', 'noopener'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeViewer(); });
})();
