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
