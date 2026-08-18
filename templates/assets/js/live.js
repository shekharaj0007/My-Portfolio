/* Live data layer: GitHub + LeetCode.
   Every source is cached in localStorage and falls back to the last successful
   payload when an endpoint is down or rate-limited, so the UI never goes blank. */
const LIVE = (() => {
  const TTL = 15 * 60 * 1000;
  const stale = new Set();

  const LANG_COLORS = {
    Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a', HTML: '#e34c26',
    CSS: '#563d7c', 'Jupyter Notebook': '#DA5B0B', Java: '#b07219', 'C++': '#f34b7d',
    C: '#555555', 'C#': '#178600', Shell: '#89e051', Prolog: '#74283c', Go: '#00ADD8',
    Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
    Dart: '#00B4AB', Vue: '#41b883', SCSS: '#c6538c', Dockerfile: '#384d54', R: '#198CE7',
    MATLAB: '#e16737', TeX: '#3D6117', Makefile: '#427819'
  };

  function readCache(key) {
    try {
      const raw = localStorage.getItem('os:' + key);
      if (!raw) return null;
      const o = JSON.parse(raw);
      const age = Date.now() - o.t;
      return { value: o.v, age, fresh: age < TTL };
    } catch (e) { return null; }
  }

  function writeCache(key, v) {
    try { localStorage.setItem('os:' + key, JSON.stringify({ t: Date.now(), v })); } catch (e) {}
  }

  async function get(url, key, opts) {
    const o = opts || {};
    const cached = key ? readCache(key) : null;
    if (!o.force && cached && cached.fresh) { stale.delete(key); return cached.value; }

    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), o.timeout || 15000);
    try {
      const res = await fetch(url, { signal: ctl.signal, headers: { Accept: 'application/vnd.github+json' } });
      if (!res.ok) {
        throw new Error(res.status === 403 ? 'GitHub hourly limit reached'
          : res.status === 429 ? 'Service rate limit reached'
          : 'HTTP ' + res.status);
      }
      const data = await res.json();
      if (key) { writeCache(key, data); stale.delete(key); }
      return data;
    } catch (err) {
      if (!o.noStale && cached) { stale.add(key); return cached.value; }
      throw err;
    } finally { clearTimeout(timer); }
  }

  /* ---- LeetCode: mirrors differ in shape and rate-limit often ---- */
  function normalizeLeet(d) {
    if (!d || typeof d !== 'object') return null;
    const total = d.solvedProblem != null ? d.solvedProblem : d.totalSolved;
    if (typeof total !== 'number') return null;
    const ac = (d.acSubmissionNum || []).find(x => x.difficulty === 'All');
    const sub = (d.totalSubmissionNum || []).find(x => x.difficulty === 'All');
    let rate = null;
    if (ac && sub && sub.submissions) rate = (ac.submissions / sub.submissions * 100);
    else if (typeof d.acceptanceRate === 'number') rate = d.acceptanceRate;
    return {
      total,
      easy: d.easySolved || 0,
      medium: d.mediumSolved || 0,
      hard: d.hardSolved || 0,
      rate: rate == null ? null : rate,
      ranking: d.ranking || null
    };
  }

  async function leetcode(force) {
    const mirrors = [
      `https://alfa-leetcode-api.onrender.com/${PROFILE.leetcode}/solved`,
      `https://leetcode-stats-api.herokuapp.com/${PROFILE.leetcode}`
    ];
    for (const url of mirrors) {
      try {
        const n = normalizeLeet(await get(url, 'leet', { force, timeout: 45000, noStale: true }));
        if (n) return n;
      } catch (e) { /* try next mirror */ }
    }
    const cached = readCache('leet');
    if (cached) {
      const n = normalizeLeet(cached.value);
      if (n) { stale.add('leet'); return n; }
    }
    return null;
  }

  const user    = force => get(`https://api.github.com/users/${PROFILE.github}`, 'user', { force });
  const repos   = force => get(`https://api.github.com/users/${PROFILE.github}/repos?per_page=100&sort=pushed`, 'repos', { force })
                             .then(list => list.filter(r => !r.fork));
  const events  = force => get(`https://api.github.com/users/${PROFILE.github}/events/public?per_page=30`, 'events', { force });
  const contrib = force => get(`https://github-contributions-api.jogruber.de/v4/${PROFILE.github}?y=last`, 'contrib', { force });
  const readme  = name => get(`https://api.github.com/repos/${PROFILE.github}/${name}/readme`, 'readme:' + name, { timeout: 12000 });
  const langs   = name => get(`https://api.github.com/repos/${PROFILE.github}/${name}/languages`, 'lang:' + name, { timeout: 12000 });

  async function langTotals(list, force) {
    const totals = {};
    const results = await Promise.allSettled(
      list.map(r => get(`https://api.github.com/repos/${PROFILE.github}/${r.name}/languages`, 'lang:' + r.name, { force }))
    );
    results.forEach((res, i) => {
      if (res.status === 'fulfilled' && res.value && typeof res.value === 'object') {
        for (const [k, v] of Object.entries(res.value)) totals[k] = (totals[k] || 0) + v;
      } else if (list[i].language) {
        // Fall back to the primary language weighted by repo size.
        totals[list[i].language] = (totals[list[i].language] || 0) + (list[i].size || 1) * 1024;
      }
    });
    return totals;
  }

  return {
    user, repos, events, contrib, leetcode, readme, langs, langTotals,
    isStale: key => stale.has(key),
    cacheAge: key => { const c = readCache(key); return c ? c.age : null; },
    color: l => LANG_COLORS[l] || '#7d8fb3'
  };
})();
