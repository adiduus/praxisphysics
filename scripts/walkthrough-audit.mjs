// Walkthrough audit (companion to layout-audit.mjs, same CDP harness):
// takes the pendulum's GUIDED walkthrough end to end at each size, doing
// each step's action as a student would. Per step it records the coach
// mark's rect and side, whether it is wholly on screen below the header,
// and whether it touches the pinned apparatus; whether the control the step
// tells the student to use can still be pressed (`reach`: its centre
// hit-tested with elementFromPoint, and how much of it the mark covers);
// and the bench's panel
// heights, compared with SELF before the walkthrough. Runs once with the
// bench's how-to strip up (a first visit: least room under the apparatus
// on a phone) and once with it dismissed. Also exercises BACK, SWITCH TO
// SELF, Escape, and (on a phone) starting from the PROBLEM tab's offer.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { tmpdir } from 'node:os';
import { mkdtempSync } from 'node:fs';

// Usage (against a running server — `npm run build && npm run start`, or
// `npm run dev`):
//   node scripts/walkthrough-audit.mjs [--base http://localhost:3000] [--sizes 1920x1080,1440x900,1280x800,390x844,375x667]
//        [--out scripts/audit-output/walkthrough] [--json scripts/audit-output/walkthrough-audit.json]
//        [--edge <path to msedge/chrome>]
// Drives a headless Chromium (Edge by default on Windows; --edge or
// $AUDIT_BROWSER for anything else) over the DevTools protocol — no
// Playwright dependency. Screenshots go to --out, which is gitignored;
// compare the JSON with scripts/walkthrough-audit.baseline.json, and copy a new run
// over the baseline once a layout change is deliberate.
const { values: opt } = parseArgs({
  options: {
    base: { type: 'string', default: 'http://localhost:3000' },
    sizes: { type: 'string', default: '1920x1080,1440x900,1280x800,390x844,375x667' },
    out: { type: 'string', default: 'scripts/audit-output/walkthrough' },
    json: { type: 'string', default: 'scripts/audit-output/walkthrough-audit.json' },
    edge: { type: 'string', default: process.env.AUDIT_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' },
  },
});
const edge = opt.edge;
const profile = mkdtempSync(join(tmpdir(), 'praxis-audit-'));
const base = opt.base;
const outDir = opt.out;
const outJson = opt.json;
const ONLY = opt.sizes.split(',');
mkdirSync(dirname(outJson), { recursive: true });

mkdirSync(outDir, { recursive: true });
const proc = spawn(edge, ['--headless=new', '--disable-gpu', '--remote-debugging-port=9341', `--user-data-dir=${profile}`, '--window-size=1920,1080', 'about:blank']);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let t; for (let i = 0; i < 50; i++) { try { t = await (await fetch('http://127.0.0.1:9341/json')).json(); break; } catch { await sleep(200); } }
const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = new Map(); const errs = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.method === 'Runtime.exceptionThrown') errs.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Runtime.enable');
const ev = async (e) => { const r = await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error((r.result.exceptionDetails.exception?.description || e) + ' | PAGE ERRS: ' + JSON.stringify(errs).slice(0, 3000)); return r.result.result.value; };
const mouse = (type, x, y) => send('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1 });
const clickText = (sel, txt) => ev(`(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find(b => b.textContent.trim() === ${JSON.stringify(txt)}); if (!b) throw new Error('no ' + ${JSON.stringify(txt)} + ' in ' + ${JSON.stringify(sel)}); b.click(); })()`);

const SIZES = ONLY.map((s) => {
  const [w, h] = s.split('x').map(Number);
  return { w, h, mobile: w < 900 }; // 900px: where the workspace's two columns become tabs
});

// Heights of everything laid out in the bench and data panes.
const HEIGHTS = `(() => {
  const q = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.height ? Math.round(r.height * 10) / 10 : 'hidden'; };
  return { pinned: q('.bench-pinned'), canvas: q('#pendulum-canvas'), controls: q('.pendulum-controls'), hint: q('.bench-hint'), menu: q('.instrument-menu'), lab: q('.pendulum-lab'), simPane: q('[data-pane="sim"]'), dataPane: q('[data-pane="data"]'), problemPane: q('[data-pane="problem"]'), workspace: q('.pendulum-workspace'), doc: document.documentElement.scrollHeight };
})()`;

const MARK = `(() => {
  const pop = document.querySelector('.coach-mark');
  if (!pop) return { present: false };
  const r = pop.getBoundingClientRect();
  const head = document.querySelector('header').getBoundingClientRect().bottom;
  const pinEl = document.querySelector('.bench-pinned');
  const pin = pinEl.getBoundingClientRect();
  const pinShown = pin.height > 0;
  const cvs = document.getElementById('pendulum-canvas').getBoundingClientRect();
  const hit = (b) => r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
  return {
    present: true,
    count: pop.querySelector('.coach-count')?.textContent,
    buttons: [...pop.querySelectorAll('button')].map((b) => b.textContent.trim() + (b.disabled ? '(disabled)' : '')),
    side: pop.dataset.side, visible: getComputedStyle(pop).visibility,
    // AnchoredPopover's cap when no side has room for all of it; the
    // actions must still be on screen.
    capped: pop.style.maxHeight || null,
    actionsOnScreen: (() => { const a = pop.querySelector('.coach-actions')?.getBoundingClientRect(); return !!a && a.top >= r.top - 0.5 && a.bottom <= Math.min(r.bottom, innerHeight) + 0.5; })(),
    rect: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)],
    pinned: pinShown ? [Math.round(pin.left), Math.round(pin.top), Math.round(pin.right), Math.round(pin.bottom)] : 'hidden',
    onScreen: r.left >= 0 && r.right <= document.documentElement.clientWidth && r.top >= head - 0.5 && r.bottom <= innerHeight + 0.5,
    overlapsApparatus: pinShown && hit(pin),
    overlapsCanvas: cvs.height > 0 && hit(cvs),
    activeTab: document.querySelector('.pendulum-workspace').dataset.activeTab,
    // A question step: the question shows, its answer stays closed.
    question: !!pop.querySelector('.guide-q'),
    answerOpen: pop.querySelector('.guide-q details')?.open ?? null,
    instrumentNoteOpen: !!document.querySelector('.instrument-popover'),
  };
})()`;

// The control each step tells the student to use, by step number: an
// element (a JS expression), or for what exists only as canvas pixels, a
// viewport point from the canvas's own transform (as geom() below). A
// mark that is on screen and clear of the apparatus can still sit over
// the very button it names; MARK can't see that, and the audit's own
// clicks (.click()) go straight through it.
const btnText = (sel, txt) => `[...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => b.textContent.trim() === ${JSON.stringify(txt)})`;
const GEOM = `(() => { const r = document.getElementById('pendulum-canvas').getBoundingClientRect(); const pxPerM = Math.min(r.height * 0.86 / 0.55, r.width * 0.86 / 1.0); const L = Number(document.querySelector('.length-control input').value) + 0.02; return { x: r.left + r.width / 2, y: r.top + r.height * 0.1, pxPerM, L }; })()`;
const CONTROLS = {
  2: [['SCALE', { el: btnText('.instrument-menu button', 'SCALE') }]],
  3: [['length slider', { el: `document.querySelector('.length-control input')` }]],
  // Where the audit presses (step 4's action below), 10 cm above the bob.
  4: [['scale', { pt: `(() => { const g = ${GEOM}; return { x: g.x + 0.035 * g.pxPerM, y: g.y + (g.L - 0.1) * g.pxPerM }; })()` }]],
  5: [['bob', { pt: `(() => { const g = ${GEOM}; return { x: g.x, y: g.y + g.L * g.pxPerM }; })()` }]],
  6: [['RELEASE', { el: btnText('.pendulum-actions button', 'RELEASE') }], ['HANG STRAIGHT', { el: btnText('.pendulum-actions button', 'HANG STRAIGHT') }]],
  7: [['STOPWATCH', { el: btnText('.instrument-menu button', 'STOPWATCH') }]],
  8: [['START', { el: btnText('.instrument-panels button', 'START') }]],
  9: [['+ COL', { el: btnText('[data-pane="data"] button', '+ COL') }]],
  10: [['first cell', { el: `document.querySelector('[data-pane="data"] .pendulum-table tbody td input')` }], ['+ ROW', { el: btnText('[data-pane="data"] button', '+ ROW') }]],
  11: [['+ COL', { el: btnText('[data-pane="data"] button', '+ COL') }], ['column name', { el: `document.querySelector('[data-pane="data"] .col-label')` }]],
  12: [['+ ROW', { el: btnText('[data-pane="data"] button', '+ ROW') }]],
};
// For each control: whether its centre hit-tests to it (or inside it), what
// is there instead, and the share of it (an 8x8 grid of points over its
// on-screen part; a 24 px square for a canvas point) that lands on the
// coach mark. `covered` is the fail: the centre is under the mark.
const REACH = (list) => `(() => {
  const mark = document.querySelector('.coach-mark');
  const head = document.querySelector('header').getBoundingClientRect().bottom;
  const vw = document.documentElement.clientWidth;
  const name = (h) => !h ? null : mark && mark.contains(h) ? 'coach-mark' : h.tagName.toLowerCase() + (h.className && typeof h.className === 'string' ? '.' + h.className.trim().split(/\\s+/).join('.') : '');
  return [${list.map(([label, c]) => `(() => {
    const label = ${JSON.stringify(label)};
    let el, r;
    ${c.el ? `el = ${c.el}; if (!el) return { label, present: false }; r = el.getBoundingClientRect();` : `const p = ${c.pt}; el = document.getElementById('pendulum-canvas'); r = { left: p.x - 12, right: p.x + 12, top: p.y - 12, bottom: p.y + 12 };`}
    const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2;
    const onScreen = cx >= 0 && cx <= vw && cy >= head && cy <= innerHeight;
    const h = onScreen ? document.elementFromPoint(cx, cy) : null;
    const l = Math.max(r.left, 0), t = Math.max(r.top, head), rr = Math.min(r.right, vw), b = Math.min(r.bottom, innerHeight);
    let n = 0, byMark = 0;
    if (rr > l && b > t) for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      const e = document.elementFromPoint(l + (rr - l) * (i + 0.5) / 8, t + (b - t) * (j + 0.5) / 8);
      n++; if (mark && e && mark.contains(e)) byMark++;
    }
    return { label, present: true, at: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], onScreen, hit: el.contains(h), hitIs: name(h), covered: !!(mark && h && mark.contains(h)), coveredShare: n ? Math.round((byMark / n) * 100) / 100 : null };
  })()`).join(',')}];
})()`;

// Type into the table the way a keystroke does (React's onChange needs the
// native value setter plus an input event).
const TYPE = `(el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }`;
// Fill `rows` (arrays of [col 1, col 2] values) into the table's first rows,
// adding rows with + ROW as needed.
async function fillTable(rows) {
  for (let i = 0; i < rows.length; i++) {
    const have = await ev(`document.querySelectorAll('[data-pane="data"] .pendulum-table tbody tr').length`);
    if (have <= i) { await clickText('[data-pane="data"] .pendulum-add-row', '+ ROW'); await sleep(80); }
    await ev(`(() => { const type = ${TYPE}; const tr = document.querySelectorAll('[data-pane="data"] .pendulum-table tbody tr')[${i}]; const ins = tr.querySelectorAll('td input'); ${JSON.stringify(rows[i])}.forEach((v, j) => { if (v !== null) type(ins[j], v); }); })()`);
    await sleep(60);
  }
}
const partPill = (label) => clickText('.pendulum-part-switch button', label);

const stored = () => ev(`localStorage.getItem('praxis:pendulum-mode')`);

// The canvas's own transform (PendulumCanvas.js resize()).
const geom = () => ev(`(() => { const r = document.getElementById('pendulum-canvas').getBoundingClientRect(); const pxPerM = Math.min(r.height * 0.86 / 0.55, r.width * 0.86 / 1.0); const L = Number(document.querySelector('.length-control input').value) + 0.02; return { x: r.left + r.width / 2, y: r.top + r.height * 0.1, pxPerM, L }; })()`);

const results = {};
async function run(s, hintUp) {
  const tag = `${s.w}x${s.h}-${hintUp ? 'hint' : 'nohint'}`;
  await send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: s.mobile ? 2 : 1, mobile: s.mobile });
  await send('Page.navigate', { url: base + '/simulations/pendulum' });
  await sleep(2500);
  await ev(`Object.keys(localStorage).filter(k => k.startsWith('praxis:')).forEach(k => localStorage.removeItem(k))`);
  await send('Page.reload');
  await sleep(3500);
  await ev(`document.querySelectorAll('nextjs-portal').forEach((e) => e.remove())`);
  // What a student sees on load: on a phone the page opens on PROBLEM, so
  // the offer must be there; on a wide screen it's the bench's own offer.
  const onLoad = await ev(`(() => {
    const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; };
    return { activeTab: document.querySelector('.pendulum-workspace').dataset.activeTab, problemOffer: vis(document.querySelector('.walkthrough-offer-problem')), benchOffer: vis(document.querySelector('.walkthrough-offer')), problemOfferText: document.querySelector('.walkthrough-offer-problem')?.textContent };
  })()`);
  if (s.mobile) await clickText('.pendulum-tabs button', 'SIMULATION');
  if (!hintUp) await ev(`document.querySelector('.bench-hint button')?.click()`);
  await sleep(300);
  const out = { loadsIn: await stored(), onLoad, offerPresent: await ev(`!!document.querySelector('.walkthrough-offer')`), steps: [] };
  results[tag] = out; // kept even if a later step fails
  out.self = await ev(HEIGHTS);
  // The offer is absolutely positioned: the bench must be the same height without it.
  await ev(`document.querySelector('.walkthrough-offer').style.display = 'none'`);
  out.selfWithoutOffer = await ev(HEIGHTS);
  await ev(`document.querySelector('.walkthrough-offer').style.display = ''`);
  out.offerRect = await ev(`(() => { const r = document.querySelector('.walkthrough-offer').getBoundingClientRect(); const c = document.getElementById('pendulum-canvas').getBoundingClientRect(); return { offer: [Math.round(r.left - c.left), Math.round(r.top - c.top), Math.round(r.right - c.left), Math.round(r.bottom - c.top)], canvas: [Math.round(c.width), Math.round(c.height)] }; })()`);

  await clickText('.walkthrough-offer', 'New to this bench? Take the walkthrough');
  const snap = async (label) => {
    await sleep(500);
    const mark = await ev(MARK);
    const n = Number(mark.count?.match(/STEP (\d+)/)?.[1]);
    const m = { label, mark, reach: CONTROLS[n] ? await ev(REACH(CONTROLS[n])) : null, heights: await ev(HEIGHTS), stored: await stored() };
    out.steps.push(m);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(outDir, `${tag}-${String(out.steps.length).padStart(2, '0')}-${label}.png`), Buffer.from(shot.result.data, 'base64'));
    // A question step, with its answer opened: the mark grows, and must
    // re-place itself to stay wholly on screen without covering the
    // control. Closed again after, as the step found it.
    if (mark.question) {
      await ev(`document.querySelector('.coach-mark .guide-q summary').click()`);
      await sleep(500);
      const open = await ev(MARK);
      m.withAnswer = { rect: open.rect, side: open.side, onScreen: open.onScreen, capped: open.capped, actionsOnScreen: open.actionsOnScreen, overlapsApparatus: open.overlapsApparatus, answerOpen: open.answerOpen, reach: CONTROLS[n] ? await ev(REACH(CONTROLS[n])) : null };
      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(outDir, `${tag}-${String(out.steps.length).padStart(2, '0')}-${label}-answer.png`), Buffer.from(shot2.result.data, 'base64'));
      await ev(`document.querySelector('.coach-mark .guide-q summary').click()`);
      await sleep(500);
    }
    return m;
  };

  await snap('step1');
  // Starting collapses the how-to strip (BenchHint's `collapse`): with it
  // up, a phone's apparatus leaves a coach mark nowhere to go.
  out.hintAfterStart = await ev(`document.querySelector('.bench-hint') ? 'strip' : document.querySelector('.bench-hint-reopen') ? 'collapsed to ?' : 'none'`);
  await clickText('.coach-mark button', 'NEXT');
  await snap('step2');
  await clickText('.instrument-menu button', 'SCALE');
  await snap('step3');
  // BACK from 3: step 2 is already done (the scale is on), so it should
  // wait on NEXT rather than skip or hang.
  await clickText('.coach-mark button', 'BACK');
  await snap('back-to-step2');
  await clickText('.coach-mark button', 'NEXT');
  await snap('step3-again');
  await ev(`(() => { const i = document.querySelector('.length-control input'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(i, '0.45'); i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await snap('step4');
  // Press and hold on the scale 10 cm above the bob: at the bob's own
  // height a phone's bob press radius reaches over the scale, and a press
  // there grabs the bob (docs/conventions.md: bob first, then the scale).
  let g = await geom();
  const sx = g.x + (0.025 + 0.01) * g.pxPerM, sy = g.y + (g.L - 0.1) * g.pxPerM;
  await mouse('mouseMoved', sx, sy); await mouse('mousePressed', sx, sy);
  await sleep(700);
  await mouse('mouseReleased', sx, sy);
  await snap('step5');
  // Drag the bob out to ~12°.
  g = await geom();
  const at = (deg) => ({ x: g.x + g.L * g.pxPerM * Math.sin((deg * Math.PI) / 180), y: g.y + g.L * g.pxPerM * Math.cos((deg * Math.PI) / 180) });
  let p = at(0);
  await mouse('mouseMoved', p.x, p.y); await mouse('mousePressed', p.x, p.y);
  for (let d = 2; d <= 12; d += 2) { p = at(d); await mouse('mouseMoved', p.x, p.y); await sleep(20); }
  await mouse('mouseReleased', p.x, p.y);
  await snap('step6');
  await clickText('.pendulum-controls button', 'RELEASE');
  await snap('step7');
  // The stopwatch's note must wait while the walkthrough is up.
  await clickText('.instrument-menu button', 'STOPWATCH');
  await snap('step8');
  await clickText('.instrument-panels button', 'START');
  await sleep(1200);
  await clickText('.instrument-panels button', 'STOP');
  await snap('step9');
  await clickText('.coach-mark button', 'NEXT');
  await snap('step10');
  // Five timings at one length.
  await fillTable([['0.37', '12.21'], ['0.37', '12.34'], ['0.37', '12.18'], ['0.37', '12.40'], ['0.37', '12.27']]);
  await snap('step11');
  await ev(`(() => { const type = ${TYPE}; type(document.querySelector('[data-pane="data"] .col-label'), 'L / m'); })()`);
  const step12 = await snap('step12');
  // The last step offers NEXT before its condition holds: the length-column
  // match is a guess, never the only way to finish.
  out.lastStepNext = step12.mark.buttons.includes('NEXT');
  // Five more lengths: six distinct in the length column ends it.
  await fillTable([null, null, null, null, null, ['0.30', '11.0'], ['0.25', '10.1'], ['0.20', '9.0'], ['0.45', '13.5'], ['0.50', '14.2']].map((r) => r ?? [null, null]));
  await sleep(500);
  // Panel heights through GUIDED: the same at every step as at step 1 (and,
  // with the strip already dismissed, as in SELF before starting).
  const KEYS = ['pinned', 'canvas', 'controls', 'hint', 'menu'];
  const ref = hintUp ? out.steps[0].heights : out.self;
  // Every step whose named control sits under its own coach mark, with the
  // answer closed or open; every one that can't be pressed for any reason
  // (under the apparatus or the header, off screen); and every mark that
  // leaves the screen once its answer is open.
  const both = (st) => [...(st.reach ?? []).map((c) => ['', c]), ...(st.withAnswer?.reach ?? []).map((c) => [' (answer open)', c])];
  out.controlsCovered = out.steps.flatMap((st) => both(st).filter(([, c]) => c.covered).map(([w, c]) => `${st.label}${w}:${c.label} centre under the mark, ${Math.round(c.coveredShare * 100)}% covered`));
  out.controlsUnreachable = out.steps.flatMap((st) => both(st).filter(([, c]) => c.present && !c.hit).map(([w, c]) => `${st.label}${w}:${c.label} ${c.onScreen ? 'under ' + c.hitIs : 'off screen'}`));
  out.answerOffScreen = out.steps.filter((st) => st.withAnswer && !(st.withAnswer.onScreen && st.withAnswer.actionsOnScreen)).map((st) => `${st.label}: ${JSON.stringify(st.withAnswer.rect)}`);
  out.heightChanges = out.steps.flatMap((st) => KEYS.filter((k) => st.heights[k] !== 'hidden' && ref[k] !== 'hidden' && st.heights[k] !== ref[k]).map((k) => `${st.label}:${k} ${ref[k]}->${st.heights[k]}`));
  out.after = { mark: await ev(MARK), stored: await stored(), offerBack: await ev(`!!document.querySelector('.walkthrough-offer')`), heights: await ev(HEIGHTS) };
  // Part B: no offer anywhere, and a walkthrough in progress on Part A shows
  // nothing on B, then comes back on A.
  if (s.mobile) await clickText('.pendulum-tabs button', 'SIMULATION');
  await sleep(300);
  await clickText('.walkthrough-offer', 'New to this bench? Take the walkthrough');
  await sleep(400);
  await partPill('PART B'); await sleep(500);
  const onB = { benchOffer: await ev(`!!document.querySelector('.walkthrough-offer')`), problemOffer: await ev(`!!document.querySelector('.walkthrough-offer-problem')`), mark: (await ev(MARK)).present };
  await partPill('PART A'); await sleep(500);
  out.partB = { ...onB, markBackOnA: (await ev(MARK)).present, stored: await stored() };
  await clickText('.coach-mark button', 'SWITCH TO SELF'); await sleep(300);
  // A way out mid-walkthrough: retake, then SWITCH TO SELF from step 1.
  if (s.mobile) await clickText('.pendulum-tabs button', 'SIMULATION');
  await sleep(300);
  await clickText('.walkthrough-offer', 'New to this bench? Take the walkthrough');
  await sleep(400);
  await clickText('.coach-mark button', 'SWITCH TO SELF');
  await sleep(300);
  out.exit = { mark: await ev(MARK), stored: await stored() };
  // Escape is the keyboard's way out, the same as SWITCH TO SELF.
  await clickText('.walkthrough-offer', 'New to this bench? Take the walkthrough');
  await sleep(400);
  const beforeEscape = (await ev(MARK)).present;
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await sleep(300);
  out.escape = { markBefore: beforeEscape, markAfter: (await ev(MARK)).present, stored: await stored() };
  // Phone: start from the PROBLEM tab's offer. It should switch to
  // SIMULATION with step 1 up; and the problem pane must be the same height
  // in GUIDED (where the offer reads "Back to the walkthrough") as in SELF.
  if (s.mobile) {
    const PROBLEM_H = `document.querySelector('[data-pane="problem"]').getBoundingClientRect().height`;
    await clickText('.pendulum-tabs button', 'PROBLEM'); await sleep(300);
    const selfH = await ev(PROBLEM_H);
    await ev(`document.querySelector('.walkthrough-offer-problem').click()`); await sleep(500);
    const started = await ev(MARK);
    await clickText('.pendulum-tabs button', 'PROBLEM'); await sleep(400);
    const guidedH = await ev(PROBLEM_H);
    const markHiddenOnProblem = await ev(`(() => { const p = document.querySelector('.coach-mark'); return !p || getComputedStyle(p).visibility === 'hidden'; })()`);
    const backText = await ev(`document.querySelector('.walkthrough-offer-problem').textContent`);
    await ev(`document.querySelector('.walkthrough-offer-problem').click()`); await sleep(500);
    out.fromProblem = { started: { tab: started.activeTab, count: started.count, visible: started.visible, onScreen: started.onScreen, overlapsApparatus: started.overlapsApparatus }, problemPaneSelf: selfH, problemPaneGuided: guidedH, markHiddenOnProblem, backText, backTo: (await ev(MARK)).activeTab };
    await clickText('.coach-mark button', 'SWITCH TO SELF'); await sleep(300);
  }
  results[tag] = out;
}

// Part B's T₀ reveal reads the bench's length (lib/pendulum/benchLength.js),
// which only PendulumLab publishes: a lab that stops publishing it commits
// NaN and marks every T₀ wrong. A pass of its own, from a fresh load, so a
// walkthrough that fails can't hide it: commit one T₀ and check the
// reveal's true value is a number.
async function t0Check(s) {
  await send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: s.mobile ? 2 : 1, mobile: s.mobile });
  await send('Page.navigate', { url: base + '/simulations/pendulum' });
  await sleep(2500);
  await ev(`Object.keys(localStorage).filter(k => k.startsWith('praxis:')).forEach(k => localStorage.removeItem(k))`);
  await send('Page.reload');
  await sleep(3500);
  await partPill('PART B'); await sleep(400);
  await ev(`(() => { const f = [...document.querySelectorAll('form.answer-box')].find((b) => /T/.test(b.textContent)); const [v, u] = f.querySelectorAll('input'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(v, '1.30'); v.dispatchEvent(new Event('input', { bubbles: true })); set.call(u, '0.01'); u.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await sleep(200);
  await ev(`[...document.querySelectorAll('form.answer-box')].find((b) => /T/.test(b.textContent)).querySelector('button[type=submit]').click()`);
  await sleep(400);
  const reveal = await ev(`document.querySelector('.answer-committed')?.textContent ?? ''`);
  const used = reveal.split('uses')[1]?.match(/=\s*(\S+)/)?.[1] ?? null;
  return { used, finite: used !== null && Number.isFinite(Number(used)) };
}

for (const s of SIZES) for (const hintUp of [true, false]) {
  try { await run(s, hintUp); } catch (e) { results[`${s.w}x${s.h}-${hintUp ? 'hint' : 'nohint'}-FAILED`] = { error: String(e).slice(0, 400), at: await ev(MARK) }; }
}
for (const s of SIZES) {
  try { results[`${s.w}x${s.h}-t0Reveal`] = await t0Check(s); } catch (e) { results[`${s.w}x${s.h}-t0Reveal-FAILED`] = { error: String(e).slice(0, 400) }; }
}

writeFileSync(outJson, JSON.stringify({ results, errs }, null, 1));
console.log(JSON.stringify({ errs }));
ws.close(); proc.kill();
