#!/usr/bin/env node
/**
 * v38: rich offline narrator anti-repeat + key UX.
 * 40+ everyday inputs per genre; score repetition/coherence; shots.
 */
import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = '/workspace/isekai-game-shots';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT).filter(x => /^v38-/.test(x))) fs.unlinkSync(path.join(OUT, f));
const PORT = 8798;
const VER = '38';

const INPUTS = [
  'hallo', 'hi', 'guten tag', 'wer bist du', 'wie heißt du',
  'erzähl mir von dir', 'was ist dein ziel', 'warum bist du hier',
  'was ist hier los', 'wo bin ich', 'was kannst du mir über diesen ort sagen',
  'umsehen', 'warte', 'ich ruhe mich aus', 'ich habe hunger',
  'was kosten die preise', 'welche wege gibt es', 'erzähl mir von deiner vergangenheit',
  'was brauchst du', 'kennst du mich noch', 'danke', 'entschuldigung',
  'hilf mir', 'zeig mir den ausgang', 'bleib hier', 'komm mit',
  'was denkst du über mich', 'erzähl eine geschichte', 'wie spät ist es',
  'ich kaufe brot', 'ich trainiere', 'ich warte auf dich',
  'wer ist das', 'sprich mit mir', 'was ist dein name',
  'erzähl mehr', 'noch eine frage: was treibt dich an',
  'schau dich um', 'geh nicht weg', 'lass uns reden',
  'was ist passiert', 'wie komme ich hier weg', 'gibt es gefahr',
  'erzähl von deiner wunde', 'was fehlt dir',
];

const GENRES = ['fantasy', 'zombie', 'cyberpunk'];

function serve() {
  return new Promise(res => {
    const server = http.createServer((req, res2) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p === '/') p = '/index.html';
      const fp = path.join(ROOT, p.replace(/^\//, ''));
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
        res2.writeHead(404); res2.end('404'); return;
      }
      const ext = path.extname(fp);
      const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.ogg': 'audio/ogg', '.woff2': 'font/woff2' };
      res2.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      fs.createReadStream(fp).pipe(res2);
    });
    server.listen(PORT, () => res(server));
  });
}
async function shot(page, name) {
  const dest = path.join(OUT, `v38-${name}.png`);
  await page.screenshot({ path: dest, type: 'png' });
  console.log('shot', name, fs.statSync(dest).size);
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function scoreTexts(texts) {
  const norms = texts.map(t => String(t || '').replace(/\s+/g, ' ').trim());
  const heads = norms.map(t => t.slice(0, 96));
  const exact = new Map();
  const head = new Map();
  for (const t of norms) exact.set(t, (exact.get(t) || 0) + 1);
  for (const h of heads) head.set(h, (head.get(h) || 0) + 1);
  const exactDupes = [...exact.values()].filter(n => n > 1).reduce((a, b) => a + (b - 1), 0);
  const headDupes = [...head.values()].filter(n => n > 1).reduce((a, b) => a + (b - 1), 0);
  const uniqueExact = exact.size;
  const avgLen = norms.reduce((a, t) => a + t.length, 0) / Math.max(1, norms.length);
  const short = norms.filter(t => t.length < 80).length;
  const multiSent = norms.filter(t => (t.match(/[.!?]/g) || []).length >= 3).length;
  const hasReveal = norms.filter(t => /Reveal|Stufe|erinnert|Gelebtes|will /i.test(t)).length;
  const hasDialogue = norms.filter(t => /[„"]/.test(t)).length;
  return {
    n: norms.length,
    uniqueExact,
    exactDupes,
    headDupes,
    uniqueRatio: +(uniqueExact / Math.max(1, norms.length)).toFixed(3),
    avgLen: Math.round(avgLen),
    short,
    multiSent,
    multiSentRatio: +(multiSent / Math.max(1, norms.length)).toFixed(3),
    hasReveal,
    hasDialogue,
    coherence: +(
      (multiSent / Math.max(1, norms.length)) * 0.45 +
      (hasDialogue / Math.max(1, norms.length)) * 0.25 +
      (hasReveal / Math.max(1, norms.length)) * 0.15 +
      Math.min(1, avgLen / 220) * 0.15
    ).toFixed(3),
  };
}

async function boot(page, genre) {
  await page.goto(`http://127.0.0.1:${PORT}/?v=${VER}&pt=1`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '38', { timeout: 20000 });
  await page.evaluate(() => { try { localStorage.clear(); } catch (_) {} });
  return page.evaluate(async (g) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    await G.startProcedural?.(g, 'Alex');
    if (G.S && !G.S.setup?.done) { G.S.setup = G.S.setup || {}; G.S.setup.done = true; }
    try { G.S.flags = G.S.flags || {}; G.S.flags.onboarded = true; } catch (_) {}
    try { G.enterPlay?.(); } catch (_) {}
    const keys = Object.keys(G.S?.world?.npcs || {});
    if (keys.length && G.S.world.scene) G.S.world.scene.anwesend = keys.slice(0, 3);
    // seed lived memory for richer replies
    try {
      const who = keys[0];
      if (who) {
        G.addMemory?.(who, `Begegnung: Gruß in ${G.S.world.scene.ort}.`, 'life');
        G.addMemory?.(who, `Leben: Gespräch über den Ort.`, 'life');
        const n = G.S.world.npcs[who];
        if (n) { n.revealTier = 1; n.backstory = n.backstory || 'Kam von weit her und blieb, weil etwas fehlte.'; n.ziel = n.ziel || 'Überleben und einen sicheren Ort finden'; n.wound = n.wound || 'Ein alter Verlust'; n.speechStyle = n.speechStyle || 'knapp, ehrlich'; }
      }
    } catch (_) {}
    return { ver: G.VER, genre: G.S?.genre, ort: G.S?.world?.scene?.ort, npcs: keys.slice(0, 4) };
  }, genre);
}

async function runGenre(page, genre) {
  const bootInfo = await boot(page, genre);
  const results = await page.evaluate(async (inputs) => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline' });
    const out = [];
    for (const a of inputs) {
      const r = G.offline?.(a);
      out.push({ a, text: String(r?.text || ''), intent: r?._intent || '' });
    }
    const recent = G.S?._offlineRecent || {};
    const outs = G.S?._offlineOut || [];
    // settings UI check
    let settings = {};
    try {
      document.getElementById('btnSettings')?.click?.();
      await new Promise(r => setTimeout(r, 80));
      G.updateNarratorDot?.();
      // openSheet is bound; call via click already
      settings = {
        hasGkey: !!document.getElementById('gkey'),
        hasPollen: !!document.getElementById('pollenKey'),
        hasNarrLabel: !!document.getElementById('narrLabel'),
        narrLabel: document.getElementById('narrLabel')?.textContent || '',
        narrMode: document.getElementById('narrDot')?.dataset?.mode || '',
        help: !!document.querySelector('#geminiBox .narr-help, #geminiBox .small a'),
        geminiLink: [...document.querySelectorAll('#geminiBox a')].map(a => a.href),
        modeDefault: document.getElementById('mode')?.value || '',
      };
      document.getElementById('btnClose')?.click?.();
    } catch (e) { settings = { err: String(e) }; }
    return { out, recentBuckets: Object.keys(recent), recentSizes: Object.fromEntries(Object.entries(recent).map(([k, v]) => [k, (v || []).length])), trackedOuts: outs.length, settings, narratorMode: G.S?._narratorMode };
  }, INPUTS);
  return { bootInfo, ...results };
}

(async () => {
  const server = await serve();
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
  });
  const page = await browser.newPage();
  const report = { ver: VER, genres: {}, inputsPerGenre: INPUTS.length };
  let worstRep = 0;

  for (const genre of GENRES) {
    console.log('===', genre, '===');
    const r = await runGenre(page, genre);
    const texts = r.out.map(x => x.text);
    const score = scoreTexts(texts);
    // sentence variety: unique opening 40 chars
    const opens = texts.map(t => t.slice(0, 40));
    const openDupes = opens.length - new Set(opens).size;
    score.openDupes = openDupes;
    report.genres[genre] = {
      boot: r.bootInfo,
      score,
      settings: r.settings,
      sample: r.out.slice(0, 3).map(x => ({ a: x.a, t: x.text.slice(0, 160) })),
      trackedOuts: r.trackedOuts,
      recentSizes: r.recentSizes,
    };
    worstRep = Math.max(worstRep, score.exactDupes, score.headDupes);
    console.log(genre, 'n=', score.n, 'unique=', score.uniqueExact, 'exactDupes=', score.exactDupes, 'headDupes=', score.headDupes, 'coh=', score.coherence, 'avgLen=', score.avgLen);
    await shot(page, `${genre}-play`);
  }

  // Settings shot (fantasy session still open)
  await page.evaluate(() => {
    const G = window.__game;
    window.__setCfg?.({ mode: 'offline', gkey: '', pollenKey: '' });
    if (G.S) G.S._narratorMode = 'offline';
    document.getElementById('btnSettings')?.click?.();
  });
  await sleep(200);
  await shot(page, 'settings-offline');

  // Desktop viewport
  await page.setViewport({ width: 1280, height: 800, isMobile: false, hasTouch: false });
  await page.evaluate(() => {
    document.getElementById('btnSettings')?.click?.();
  });
  await sleep(150);
  await shot(page, 'settings-desktop');
  await page.evaluate(() => document.getElementById('btnClose')?.click?.());
  await shot(page, 'fantasy-desktop');

  // Key fields present without real keys
  const keyUx = await page.evaluate(() => {
    document.getElementById('btnSettings')?.click?.();
    const g = document.getElementById('gkey');
    const p = document.getElementById('pollenKey');
    return {
      placeholders: [g?.placeholder, p?.placeholder],
      type: [g?.type, p?.type],
      links: [...document.querySelectorAll('#geminiBox a, #keyGate a')].map(a => a.getAttribute('href')),
      label: document.getElementById('narrLabel')?.textContent,
      // ensure no real key leaked in DOM defaults
      gVal: g?.value || '',
      pVal: p?.value || '',
    };
  });
  report.keyUx = keyUx;
  report.pass = {
    inputsOk: GENRES.every(g => report.genres[g].score.n >= 40),
    lowExactDupes: GENRES.every(g => report.genres[g].score.exactDupes <= 2),
    lowHeadDupes: GENRES.every(g => report.genres[g].score.headDupes <= 4),
    coherence: GENRES.every(g => report.genres[g].score.coherence >= 0.45),
    multiSent: GENRES.every(g => report.genres[g].score.multiSentRatio >= 0.7),
    settingsKeys: !!(keyUx.placeholders?.[0] && keyUx.placeholders?.[1]),
    noKeyLeak: keyUx.gVal === '' && keyUx.pVal === '',
    narrLabel: /Offline|Gemini|Pollinations/i.test(keyUx.label || ''),
  };
  report.ok = Object.values(report.pass).every(Boolean);

  fs.writeFileSync(path.join(OUT, 'v38-playtest.json'), JSON.stringify(report, null, 2));
  console.log('PASS', report.pass, 'ok=', report.ok);
  await browser.close();
  server.close();
  if (!report.ok) process.exit(2);
})().catch(e => { console.error(e); process.exit(1); });
