/**
 * Chapter-1 slice: real buttons, keyboard, timed Satz, save/reload, defeat/retry.
 * No forced win, no teleport as the proof.
 */
export async function runChapterSlice({ browser, port, fail, ok }){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  const notes = [];
  try{
    await page.goto(`http://127.0.0.1:${port}/?v=slice`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
    await page.evaluate(async () => {
      localStorage.clear();
      try{
        const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
        await Promise.all(regs.map(r => r.unregister()));
      }catch(_){}
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
    await page.click('#btnNew');
    await page.waitForFunction(() => document.querySelectorAll('#choices button').length > 0, { timeout: 20000 });
    const coach = await page.$('#btnCoachOk');
    if(coach){
      const vis = await page.evaluate(() => {
        const el = document.getElementById('onboardCoach');
        if(!el) return false;
        const st = getComputedStyle(el);
        return st.display !== 'none' && !el.classList.contains('hidden');
      });
      if(vis) await page.click('#btnCoachOk');
    }
    for(let i=0;i<6;i++){
      const labels = await page.evaluate(() => [...document.querySelectorAll('#choices button')].map(b => b.textContent || ''));
      if(labels.some(t => /Finanzen/i.test(t))) break;
      const hit = labels.find(t => /Augen öffnen|ausreden|anhören|In den Saal/i.test(t));
      if(!hit) break;
      await clickLabel(page, hit);
      await sleep(250);
    }
    const opened = await page.evaluate(() => (document.getElementById('vnText')?.textContent || '') + '|' + [...document.querySelectorAll('#choices button')].map(b=>b.textContent).join(' / '));
    if(!/neun/i.test(opened) && !/Finanzen/i.test(opened)){
      fail('chapter-slice', 'opening did not reach the hall', { opened: opened.slice(0, 240) });
    } else ok('chapter-slice-open', { text: opened.slice(0, 120) });

    for(let i=0;i<8;i++){
      const open = await page.evaluate(() => { const el=document.getElementById('owDlg'); return !!(el && !el.classList.contains('hidden')); });
      if(!open) break;
      await page.keyboard.press('Enter');
      await sleep(120);
    }
    const before = await page.evaluate(() => window.__game?.OW?.__debug?.()?.hero || null);
    await page.keyboard.down('ArrowRight');
    await sleep(450);
    await page.keyboard.up('ArrowRight');
    await page.keyboard.down('ArrowDown');
    await sleep(350);
    await page.keyboard.up('ArrowDown');
    const after = await page.evaluate(() => window.__game?.OW?.__debug?.()?.hero || null);
    if(!before || !after || (after.x === before.x && after.y === before.y)){
      fail('chapter-slice', 'keyboard did not move Noctis', { before, after });
    } else ok('chapter-slice-walk', { before, after });

    await page.keyboard.press('Enter');
    await sleep(400);
    const talked = await page.evaluate(() => (document.getElementById('owDlgText')?.textContent || document.getElementById('vnText')?.textContent || '').slice(0, 160));
    notes.push(talked);

    await clickLabel(page, 'Finanzen');
    await sleep(200);
    await clickLabel(page, 'Edikte');
    await sleep(200);
    const quiet = await page.evaluate(() => (window.__game.S.log || []).map(m => m.t).join('\n'));
    if(!/Neun/i.test(quiet)){
      fail('chapter-slice', 'edict scene did not plant the seal', { quiet: quiet.slice(0, 220) });
    } else ok('chapter-slice-plant', { quiet: quiet.slice(0, 100) });
    await clickLabel(page, 'Katakomben');
    await sleep(200);
    await clickLabel(page, 'Dungeon betreten');
    await sleep(300);
    await clickLabel(page, 'Nächster Raum');
    await sleep(200);
    await clickLabel(page, 'Nächster Raum');
    await sleep(250);
    const puzzle = await page.evaluate(() => (window.__game.S.log || []).map(m => m.t).join('\n'));
    if(!/neun/i.test(puzzle)){
      fail('chapter-slice', 'puzzle room missing the planted answer', { puzzle: puzzle.slice(0, 220) });
    } else ok('chapter-slice-puzzle-text', { puzzle: puzzle.slice(0, 100) });
    await clickLabel(page, '3-7-12');
    await sleep(200);
    const wrong = await page.evaluate(() => document.getElementById('vnText')?.textContent || '');
    if(!/nicht seine Hand/i.test(wrong)){
      fail('chapter-slice', 'wrong seal had no character beat', { wrong: wrong.slice(0, 180) });
    } else ok('chapter-slice-wrong-seal');
    await clickLabel(page, 'Erneut');
    await sleep(200);
    await clickLabel(page, '9-9-9');
    await sleep(250);
    const solved = await page.evaluate(() => document.getElementById('vnText')?.textContent || '');
    if(!/Weg ist frei|Knochen klappen|Siegel/i.test(solved)){
      fail('chapter-slice', 'seal did not open', { solved: solved.slice(0, 180) });
    } else ok('chapter-slice-seal', { solved: solved.slice(0, 80) });

    await clickLabel(page, 'Weiter');
    await sleep(200);
    await clickLabel(page, 'Gegner stellen');
    await page.waitForFunction(() => {
      const b = window.__game?.Battle?.getBattle?.();
      return !!(b && b.selecting);
    }, { timeout: 15000 }).catch(()=>{});
    const inFight = await page.evaluate(() => {
      const b = window.__game?.Battle?.getBattle?.();
      return { on: !!b, name: b?.foes?.[0]?.name || '' };
    });
    if(!inFight.on) fail('chapter-slice', 'imp fight did not start', inFight);
    else ok('chapter-slice-fight-start', inFight);

    const timed = await landTimedHit(page);
    if(!timed.ok) fail('chapter-slice', 'timed Satz did not register', timed);
    else ok('chapter-slice-satz', timed);

    await page.evaluate(() => { window.__game.S.flags = window.__game.S.flags || {}; window.__game.S.flags.nachklangAuto = true; });
    const end = await finishFight(page, 50000);
    if(!end.ok) fail('chapter-slice', 'fight did not resolve with attacks', end);
    else ok('chapter-slice-fight-end', end);

    const sceneBefore = await page.evaluate(() => ({
      scene: window.__game.S.campaign?.sceneId,
      gold: window.__game.S.st?.gold,
      room: window.__game.S.campaign?.dungeon?.room,
    }));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
    await page.waitForSelector('#btnContinue', { timeout: 15000 });
    await page.click('#btnContinue');
    await sleep(800);
    const sceneAfter = await page.evaluate(() => ({
      scene: window.__game.S?.campaign?.sceneId,
      gold: window.__game.S?.st?.gold,
      room: window.__game.S?.campaign?.dungeon?.room,
      name: window.__game.S?.pc?.name,
    }));
    if(sceneAfter.name !== 'Noctis' || sceneAfter.gold == null){
      fail('chapter-slice', 'continue did not restore the save', { sceneBefore, sceneAfter });
    } else ok('chapter-slice-reload', { sceneBefore, sceneAfter });

    if(!(await page.evaluate(() => !!window.__game?.Battle?.getBattle?.()))){
      const labels = await page.evaluate(() => [...document.querySelectorAll('#choices button')].map(b => b.textContent || ''));
      if(labels.some(t => /Dungeon betreten/i.test(t))) await clickLabel(page, 'Dungeon betreten');
      await sleep(250);
      const labels2 = await page.evaluate(() => [...document.querySelectorAll('#choices button')].map(b => b.textContent || ''));
      const fight = labels2.find(t => /Gegner|Boss/i.test(t));
      if(fight) await clickLabel(page, fight);
      await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).catch(()=>{});
    }
    const loss = await surrender(page);
    if(!loss.ok) fail('chapter-slice', 'defeat did not present', loss);
    else ok('chapter-slice-defeat', loss);
    await sleep(2000);
    const retry = await page.evaluate(() => [...document.querySelectorAll('#choices button')].map(b => b.textContent || ''));
    if(!retry.some(t => /Boss|Gegner|Weiter|Dungeon|Erneut|Raum/i.test(t))){
      fail('chapter-slice', 'no retry choice after defeat', { retry });
    } else ok('chapter-slice-retry', { retry });

    await page.setViewport({ width: 1920, height: 1080 });
    await sleep(300);
    const layout = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('#choices button')].filter(el => {
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        return r.width > 2 && r.height > 2 && st.visibility !== 'hidden' && st.display !== 'none';
      });
      let overlap = 0;
      const rect = el => { const r = el.getBoundingClientRect(); return { l:r.left,t:r.top,r:r.right,b:r.bottom }; };
      for(let i=0;i<btns.length;i++) for(let j=i+1;j<btns.length;j++){
        const a = rect(btns[i]), b = rect(btns[j]);
        const x = Math.max(0, Math.min(a.r,b.r)-Math.max(a.l,b.l));
        const y = Math.max(0, Math.min(a.b,b.b)-Math.max(a.t,b.t));
        if(x*y > 40) overlap++;
      }
      const off = btns.filter(el => { const r = el.getBoundingClientRect(); return r.right > innerWidth+2 || r.bottom > innerHeight+2 || r.left < -2; });
      return { n: btns.length, overlap, off: off.map(el => el.textContent) };
    });
    if(layout.overlap || layout.off.length) fail('chapter-slice', '1080 choices overlap or clip', layout);
    else ok('chapter-slice-1080', layout);
  } finally {
    await page.close().catch(()=>{});
  }
}

async function landTimedHit(page){
  await page.evaluate(() => {
    const tech = [...document.querySelectorAll('#battleCmd button')].find(b => /Technik/i.test(b.textContent || ''));
    tech?.click();
  });
  await sleep(120);
  await page.evaluate(() => {
    const atb = [...document.querySelectorAll('#battleCmd button')].find(b => /ATB/i.test(b.textContent || ''));
    atb?.click();
  });
  await sleep(120);
  const clicked = await page.evaluate(() => {
    const back = [...document.querySelectorAll('#battleCmd button')].find(b => /Zurück/i.test(b.textContent || ''));
    back?.click();
    const atk = [...document.querySelectorAll('#battleCmd button')].find(b => /Angriff/i.test(b.textContent || ''));
    if(atk){ atk.click(); return true; }
    return false;
  });
  if(!clicked) return { ok:false, reason:'no-attack-button' };
  await sleep(150);
  await page.evaluate(() => {
    const foe = document.querySelector('#battleFoes .foe-card:not(.dead), .foe-card');
    foe?.click();
  });
  await page.waitForSelector('#nachklangBar', { timeout: 4000 }).catch(()=>null);
  const has = await page.$('#nachklangBar');
  if(!has) return { ok:false, reason:'no-bar' };
  let pressed = false;
  for(let i=0;i<40;i++){
    const inside = await page.evaluate(() => {
      const bar = document.getElementById('nachklangBar');
      if(!bar) return 'gone';
      const mark = bar.querySelector('.nk-mark');
      const wins = [...bar.querySelectorAll('.nk-win')];
      if(!mark || !wins.length) return false;
      const m = mark.getBoundingClientRect();
      return wins.some(w => {
        const r = w.getBoundingClientRect();
        return m.left >= r.left-2 && m.right <= r.right+2;
      });
    });
    if(inside === 'gone') break;
    if(inside){
      await page.keyboard.press('Space');
      pressed = true;
      await sleep(80);
    } else await sleep(40);
  }
  await sleep(700);
  const log = await page.evaluate(() => (window.__game?.Battle?.getBattle?.()?.log || window.__game?.Battle?.getLastSummary?.()?.log || []));
  const hit = (log || []).some(l => /Satz:/.test(String(l)));
  return { ok: pressed && hit, pressed, log: (log || []).slice(-8) };
}

async function finishFight(page, timeoutMs){
  const t0 = Date.now();
  let clicks = 0;
  while(Date.now()-t0 < timeoutMs){
    const st = await page.evaluate(() => {
      const b = window.__game?.Battle?.getBattle?.();
      if(!b) return { phase:'done' };
      if(b.done) return { phase:'done', result:b.result };
      return { phase: b.selecting ? 'menu' : 'tick' };
    });
    if(st.phase === 'done') return { ok:true, result: st.result || 'done', clicks };
    if(st.phase === 'menu'){
      clicks++;
      await page.evaluate(() => {
        const root = document.getElementById('battleCmd');
        const atk = [...(root?.querySelectorAll('button') || [])].find(b => /Angriff/i.test(b.textContent || ''));
        if(atk) atk.click();
        else {
          const foe = document.querySelector('#battleFoes .foe-card:not(.dead)');
          if(foe) foe.click();
        }
      });
      await sleep(120);
      const bar = await page.$('#nachklangBar');
      if(bar){
        await page.keyboard.press('Space');
        await sleep(200);
        await page.keyboard.press('Space');
      }
      await sleep(80);
    } else await sleep(60);
  }
  return { ok:false, reason:'timeout', clicks };
}

async function surrender(page){
  const ready = await page.waitForFunction(() => {
    return [...document.querySelectorAll('#battleCmd button')].some(b => /Angriff/i.test(b.textContent || ''));
  }, { timeout: 8000 }).then(()=>true).catch(()=>false);
  if(!ready){
    const labels = await page.evaluate(() => [...document.querySelectorAll('#choices button')].map(b => b.textContent));
    return { ok:false, reason:'no-battle-menu', labels };
  }
  await page.evaluate(() => {
    const tech = [...document.querySelectorAll('#battleCmd button')].find(b => /Technik/i.test(b.textContent || ''));
    tech?.click();
  });
  await page.waitForFunction(() => [...document.querySelectorAll('#battleCmd button')].some(b => /Kapitul/i.test(b.textContent || '')), { timeout: 4000 }).catch(()=>{});
  await page.evaluate(() => {
    const cap = [...document.querySelectorAll('#battleCmd button')].find(b => /Kapitul/i.test(b.textContent || ''));
    cap?.click();
  });
  await page.waitForFunction(() => /KAPITULATION|NIEDERLAGE|kapituliert/i.test(document.body.innerText || ''), { timeout: 4000 }).catch(()=>{});
  const card = await page.evaluate(() => document.querySelector('.battle-end-card')?.innerText || (window.__game?.Battle?.getBattle?.()?.log || []).join(' | ') || '');
  return { ok: /NIEDERLAGE|KAPITULATION|kapituliert/i.test(card), card: String(card).slice(0, 180) };
}

export async function runFieldBoss({ browser, port, fail, ok }){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await page.goto(`http://127.0.0.1:${port}/?v=fieldboss`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
    await page.evaluate(async () => { localStorage.clear(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
    await page.click('#btnNew');
    await page.waitForFunction(() => window.__game?.OW?.__debug?.()?.active || document.body.classList.contains('field-play') || document.getElementById('owDlg'), { timeout: 20000 }).catch(()=>{});
    await sleep(800);
    const coach = await page.evaluate(() => {
      const el = document.getElementById('onboardCoach');
      if(!el) return false;
      return getComputedStyle(el).display !== 'none' && !el.classList.contains('hidden');
    });
    if(coach) await page.click('#btnCoachOk');
    for(let i=0;i<8;i++){
      const open = await page.evaluate(() => {
        const el = document.getElementById('owDlg');
        return !!(el && !el.classList.contains('hidden'));
      });
      if(!open) break;
      await page.keyboard.press('Enter');
      await sleep(180);
    }
    const dash = await page.evaluate(() => {
      const cs = document.getElementById('choices');
      const vn = document.querySelector('.vn-wrap');
      const vis = (el) => {
        if(!el) return false;
        const st = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return st.display !== 'none' && st.visibility !== 'hidden' && r.height > 8 && r.width > 8;
      };
      return { choices: vis(cs), prose: vis(vn), field: document.body.classList.contains('field-play') };
    });
    if(dash.choices || dash.prose || !dash.field) fail('field-boss', 'story dashboard still visible', dash);
    else ok('field-boss-no-dashboard', dash);

    const velka = await page.evaluate(() => (window.__game.OW.__listNpcs() || []).find(n => /Velka/.test(n.name)));
    if(!velka) { fail('field-boss', 'Velka missing'); }
    else {
      await stepNear(page, velka.x, velka.y);
      await page.keyboard.press('Enter');
      await sleep(250);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('#owDlgChoices button')].find(x => /Mitnehmen/.test(x.textContent || ''));
        b?.click();
      });
      await sleep(200);
      await page.keyboard.press('Enter');
      await sleep(150);
      const joined = await page.evaluate(() => (window.__game.S.party || []).some(n => /Velka/.test(n)));
      if(!joined) fail('field-boss', 'Velka did not join');
      else ok('field-boss-velka');
    }

    const door = await page.evaluate(() => (window.__game.OW.__debug().doors || []).find(d => /katakomb/i.test(d.to || d.label || '')));
    if(!door) fail('field-boss', 'no catacomb door');
    else {
      await stepNear(page, door.x, door.y);
      await page.keyboard.press('ArrowUp');
      await sleep(200);
      const hero = await page.evaluate(() => window.__game.OW.__debug().hero);
      const dx = Math.sign(door.x - hero.x), dy = Math.sign(door.y - hero.y);
      const key = dx < 0 ? 'ArrowLeft' : dx > 0 ? 'ArrowRight' : dy < 0 ? 'ArrowUp' : 'ArrowDown';
      await page.keyboard.down(key);
      await sleep(250);
      await page.keyboard.up(key);
      await sleep(400);
      const ort = await page.evaluate(() => window.__game.S.world.scene.ort);
      if(!/Katakomb/i.test(ort || '')) fail('field-boss', 'did not enter catacombs', { ort, hero, door });
      else ok('field-boss-enter', { ort });
    }
    for(let i=0;i<4;i++){
      const open = await page.evaluate(() => { const el=document.getElementById('owDlg'); return !!(el && !el.classList.contains('hidden')); });
      if(!open) break;
      await page.keyboard.press('Enter');
      await sleep(120);
    }
    const seal = await page.evaluate(() => (window.__game.OW.__debug().questMarks || []).find(m => m.kind === 'puzzle' || /siegel/i.test(m.label || '')));
    if(!seal) fail('field-boss', 'no seal');
    else {
      await stepNear(page, seal.x, seal.y);
      await page.keyboard.press('Enter');
      await sleep(300);
      await page.evaluate(() => {
        const b = [...document.querySelectorAll('#owDlgChoices button')].find(x => /9-9-9/.test(x.textContent || ''));
        b?.click();
      });
      await sleep(250);
      const flagged = await page.evaluate(() => !!window.__game.S.campaign.flags.puzzle_c1_ledger_seal);
      if(!flagged) fail('field-boss', 'seal not opened');
      else ok('field-boss-seal');
      await page.keyboard.press('Enter');
      await sleep(120);
    }
    const boss = await page.evaluate(() => (window.__game.OW.__debug().questMarks || []).find(m => m.kind === 'boss'));
    if(!boss) fail('field-boss', 'no boss door');
    else {
      await stepNear(page, boss.x, boss.y);
      await page.keyboard.press('Enter');
      await sleep(500);
    }
    const started = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!started) fail('field-boss', 'boss battle did not start');
    else ok('field-boss-started');
    await page.evaluate(() => { window.__game.S.flags.nachklangAuto = true; window.__game.S.cfgAtbMode = 'wait'; const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
    const end = await finishFight(page, 90000);
    if(!end.ok || end.result !== 'win') fail('field-boss', 'boss not won with attacks', end);
    else ok('field-boss-win', end);
    await page.waitForFunction(() => !!window.__game.S.campaign?.flags?.beat_lesser_fiend, { timeout: 5000 }).catch(()=>{});
    await sleep(300);
    const after = await page.evaluate(() => ({
      scene: window.__game.S.campaign.sceneId,
      beat: !!window.__game.S.campaign.flags.beat_lesser_fiend,
      dlg: (document.getElementById('owDlgText')?.textContent || '').slice(0, 80),
    }));
    if(!after.beat) fail('field-boss', 'victory did not flag the fiend', after);
    else ok('field-boss-reward', after);
  } finally {
    await page.close().catch(()=>{});
  }
}

async function stepNear(page, x, y, limit=90){
  let stuck = 0;
  let last = '';
  for(let i=0;i<limit;i++){
    const h = await page.evaluate(() => window.__game.OW.__debug().hero);
    const open = await page.evaluate(() => { const el=document.getElementById('owDlg'); return !!(el && !el.classList.contains('hidden') && !document.querySelector('#owDlgChoices button')); });
    if(open){ await page.keyboard.press('Enter'); await sleep(70); continue; }
    if(Math.abs(h.x - x) + Math.abs(h.y - y) <= 1) return h;
    const primary = Math.abs(h.x - x) >= Math.abs(h.y - y)
      ? (h.x < x ? 'ArrowRight' : 'ArrowLeft')
      : (h.y < y ? 'ArrowDown' : 'ArrowUp');
    const side = primary.startsWith('ArrowL') || primary.startsWith('ArrowR')
      ? (h.y < y ? 'ArrowDown' : 'ArrowUp')
      : (h.x < x ? 'ArrowRight' : 'ArrowLeft');
    const key = stuck >= 2 ? side : primary;
    if(key === last && stuck >= 2) stuck = 0;
    const before = h.x + ',' + h.y;
    await page.keyboard.down(key);
    await sleep(150);
    await page.keyboard.up(key);
    await sleep(30);
    const h2 = await page.evaluate(() => window.__game.OW.__debug().hero);
    const after = h2.x + ',' + h2.y;
    stuck = after === before ? stuck + 1 : 0;
    last = key;
  }
  return page.evaluate(() => window.__game.OW.__debug().hero);
}

export async function runAriaRoutes({ browser, port, fail, ok }){
  await runAriaYes(browser, port, fail, ok);
  await runAriaStood(browser, port, fail, ok);
  await runAriaLoyal(browser, port, fail, ok);
  await runAriaPageOnly(browser, port, fail, ok);
  await runAriaNo(browser, port, fail, ok);
  await runAriaUnderage(browser, port, fail, ok);
}

async function runAriaYes(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-yes');
    const opening = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || document.getElementById('owDlgText')?.textContent || '');
    if(/Nicht aus der Tasche/.test(opening) || /Venn hustet Staub/.test(opening)){
      fail('aria-voice', 'opening still uses the clipped line', { opening: opening.slice(0, 160) });
    } else if(!/vierzehn Gold/i.test(opening) || !/Dienstag/.test(opening)){
      fail('aria-voice', 'opening did not reach Velka', { opening: opening.slice(0, 160) });
    } else ok('aria-voice-open', { opening: opening.slice(0, 90) });
    await clearDlg(page, 14);
    await fsShot(page, 'aria-throne-after-boot.png');

    if(!(await talkNpc(page, 'Aria'))){ fail('aria-yes', 'Aria not on the throne'); return; }
    if(!(await clickChoice(page, 'Erzähl weiter'))){ fail('aria-yes', 'no motive choice'); return; }
    await clearDlg(page, 6);
    const heard = await flags(page);
    if(!heard.ariaHeard || (heard.step|0) < 1) fail('aria-yes', 'motive did not register', heard);
    else ok('aria-heard', heard);

    if(!(await talkNpc(page, 'Aria'))){ fail('aria-yes', 'Aria missing for the pact'); return; }
    await fsShot(page, 'aria-pact-choices.png');
    const pactLayout = await choiceLayout(page);
    if(pactLayout.off || pactLayout.overlap || pactLayout.n < 3) fail('aria-yes', 'pact choices clip or missing', pactLayout);
    else ok('aria-pact-layout', pactLayout);
    if(!(await clickChoice(page, 'Ich nehm die Seite'))){ fail('aria-yes', 'betrayal choice missing'); return; }
    await clearDlg(page, 6);
    const pact = await flags(page);
    if(!pact.ariaPact || !pact.party.includes('Heldin Aria')) fail('aria-yes', 'pact did not recruit Aria', pact);
    else ok('aria-pact', { party: pact.party, trust: pact.rom?.trust, events: pact.rom?.events });

    if(!(await talkNpc(page, 'Aria'))){ fail('aria-yes', 'Aria missing for the boundary'); return; }
    if(!(await clickChoice(page, 'Ich frag dich danach'))){ fail('aria-yes', 'court choice missing'); return; }
    await clearDlg(page, 6);
    const court = await flags(page);
    if(!court.ariaCourt || court.ariaRomance) fail('aria-yes', 'court did not wait', court);
    else ok('aria-court', { stage: court.rom?.stage, events: court.rom?.events });

    if(!(await talkNpc(page, 'Velka'))){ fail('aria-yes', 'Velka missing'); return; }
    const velkaLine = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/Aria/.test(velkaLine)) fail('aria-yes', 'Velka did not react to the pact', { velkaLine: velkaLine.slice(0, 140) });
    else ok('aria-velka-reacts', { velkaLine: velkaLine.slice(0, 80) });
    if(!(await clickChoice(page, 'Mitnehmen'))) fail('aria-yes', 'Velka recruit missing');
    await clearDlg(page, 4);

    const boss = await fieldBossWin(page);
    if(!boss.ok){ fail('aria-yes', 'betrayal route did not finish the fiend', boss); return; }
    ok('aria-yes-boss', boss);
    const taken = await flags(page);
    if(!taken.ariaPageTaken) fail('aria-yes', 'seal did not hand Aria the page', taken);
    else ok('aria-page', { ariaPageTaken: true });

    const choice = await advanceToChoice(page, 'erwachsen');
    if(!choice){ fail('aria-yes', 'romance consent did not appear'); return; }
    await fsShot(page, 'aria-consent-choices.png');
    if(!(await clickChoice(page, 'Ja\\. Ich bin erwachsen'))){ fail('aria-yes', 'yes button missing'); return; }
    await sleep(400);
    await fsShot(page, 'aria-after-yes.png');
    const night = await flags(page);
    const velkaGone = !night.party.includes('Sekretärin Velka') && !night.party.includes('General Brok');
    const ariaStays = night.party.includes('Heldin Aria');
    if(!night.ariaRomance || !night.ariaSplit || !night.ariaAdults || !velkaGone || !ariaStays || (night.rom?.stage|0) < 4){
      fail('aria-yes', 'romance payoff did not change the party', night);
    } else ok('aria-romance', { party: night.party, stage: night.rom?.stage, events: night.rom?.events });

    const saved = await persist(page);
    if(!saved) fail('aria-yes', 'save did not write');
    await reloadContinue(page);
    const again = await flags(page);
    if(!again.ariaRomance || !again.ariaPact || !again.party.includes('Heldin Aria') || again.party.includes('Sekretärin Velka')){
      fail('aria-yes', 'reload lost the route', again);
    } else ok('aria-yes-reload', { party: again.party, stage: again.rom?.stage, events: again.rom?.events });

    if(!(await walkMark(page, 'pass'))){ fail('aria-yes', 'no road to the pass'); return; }
    await sleep(400);
    const passLine = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/nicht deine Frau|Die Nacht war/.test(passLine)) fail('aria-yes', 'pass did not keep the night separate from a marriage', { passLine: passLine.slice(0, 160) });
    else ok('aria-pass-night', { passLine: passLine.slice(0, 100) });
    await clearDlg(page, 8);
    await page.setViewport({ width: 1920, height: 1080, isMobile: false, hasTouch: false });
    await sleep(300);
    if(!(await talkNpc(page, 'Toren'))){ fail('aria-yes', 'Toren missing on the pass'); return; }
    await page.waitForFunction(() => {
      const t = document.getElementById('owDlgText');
      return t && t.textContent === t.dataset.full && document.querySelector('#owDlgChoices button');
    }, { timeout: 8000 }).catch(()=>{});
    await fsShot(page, 'pass_toren_1080.png');
    await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
    await sleep(200);
    await fsShot(page, 'pass_toren_720.png');
    if(!(await clickChoice(page, 'Halt sie auf'))){ fail('aria-yes', 'Toren had no refusal'); return; }
    await sleep(250);
    const cool = await flags(page);
    if(!cool.ariaRomance || !cool.ariaCool || cool.party.includes('Heldin Aria') || (cool.rom?.stage|0) > 2){
      fail('aria-yes', 'standing aside did not end the affection', cool);
    } else ok('aria-pass-cool', { party: cool.party, stage: cool.rom?.stage, events: cool.rom?.events });
    if(!(await walkMark(page, 'solmir'))){ fail('aria-yes', 'no road to Solmir'); return; }
    const coolYard = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/nicht mit dir|Pass geblieben/.test(coolYard)) fail('aria-yes', 'yard ignored that she was stopped', { coolYard: coolYard.slice(0, 140) });
    else ok('aria-cool-yard', { line: coolYard.slice(0, 90) });
  } finally {
    await page.close().catch(()=>{});
  }
}

export async function runAriaStood(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-stood');
    await clearDlg(page, 14);
    if(!(await ariaToCourt(page, fail, 'aria-stood'))) return;
    if(!(await talkNpc(page, 'Velka'))){ fail('aria-stood', 'Velka missing'); return; }
    await clickChoice(page, 'Mitnehmen');
    await clearDlg(page, 4);
    const boss = await fieldBossWin(page);
    if(!boss.ok){ fail('aria-stood', 'fiend not won', boss); return; }
    if(!(await advanceToChoice(page, 'erwachsen'))){ fail('aria-stood', 'no consent after the fiend'); return; }
    if(!(await clickChoice(page, 'Ja\\. Ich bin erwachsen'))){ fail('aria-stood', 'yes missing'); return; }
    await sleep(300);
    if(!(await walkMark(page, 'pass'))){ fail('aria-stood', 'no road to the pass'); return; }
    await clearDlg(page, 8);
    if(!(await talkNpc(page, 'Toren'))){ fail('aria-stood', 'Toren missing'); return; }
    const focused = await page.waitForFunction(() => /geht durch/i.test(document.activeElement?.textContent || ''), { timeout: 4000 }).then(()=>true).catch(()=>false);
    if(!focused){
      const who = await page.evaluate(() => document.activeElement?.textContent || '');
      fail('aria-stood', 'choice did not take keyboard focus', { who });
      return;
    }
    await page.keyboard.press('Enter');
    await sleep(300);
    const stood = await flags(page);
    if(!stood.ariaStood || !stood.ariaRomance || !stood.party.includes('Heldin Aria') || (stood.rom?.stage|0) < 4){
      fail('aria-stood', 'standing in front of her did not keep her', stood);
    } else ok('aria-stood', { party: stood.party, stage: stood.rom?.stage, events: stood.rom?.events });
    await clearDlg(page, 4);
    await page.evaluate(() => { window.__game.S.st.hp = window.__game.S.st.maxhp; window.__game.S.flags.nachklangAuto = true; });
    if(!(await walkMark(page, 'boss'))){ fail('aria-stood', 'hound missing'); return; }
    const up = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!up){ fail('aria-stood', 'hound did not start'); return; }
    await page.evaluate(() => { const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
    const hound = await finishFight(page, 90000);
    if(!hound.ok || hound.result!=='win'){ fail('aria-stood', 'betrayal hound not won', hound); return; }
    await page.waitForFunction(() => window.__game.S.campaign.flags.passClear, { timeout: 8000 }).catch(()=>{});
    await sleep(400);
    const end = await flags(page);
    if(!end.passClear || !end.ariaStood || !end.party.includes('Heldin Aria')){
      fail('aria-stood', 'hound cleared her out', end);
    } else ok('aria-stood-hound', { party: end.party, stage: end.rom?.stage });
    const saved = await persist(page);
    if(!saved) fail('aria-stood', 'save failed');
    await reloadContinue(page);
    const again = await flags(page);
    if(!again.ariaStood || !again.ariaRomance || !again.passClear || !again.party.includes('Heldin Aria')){
      fail('aria-stood', 'reload lost the stand', again);
    } else ok('aria-stood-reload', { party: again.party, stage: again.rom?.stage });
    if(!(await walkMark(page, 'solmir'))){ fail('aria-stood', 'no road to Solmir'); return; }
    const stoodLine = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/Hof|Lio/.test(stoodLine)) fail('aria-stood', 'yard line forgot she came', { stoodLine: stoodLine.slice(0, 140) });
    else ok('aria-stood-yard', { line: stoodLine.slice(0, 90) });
    await clearDlg(page, 8);
    if(!(await walkMark(page, 'crypt'))){ fail('aria-stood', 'crypt door missing'); return; }
    if(!(await clickChoice(page, '^Acht$'))){ fail('aria-stood', 'coffin count missing'); return; }
    await clearDlg(page, 4);
    await page.evaluate(() => { window.__game.S.st.hp = window.__game.S.st.maxhp; window.__game.S.flags.nachklangAuto = true; });
    if(!(await walkMark(page, 'boss'))){ fail('aria-stood', 'lich missing'); return; }
    const upL = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!upL){ fail('aria-stood', 'lich did not start'); return; }
    await page.evaluate(() => { const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
    const lich = await finishFight(page, 120000);
    if(!lich.ok || lich.result!=='win'){ fail('aria-stood', 'protected lich not won', lich); return; }
    await page.waitForFunction(() => window.__game.S.campaign.flags.c3Clear, { timeout: 8000 }).catch(()=>{});
    await sleep(400);
    const endL = await flags(page);
    if(!endL.c3Clear || !endL.ariaStood || !endL.party.includes('Heldin Aria')){
      fail('aria-stood', 'lich cleared her out', endL);
    } else ok('aria-stood-lich', { party: endL.party, stage: endL.rom?.stage });
    const savedL = await persist(page);
    if(!savedL) fail('aria-stood', 'crypt save failed');
    await reloadContinue(page);
    const againL = await flags(page);
    if(!againL.c3Clear || !againL.ariaStood || !againL.party.includes('Heldin Aria')) fail('aria-stood', 'crypt reload lost her', againL);
    else ok('aria-stood-lich-reload', { party: againL.party });
  } finally {
    await page.close().catch(()=>{});
  }
}

export async function runAriaLoyal(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-loyal');
    await clearDlg(page, 14);
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-loyal', 'Aria missing'); return; }
    if(!(await clickChoice(page, 'Erzähl weiter'))){ fail('aria-loyal', 'motive missing'); return; }
    await clearDlg(page, 6);
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-loyal', 'Aria missing for refusal'); return; }
    if(!(await clickChoice(page, 'Die Seite bleibt'))){ fail('aria-loyal', 'refusal missing'); return; }
    await clearDlg(page, 6);
    const refused = await flags(page);
    if(!refused.ariaRefused || refused.ariaPact || !refused.party.includes('Heldin Aria')){
      fail('aria-loyal', 'refusal did not keep her as a blade', refused);
    } else ok('aria-refused', { party: refused.party, events: refused.rom?.events });
    if(!(await talkNpc(page, 'Velka'))){ fail('aria-loyal', 'Velka missing'); return; }
    const velkaLine = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(/Seite fehlt|guckst die ganze Zeit/.test(velkaLine)) fail('aria-loyal', 'Velka reacted as if betrayed', { velkaLine });
    else ok('aria-loyal-velka', { velkaLine: velkaLine.slice(0, 80) });
    await clickChoice(page, 'Mitnehmen');
    await clearDlg(page, 4);
    const saved = await persist(page);
    if(!saved) fail('aria-loyal', 'save did not write');
    await reloadContinue(page);
    const mid = await flags(page);
    if(!mid.ariaRefused || mid.ariaPact) fail('aria-loyal', 'reload lost the refusal', mid);
    else ok('aria-loyal-reload', { ariaRefused: true, party: mid.party });

    const boss = await fieldBossWin(page);
    if(!boss.ok){ fail('aria-loyal', 'loyal route did not finish the fiend', boss); return; }
    ok('aria-loyal-boss', boss);
    await advanceToChoice(page, 'Mitkommen|Staub hat aufgehört|Buch bleibt');
    await clearDlg(page, 8);
    const end = await flags(page);
    if(end.ariaRomance || end.ariaSplit || end.ariaPageTaken || !end.party.includes('Sekretärin Velka') || end.party.includes('Heldin Aria')){
      fail('aria-loyal', 'loyal ending changed the wrong flags', end);
    } else ok('aria-loyal-end', { party: end.party, beat: end.beat });

    if(!(await walkMark(page, 'pass'))){ fail('aria-loyal', 'no road to the pass'); return; }
    await clearDlg(page, 8);
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-loyal', 'Aria missing at the pass'); return; }
    const loyalLine = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/Lio hustet|Klinge/.test(loyalLine)) fail('aria-loyal', 'pass line assumed a romance', { loyalLine: loyalLine.slice(0, 160) });
    else ok('aria-loyal-pass', { loyalLine: loyalLine.slice(0, 100) });
    await clearDlg(page, 4);
    await page.evaluate(() => { const s=window.__game.S.st; s.hp=s.maxhp||s.hp; s.mp=s.maxmp||s.mp; });
    if(!(await walkMark(page, 'hunt'))){ fail('aria-loyal', 'wolf not on the road'); return; }
    const wolfUp = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!wolfUp){ fail('aria-loyal', 'wolf fight did not start'); return; }
    const down = await surrender(page);
    if(!down.ok) fail('aria-loyal', 'wolf defeat did not present', down);
    else ok('aria-pass-defeat', down);
    await sleep(1900);
    const retry = await clickChoice(page, 'Noch mal');
    if(!retry){
      const dbg = await page.evaluate(() => ({
        field: document.body.classList.contains('field-play'),
        pass: !!window.__game.S.campaign.flags.passField,
        labels: [...document.querySelectorAll('#owDlgChoices button, #choices button')].map(b => b.textContent),
        dlg: (document.getElementById('owDlgText')?.textContent || '').slice(0, 80),
        battle: window.__game.Battle.getBattle()?.result || window.__game.Battle.getLastSummary?.()?.result || null,
      }));
      fail('aria-loyal', 'no retry after the wolf', dbg);
      return;
    }
    await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).catch(()=>{});
    await page.evaluate(() => { window.__game.S.flags.nachklangAuto = true; window.__game.S.st.hp = window.__game.S.st.maxhp; const b=window.__game.Battle.getBattle(); if(b){ b.atbMode='wait'; } });
    const wolf = await finishFight(page, 70000);
    if(!wolf.ok || wolf.result!=='win'){ fail('aria-loyal', 'wolf retry did not win', wolf); return; }
    ok('aria-pass-wolf', wolf);
    await page.waitForFunction(() => !window.__game.Battle.getBattle() && window.__game.S.campaign.flags.passWolf, { timeout: 8000 }).catch(()=>{});
    await sleep(500);
    await clearDlg(page, 6);
    const fur = await page.evaluate(() => (window.__game.S.inv||[]).some(i => /Wolfsfell/.test(i?.name||i||'')));
    if(!fur) fail('aria-loyal', 'wolf left no pelt');
    else ok('aria-pass-reward', { fur: true });
    const beforePay = await page.evaluate(() => window.__game.S.st.gold|0);
    if(!(await talkNpc(page, 'Nyx'))){ fail('aria-loyal', 'Nyx missing'); return; }
    if(!(await clickChoice(page, 'Zahlen'))){ fail('aria-loyal', 'Nyx had no price', { gold: beforePay }); return; }
    await clearDlg(page, 4);
    const paid = await flags(page);
    const afterPay = await page.evaluate(() => window.__game.S.st.gold|0);
    if(!paid.nyxReport || afterPay !== beforePay-15) fail('aria-loyal', 'Nyx payment did not stick', { beforePay, afterPay, nyx: paid.nyxReport });
    else ok('aria-nyx-pay', { beforePay, afterPay });
    await page.evaluate(() => { window.__game.S.st.hp = window.__game.S.st.maxhp; });
    if(!(await walkMark(page, 'boss'))){ fail('aria-loyal', 'hound mark missing'); return; }
    const houndUp = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!houndUp){ fail('aria-loyal', 'hound did not start'); return; }
    await page.evaluate(() => { window.__game.S.flags.nachklangAuto = true; const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
    const hound = await finishFight(page, 90000);
    if(!hound.ok || hound.result!=='win'){ fail('aria-loyal', 'hound not won with attacks', hound); return; }
    ok('aria-pass-hound', hound);
    await page.waitForFunction(() => !window.__game.Battle.getBattle() && window.__game.S.campaign.flags.passClear, { timeout: 8000 }).catch(()=>{});
    await sleep(500);
    const cleared = await flags(page);
    const mantle = await page.evaluate(() => (window.__game.S.inv||[]).some(i => /Passmantel/.test(i.name||'')));
    if(!cleared.passClear || cleared.ariaRomance || !cleared.party.includes('Sekretärin Velka') || !cleared.party.includes('Spionin Nyx') || !mantle){
      fail('aria-loyal', 'pass clear did not pay out or kept the wrong party', { ...cleared, mantle });
    } else ok('aria-pass-clear', { party: cleared.party, mantle: true });
    await page.evaluate(() => window.__game.OW.hideDialogue?.());
    if(!(await walkMark(page, 'solmir'))){ fail('aria-loyal', 'no road to Solmir'); return; }
    await sleep(400);
    const yard = await page.evaluate(() => {
      const cs = document.getElementById('choices');
      const st = cs ? getComputedStyle(cs) : null;
      return {
        field: document.body.classList.contains('field-play'),
        menu: !!(st && st.display !== 'none' && !cs.classList.contains('hidden') && cs.getBoundingClientRect().height > 8),
        ort: window.__game.S.world.scene.ort,
        line: document.getElementById('owDlgText')?.dataset?.full || '',
      };
    });
    if(!yard.field || yard.menu || !/Solmir/.test(yard.ort||'') || !/Husten|Gruft|Hof/.test(yard.line)){
      fail('aria-loyal', 'Solmir opened as a menu or without a line', yard);
    } else ok('aria-solmir', { ort: yard.ort, line: yard.line.slice(0, 100) });
    await clearDlg(page, 10);
    if(!(await walkMark(page, 'crypt'))){ fail('aria-loyal', 'crypt door missing'); return; }
    if(!(await clickChoice(page, '^Acht$'))){ fail('aria-loyal', 'coffin count missing'); return; }
    await clearDlg(page, 4);
    const sealed = await flags(page);
    if(!sealed.solmirSeal){ fail('aria-loyal', 'eight coffins did not open the crypt', sealed); return; }
    ok('aria-crypt-seal');
    await page.evaluate(() => { window.__game.S.st.hp = window.__game.S.st.maxhp; });
    if(!(await walkMark(page, 'boss'))){ fail('aria-loyal', 'lich mark missing'); return; }
    const lichUp = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
    if(!lichUp){ fail('aria-loyal', 'lich did not start'); return; }
    const lichDown = await surrender(page);
    if(!lichDown.ok) fail('aria-loyal', 'lich defeat did not present', lichDown);
    else ok('aria-lich-defeat', lichDown);
    await sleep(1900);
    if(!(await clickChoice(page, 'Noch mal'))){ fail('aria-loyal', 'no lich retry'); return; }
    await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).catch(()=>{});
    await page.evaluate(() => { window.__game.S.flags.nachklangAuto = true; window.__game.S.st.hp = window.__game.S.st.maxhp; const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
    const lich = await finishFight(page, 120000);
    if(!lich.ok || lich.result!=='win'){ fail('aria-loyal', 'lich not won with attacks', lich); return; }
    await page.waitForFunction(() => window.__game.S.campaign.flags.c3Clear, { timeout: 8000 }).catch(()=>{});
    await sleep(400);
    const clearedCrypt = await flags(page);
    const ash = await page.evaluate(() => (window.__game.S.inv||[]).some(i => /Lichasche/.test(i?.name||'')));
    if(!clearedCrypt.c3Clear || !ash || !clearedCrypt.party.includes('Sekretärin Velka')){
      fail('aria-loyal', 'lich clear missed the reward or the party', { ...clearedCrypt, ash });
    } else ok('aria-lich-win', { party: clearedCrypt.party, ash: true });
    const savedPass = await persist(page);
    if(!savedPass) fail('aria-loyal', 'pass save failed');
    await reloadContinue(page);
    const back = await flags(page);
    if(!back.passClear || !back.ariaRefused || back.ariaRomance || !back.nyxReport || !back.solmirArrived || !back.c3Clear || !back.party.includes('Spionin Nyx')){
      fail('aria-loyal', 'pass reload lost the route', back);
    } else ok('aria-pass-reload', { passClear: true, solmir: true, party: back.party });
  } finally {
    await page.close().catch(()=>{});
  }
}

async function runAriaPageOnly(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-page');
    await clearDlg(page, 14);
    if(!(await ariaToPact(page, fail, 'aria-page'))) return;
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-page', 'Aria missing for the limit'); return; }
    if(!(await clickChoice(page, 'Nur die Seite'))){ fail('aria-page', 'page-only choice missing'); return; }
    await clearDlg(page, 6);
    const set = await flags(page);
    if(!set.ariaNoRomance || set.ariaCourt || !set.ariaPact){ fail('aria-page', 'page-only did not stick', set); return; }
    ok('aria-page-set', { events: set.rom?.events });
    const boss = await fieldBossWin(page);
    if(!boss.ok){ fail('aria-page', 'page-only route did not finish the fiend', boss); return; }
    ok('aria-page-boss', boss);
    await clearDlg(page, 8);
    const end = await flags(page);
    const asked = await page.evaluate(() => /erwachsen/.test(document.getElementById('owDlgText')?.dataset?.full || ''));
    if(end.ariaRomance || asked || !end.ariaSplit || end.party.includes('Heldin Aria') || end.party.includes('Sekretärin Velka') || !end.ariaPageTaken){
      fail('aria-page', 'page-only still offered the night or kept the allies', { ...end, asked });
    } else ok('aria-page-end', { party: end.party, events: end.rom?.events });
    if(!(await walkMark(page, 'pass'))){ fail('aria-page', 'no road to the pass'); return; }
    await clearDlg(page, 6);
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-page', 'Aria missing at the pass'); return; }
    const line = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/kein Bett|nicht gefragt|nicht willst/.test(line)) fail('aria-page', 'pass treated the page as affection', { line: line.slice(0, 160) });
    else ok('aria-page-pass', { line: line.slice(0, 110) });
    await clearDlg(page, 4);
    const goldBefore = await page.evaluate(() => window.__game.S.st.gold|0);
    if(!(await talkNpc(page, 'Nyx'))){ fail('aria-page', 'Nyx missing'); return; }
    if(!(await clickChoice(page, 'Später'))){ fail('aria-page', 'Nyx had no decline'); return; }
    await clearDlg(page, 3);
    const declined = await flags(page);
    const goldAfter = await page.evaluate(() => window.__game.S.st.gold|0);
    if(declined.nyxReport || goldAfter !== goldBefore) fail('aria-page', 'declining Nyx still charged or hired her', { goldBefore, goldAfter, nyx: declined.nyxReport });
    else ok('aria-nyx-decline', { gold: goldAfter });
    if(!(await walkMark(page, 'solmir'))){ fail('aria-page', 'no road to Solmir'); return; }
    const pageYard = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/nicht mit dir|Pass geblieben/.test(pageYard)) fail('aria-page', 'yard ignored the page-only split', { pageYard: pageYard.slice(0, 140) });
    else ok('aria-page-yard', { line: pageYard.slice(0, 90) });
    const saved = await persist(page);
    if(!saved) fail('aria-page', 'save did not write');
    await reloadContinue(page);
    const again = await flags(page);
    if(!again.ariaNoRomance || again.ariaRomance || !again.passArrived || again.party.includes('Sekretärin Velka')){
      fail('aria-page', 'reload lost the page-only route', again);
    } else ok('aria-page-reload', { party: again.party, events: again.rom?.events });
  } finally {
    await page.close().catch(()=>{});
  }
}

async function runAriaNo(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-no');
    await clearDlg(page, 14);
    if(!(await ariaToCourt(page, fail, 'aria-no'))) return;
    const boss = await fieldBossWin(page);
    if(!boss.ok){ fail('aria-no', 'refusal route did not finish the fiend', boss); return; }
    ok('aria-no-boss', boss);
    const shown = await advanceToChoice(page, 'Nein');
    if(!shown){ fail('aria-no', 'no-button missing after the fiend'); return; }
    await fsShot(page, 'aria_refusal_after_boss.png');
    if(!(await clickChoice(page, '^Nein'))){ fail('aria-no', 'could not refuse'); return; }
    await sleep(250);
    const end = await flags(page);
    if(end.ariaRomance || !end.ariaRomanceRefused || !end.ariaSplit || !end.beat || end.party.includes('Heldin Aria') || end.party.includes('Sekretärin Velka')){
      fail('aria-no', 'refusal still left the romance or the allies', end);
    } else ok('aria-no', { party: end.party, events: end.rom?.events, beat: true });
    if(!(await walkMark(page, 'pass'))){ fail('aria-no', 'no road to the pass'); return; }
    await clearDlg(page, 6);
    if(!(await talkNpc(page, 'Aria'))){ fail('aria-no', 'Aria missing at the pass'); return; }
    const line = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/nein gesagt|kein Bett|Zelt/.test(line)) fail('aria-no', 'pass ignored the refusal', { line: line.slice(0, 160) });
    else ok('aria-no-pass', { line: line.slice(0, 110) });
    if(!(await walkMark(page, 'solmir'))){ fail('aria-no', 'no road to Solmir'); return; }
    const noYard = await page.evaluate(() => document.getElementById('owDlgText')?.dataset?.full || '');
    if(!/nicht mit dir|Pass geblieben|nicht nach dir/.test(noYard)) fail('aria-no', 'yard ignored the refusal', { noYard: noYard.slice(0, 140) });
    else ok('aria-no-yard', { line: noYard.slice(0, 90) });
    const saved = await persist(page);
    if(!saved) fail('aria-no', 'save did not write');
    await reloadContinue(page);
    const again = await flags(page);
    if(again.ariaRomance || !again.ariaRomanceRefused || !again.passArrived) fail('aria-no', 'reload lost the refusal', again);
    else ok('aria-no-reload', { ariaRomanceRefused: true, party: again.party, pass: true });
  } finally {
    await page.close().catch(()=>{});
  }
}

async function runAriaUnderage(browser, port, fail, ok){
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, isMobile: false, hasTouch: false });
  try{
    await bootField(page, port, 'aria-age');
    await clearDlg(page, 14);
    if(!(await ariaToCourt(page, fail, 'aria-age'))) return;
    await page.evaluate(() => {
      const S = window.__game.S;
      S.campaign.flags.ariaPageTaken = true;
      S.campaign.flags.puzzle_c1_ledger_seal = true;
      window.__game.OW.fieldReward(S);
    });
    await sleep(250);
    if(!(await advanceToChoice(page, 'nicht erwachsen'))){ fail('aria-age', 'age stop missing'); return; }
    if(!(await clickChoice(page, 'nicht erwachsen'))){ fail('aria-age', 'could not stop'); return; }
    await sleep(200);
    const end = await flags(page);
    if(end.ariaRomance || !end.ariaUnderageStop || end.party.includes('Heldin Aria')){
      fail('aria-age', 'underage stop did not close the route', end);
    } else ok('aria-underage', { party: end.party, events: end.rom?.events });
  } finally {
    await page.close().catch(()=>{});
  }
}

async function ariaToPact(page, fail, tag){
  if(!(await talkNpc(page, 'Aria'))){ fail(tag, 'Aria missing'); return false; }
  if(!(await clickChoice(page, 'Erzähl weiter'))){ fail(tag, 'motive missing'); return false; }
  await clearDlg(page, 6);
  if(!(await talkNpc(page, 'Aria'))){ fail(tag, 'Aria missing for pact'); return false; }
  if(!(await clickChoice(page, 'Ich nehm die Seite'))){ fail(tag, 'pact missing'); return false; }
  await clearDlg(page, 6);
  return true;
}

async function ariaToCourt(page, fail, tag){
  if(!(await ariaToPact(page, fail, tag))) return false;
  if(!(await talkNpc(page, 'Aria'))){ fail(tag, 'Aria missing for court'); return false; }
  if(!(await clickChoice(page, 'Ich frag dich danach'))){ fail(tag, 'court missing'); return false; }
  await clearDlg(page, 6);
  return true;
}

async function bootField(page, port, tag){
  await page.goto(`http://127.0.0.1:${port}/?v=${tag}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
  await page.evaluate(async () => { localStorage.clear(); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
  await page.click('#btnNew');
  await page.waitForFunction(() => window.__game?.OW?.__debug?.()?.active || document.body.classList.contains('field-play'), { timeout: 20000 }).catch(()=>{});
  await sleep(800);
  const coach = await page.evaluate(() => {
    const el = document.getElementById('onboardCoach');
    if(!el) return false;
    return getComputedStyle(el).display !== 'none' && !el.classList.contains('hidden');
  });
  if(coach) await page.click('#btnCoachOk');
  await page.waitForFunction(() => (document.getElementById('owDlgText')?.dataset?.full || '').length > 30, { timeout: 8000 }).catch(()=>{});
}

async function clearDlg(page, n=8){
  for(let i=0;i<n;i++){
    const st = await page.evaluate(() => {
      const el = document.getElementById('owDlg');
      return { open: !!(el && !el.classList.contains('hidden')), choice: !!document.querySelector('#owDlgChoices button') };
    });
    if(!st.open || st.choice) return st;
    await page.keyboard.press('Enter');
    await sleep(130);
  }
  return { open: true };
}

async function clickChoice(page, re){
  const ready = await page.waitForFunction((src) => {
    return [...document.querySelectorAll('#owDlgChoices button')].some(b => new RegExp(src, 'i').test(b.textContent || ''));
  }, { timeout: 5000 }, re).then(()=>true).catch(()=>false);
  if(!ready) return false;
  return page.evaluate((src) => {
    const b = [...document.querySelectorAll('#owDlgChoices button')].find(x => new RegExp(src, 'i').test(x.textContent || ''));
    if(!b) return false;
    b.click();
    return true;
  }, re);
}

async function talkNpc(page, who){
  for(let attempt=0; attempt<6; attempt++){
    await page.evaluate(() => { try{ window.__game.OW.hideDialogue?.(); }catch(_){} });
    const npc = await page.evaluate((who) => (window.__game.OW.__listNpcs() || []).find(n => String(n.name).includes(who)), who);
    if(!npc){ await sleep(280); continue; }
    await stepNear(page, npc.x, npc.y, 28);
    const name = await page.evaluate((who) => {
      const list = window.__game.OW.__listNpcs() || [];
      const n = list.find(p => String(p.name).includes(who));
      if(!n) return '';
      const h = window.__game.OW.__debug().hero;
      const dist = Math.abs(h.x - n.x) + Math.abs(h.y - n.y);
      return dist <= 1 ? n.name : '';
    }, who);
    if(!name) continue;
    await page.evaluate((nm) => window.__game.OW.__talkTo(nm), name);
    await sleep(200);
    const shown = await page.evaluate(() => document.getElementById('owDlgName')?.textContent || '');
    if(who.split(' ').some(part => shown.includes(part))) return { name };
  }
  return null;
}

async function flags(page){
  return page.evaluate(() => {
    const S = window.__game.S;
    const f = S.campaign?.flags || {};
    return {
      ariaHeard: !!f.ariaHeard,
      ariaPact: !!f.ariaPact,
      ariaRefused: !!f.ariaRefused,
      ariaCourt: !!f.ariaCourt,
      ariaPageTaken: !!f.ariaPageTaken,
      ariaRomance: !!f.ariaRomance,
      ariaRomanceRefused: !!f.ariaRomanceRefused,
      ariaUnderageStop: !!f.ariaUnderageStop,
      ariaSplit: !!f.ariaSplit,
      ariaAdults: !!f.ariaAdults,
      ariaNoRomance: !!f.ariaNoRomance,
      ariaCool: !!f.ariaCool,
      ariaStood: !!f.ariaStood,
      passArrived: !!f.passArrived,
      passClear: !!f.passClear,
      nyxReport: !!f.nyxReport,
      solmirArrived: !!f.solmirArrived,
      solmirSeal: !!f.solmirSeal,
      c3Clear: !!f.c3Clear,
      step: f.ariaStep|0,
      beat: !!f.beat_lesser_fiend,
      party: S.party || [],
      rom: S.romance?.['Heldin Aria'] || null,
    };
  });
}

async function choiceLayout(page){
  return page.evaluate(() => {
    const btns = [...document.querySelectorAll('#owDlgChoices button')];
    const rect = el => { const r = el.getBoundingClientRect(); return { l:r.left, t:r.top, r:r.right, b:r.bottom }; };
    let overlap = 0;
    for(let i=0;i<btns.length;i++) for(let j=i+1;j<btns.length;j++){
      const a = rect(btns[i]), b = rect(btns[j]);
      const x = Math.max(0, Math.min(a.r,b.r) - Math.max(a.l,b.l));
      const y = Math.max(0, Math.min(a.b,b.b) - Math.max(a.t,b.t));
      if(x*y > 20) overlap++;
    }
    const off = btns.filter(el => {
      const r = el.getBoundingClientRect();
      return r.right > innerWidth + 2 || r.bottom > innerHeight + 2 || r.left < -2 || r.width < 8;
    }).map(el => el.textContent);
    return { n: btns.length, overlap, off: off.length, labels: btns.map(b => b.textContent) };
  });
}

async function advanceToChoice(page, re){
  for(let i=0;i<10;i++){
    const hit = await page.evaluate((src) => {
      return [...document.querySelectorAll('#owDlgChoices button')].some(b => new RegExp(src, 'i').test(b.textContent || ''));
    }, re);
    if(hit) return true;
    const open = await page.evaluate(() => {
      const el = document.getElementById('owDlg');
      return !!(el && !el.classList.contains('hidden'));
    });
    if(!open && i > 2) return false;
    await page.keyboard.press('Enter');
    await sleep(180);
  }
  return false;
}

async function walkMark(page, kind){
  await clearDlg(page, 12);
  await page.evaluate(() => window.__game.OW.hideDialogue?.());
  const m = await page.evaluate((kind) => (window.__game.OW.__debug().questMarks || []).find(x => x.kind === kind), kind);
  if(!m) return null;
  await stepNear(page, m.x, m.y);
  await page.evaluate(() => window.__game.OW.hideDialogue?.());
  const dist = await page.evaluate((x, y) => {
    const h = window.__game.OW.__debug().hero;
    return Math.abs(h.x - x) + Math.abs(h.y - y);
  }, m.x, m.y);
  if(dist > 1) return null;
  await page.keyboard.press('Enter');
  await sleep(400);
  return m;
}

async function openFieldSeal(page){
  const door = await page.evaluate(() => (window.__game.OW.__debug().doors || []).find(d => /katakomb/i.test(d.to || d.label || '')));
  if(!door) return { ok:false, reason:'no-door' };
  await stepNear(page, door.x, door.y);
  await page.keyboard.press('ArrowUp');
  await sleep(200);
  const hero = await page.evaluate(() => window.__game.OW.__debug().hero);
  const dx = Math.sign(door.x - hero.x), dy = Math.sign(door.y - hero.y);
  const key = dx < 0 ? 'ArrowLeft' : dx > 0 ? 'ArrowRight' : dy < 0 ? 'ArrowUp' : 'ArrowDown';
  await page.keyboard.down(key);
  await sleep(250);
  await page.keyboard.up(key);
  await sleep(400);
  await clearDlg(page, 4);
  const seal = await page.evaluate(() => (window.__game.OW.__debug().questMarks || []).find(m => m.kind === 'puzzle' || /siegel/i.test(m.label || '')));
  if(!seal) return { ok:false, reason:'no-seal' };
  await stepNear(page, seal.x, seal.y);
  await page.keyboard.press('Enter');
  await sleep(300);
  const clicked = await clickChoice(page, '9-9-9');
  await sleep(200);
  return { ok: clicked, clicked };
}

async function fieldBossWin(page){
  const opened = await openFieldSeal(page);
  if(!opened.ok) return opened;
  await clearDlg(page, 4);
  const boss = await page.evaluate(() => (window.__game.OW.__debug().questMarks || []).find(m => m.kind === 'boss'));
  if(!boss) return { ok:false, reason:'no-boss' };
  await stepNear(page, boss.x, boss.y);
  await page.keyboard.press('Enter');
  await sleep(500);
  const started = await page.waitForFunction(() => !!window.__game?.Battle?.getBattle?.(), { timeout: 8000 }).then(()=>true).catch(()=>false);
  if(!started) return { ok:false, reason:'no-battle' };
  await page.evaluate(() => { window.__game.S.flags.nachklangAuto = true; window.__game.S.cfgAtbMode = 'wait'; const b=window.__game.Battle.getBattle(); if(b) b.atbMode='wait'; });
  const end = await finishFight(page, 90000);
  if(!end.ok || end.result !== 'win') return { ok:false, reason:'not-win', end };
  await page.waitForFunction(() => !!window.__game.S.campaign?.flags?.beat_lesser_fiend, { timeout: 5000 }).catch(()=>{});
  await sleep(300);
  return { ok:true, result:end.result };
}

async function persist(page){
  return page.evaluate(async () => {
    const p = window.__game.save?.();
    if(p?.then) await p;
    return !!localStorage.getItem('isekai_save_v1');
  });
}

async function reloadContinue(page){
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__game?.VER === '75', { timeout: 45000 });
  await page.waitForSelector('#btnContinue', { timeout: 15000 });
  await page.click('#btnContinue');
  await page.waitForFunction(() => window.__game?.OW?.__debug?.()?.active, { timeout: 15000 }).catch(()=>{});
  await sleep(500);
  await clearDlg(page, 8);
}

async function fsShot(page, name){
  try{
    const fs = await import('fs');
    fs.mkdirSync('/opt/cursor/artifacts', { recursive: true });
    await page.screenshot({ path: '/opt/cursor/artifacts/' + name });
  }catch(_){}
}

async function clickLabel(page, src){
  const res = await page.evaluate((src) => {
    const re = new RegExp(src, 'i');
    const b = [...document.querySelectorAll('#choices button')].find(x => re.test(x.textContent || ''));
    if(!b) return { ok:false, labels:[...document.querySelectorAll('#choices button')].map(x => x.textContent) };
    b.click();
    return { ok:true, label:b.textContent };
  }, src);
  if(!res.ok) throw new Error('missing choice '+src+' '+JSON.stringify(res.labels||[]).slice(0,180));
  return res;
}
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
