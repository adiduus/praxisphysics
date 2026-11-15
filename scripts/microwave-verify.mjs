// Checks the microwave model against the conditions the guide will rely on,
// then runs simulated Part A and Part B measurements through the modelled
// instruments (noise, dark current, zero errors, resolutions) and confirms
// the answers come back within the uncertainty those instruments imply.
// Touches no app code. Run with:
//   node scripts/microwave-verify.mjs
import {
  LAMBDA,
  LAMBDA_UNCERTAINTY,
  SLAB_N,
  SLAB_T,
  PRISM_N,
  PRISM_THETA,
  slabReflectance,
  waveNumber,
  decayConstant,
  gapTransmission,
  indexFromDecay,
  detectorSignal,
} from '../lib/microwave/model.mjs';
import {
  createMultimeter,
  createGoniometer,
  createCaliper,
  createRule,
  DARK_MIN_MA,
  DARK_MAX_MA,
  GONIOMETER_RESOLUTION,
  CALIPER_RESOLUTION,
  CALIPER_MAX_ZERO,
  RULE_RESOLUTION,
} from '../lib/microwave/instruments.mjs';

const RAD = Math.PI / 180;
const REPEATS = 3; // readings averaged at each setting, as the guide asks
const SCAN_FROM = 30; // Part A's goniometer scan, degrees
const SCAN_TO = 70;

// Seeded noise, so a run is reproducible.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ordinary least squares, y = intercept + slope*x, with the slope's
// standard error from the residual scatter.
function linfit(xs, ys) {
  const n = xs.length;
  const mx = xs.reduce((a, x) => a + x, 0) / n;
  const my = ys.reduce((a, y) => a + y, 0) / n;
  const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const sxy = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const ss = xs.reduce((a, x, i) => a + (ys[i] - intercept - slope * x) ** 2, 0);
  const slopeSE = Math.sqrt(ss / (n - 2) / sxx);
  return { slope, intercept, slopeSE };
}

function mean(xs) {
  return xs.reduce((a, x) => a + x, 0) / xs.length;
}

function readMean(meter, trueMa) {
  return mean(Array.from({ length: REPEATS }, () => meter.read(trueMa)));
}

function pctErr(fit, truth) {
  return ((fit - truth) / truth) * 100;
}

const fmt = (x, d = 4) => x.toFixed(d);
const signed = (x, d = 4) => (x >= 0 ? '+' : '') + x.toFixed(d);
const quad = (...xs) => Math.sqrt(xs.reduce((a, x) => a + x * x, 0));

// Spread the session-seeded systematics across their ranges rather than
// trusting one draw: the corners and a few points between.
const sessions = [];
for (let i = 0; i < 9; i++) {
  const u = i / 8;
  sessions.push({
    seed: 1000 + i,
    darkMa: DARK_MIN_MA + u * (DARK_MAX_MA - DARK_MIN_MA),
    zeroCm: (2 * ((i * 7) % 9) / 8 - 1) * CALIPER_MAX_ZERO,
  });
}

let failures = 0;
function check(ok, label) {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`);
}

// Part A's analysis, shared by the exact check and the simulated run.
// Order of interference at an angle: N = (2t/lambda)*sqrt(n^2 - sin^2(theta)).
function order(thetaDeg, n = SLAB_N, t = SLAB_T, lambda = LAMBDA) {
  const s = Math.sin(thetaDeg * RAD);
  return ((2 * t) / lambda) * Math.sqrt(n * n - s * s);
}
// Two consecutive minima, theta1 < theta2, of orders m and m - 1:
// 2m - 1 = 4t^2 (sin^2 theta2 - sin^2 theta1) / lambda^2.
function twiceOrderLessOne(theta1, theta2, t, lambda = LAMBDA) {
  const s1 = Math.sin(theta1 * RAD);
  const s2 = Math.sin(theta2 * RAD);
  return (4 * t * t * (s2 * s2 - s1 * s1)) / (lambda * lambda);
}
function indexFromMinimum(thetaDeg, t, m, lambda = LAMBDA) {
  const q = (m * lambda) / (2 * t);
  const s = Math.sin(thetaDeg * RAD);
  return Math.sqrt(q * q + s * s);
}

// ---------------------------------------------------------------------------
// 1. Two consecutive minima in the scan range
// ---------------------------------------------------------------------------
console.log(`=== Check 1: minima of R(theta), ${SCAN_FROM}-${SCAN_TO} deg, slab t = ${SLAB_T} cm ===`);
console.log(`order N at ${SCAN_FROM} deg ${fmt(order(SCAN_FROM), 2)}, at ${SCAN_TO} deg ${fmt(order(SCAN_TO), 2)}   (expected 10.25, 8.59)`);

// The angle at which N is a given order.
function angleFor(N) {
  const q = (N * LAMBDA) / (2 * SLAB_T);
  return Math.asin(Math.sqrt(SLAB_N * SLAB_N - q * q)) / RAD;
}

const STEP = 0.01;
const grid = [];
for (let deg = SCAN_FROM; deg <= SCAN_TO + 1e-9; deg += STEP) grid.push([deg, slabReflectance(deg)]);
const minima = [];
for (let i = 1; i < grid.length - 1; i++) {
  const [deg, R] = grid[i];
  if (R < grid[i - 1][1] && R <= grid[i + 1][1]) minima.push({ deg, R });
}
console.log('Local minima of the modelled R(theta):');
for (const e of minima) console.log(`  ${fmt(e.deg, 2).padStart(6)} deg   R = ${e.R.toExponential(2)}   N = ${fmt(order(e.deg), 4)}`);

check(minima.length === 2, `exactly two minima in the scan range (found ${minima.length})`);
for (const [N, expected] of [[10, 36.46], [9, 59.12]]) {
  const at = angleFor(N);
  const found = minima.find((e) => Math.abs(e.deg - at) <= STEP);
  check(
    !!found && found.R < 1e-6 && Math.abs(at - expected) < 0.05,
    `N = ${N} at ${fmt(at, 2)} deg (expected ${expected}), R = 0 there`
  );
}
const exact2m1 = twiceOrderLessOne(angleFor(10), angleFor(9), SLAB_T);
const exactM = Math.round((exact2m1 + 1) / 2);
const n1 = indexFromMinimum(angleFor(10), SLAB_T, exactM);
const n2 = indexFromMinimum(angleFor(9), SLAB_T, exactM - 1);
console.log(`2m - 1 = ${fmt(exact2m1, 6)}   m = ${exactM}   n from theta1 ${fmt(n1, 6)}, from theta2 ${fmt(n2, 6)}`);
check(Math.abs(exact2m1 - 19) < 1e-9 && exactM === 10, '2m - 1 is exactly 19, so m = 10');
check(Math.abs(n1 - SLAB_N) < 1e-9 && Math.abs(n2 - SLAB_N) < 1e-9, 'either minimum returns SLAB_N');

// ---------------------------------------------------------------------------
// 2. A simulated Part A run finds m and recovers n
// ---------------------------------------------------------------------------
console.log(`\n=== Check 2: simulated Part A run, goniometer scan ${SCAN_FROM}-${SCAN_TO} deg ===`);

// Error budget for n, averaged over the two minima: dn/dx * (one
// resolution step of x) at each, taken as fully correlated between them
// (the same t and lambda go into both).
function partABudget(dt) {
  const terms = [[angleFor(10), 10], [angleFor(9), 9]].map(([theta, m]) => {
    const s = Math.sin(theta * RAD);
    const c = Math.cos(theta * RAD);
    const q2 = ((m * LAMBDA) / (2 * SLAB_T)) ** 2;
    return {
      theta: ((s * c) / SLAB_N) * GONIOMETER_RESOLUTION * RAD,
      t: (q2 / (SLAB_N * SLAB_T)) * dt,
      lambda: (q2 / (SLAB_N * LAMBDA)) * LAMBDA_UNCERTAINTY,
    };
  });
  return {
    theta: mean(terms.map((x) => x.theta)),
    t: mean(terms.map((x) => x.t)),
    lambda: mean(terms.map((x) => x.lambda)),
  };
}

const budgetCaliper = partABudget(CALIPER_RESOLUTION);
const budgetRule = partABudget(RULE_RESOLUTION);
console.log(`Budget for n (one resolution step each, lambda at its stated ±${LAMBDA_UNCERTAINTY}):`);
console.log(`  term          caliper    rule`);
console.log(`  theta         ${fmt(budgetCaliper.theta)}     ${fmt(budgetRule.theta)}`);
console.log(`  t             ${fmt(budgetCaliper.t)}     ${fmt(budgetRule.t)}`);
console.log(`  lambda        ${fmt(budgetCaliper.lambda)}     ${fmt(budgetRule.lambda)}`);
const totalCaliper = quad(budgetCaliper.theta, budgetCaliper.t, budgetCaliper.lambda);
const totalRule = quad(budgetRule.theta, budgetRule.t, budgetRule.lambda);
console.log(`  total (quad)  ${fmt(totalCaliper)}     ${fmt(totalRule)}   (rule/caliper = ${fmt(totalRule / totalCaliper, 2)}x)`);
// The simulation reads lambda as exactly its true value, so the lambda term
// can't show up in the recovered n; the test is against the terms it does
// exercise.
const tolCaliper = quad(budgetCaliper.theta, budgetCaliper.t);
const tolRule = quad(budgetRule.theta, budgetRule.t);

function runPartA(session, thicknessTool) {
  const random = mulberry32(session.seed);
  const meter = createMultimeter({ darkMa: session.darkMa, random });
  const gon = createGoniometer();
  const caliper = createCaliper({ zeroCm: session.zeroCm });

  // Systematics found the way the student finds them: block the beam,
  // close the jaws. The goniometer has no zero offset to find.
  const dark = mean(Array.from({ length: 5 }, () => meter.read(0)));
  const t =
    thicknessTool === 'rule' ? createRule().read(SLAB_T) : caliper.read(SLAB_T) - caliper.read(0);

  // Step the table through each goniometer division across the scan.
  const scan = [];
  for (let reading = SCAN_FROM; reading <= SCAN_TO + 1e-9; reading += GONIOMETER_RESOLUTION) {
    const S = readMean(meter, detectorSignal(slabReflectance(reading))) - dark;
    scan.push({ theta: gon.read(reading), S });
  }

  // The two deepest dips: readings lowest within 3 deg either side, the
  // two lowest of those, in angle order.
  const reach = Math.round(3 / GONIOMETER_RESOLUTION);
  const dips = scan.filter((p, i) =>
    scan.slice(Math.max(0, i - reach), i + reach + 1).every((o) => o === p || p.S < o.S)
  );
  const [theta1, theta2] = dips
    .sort((a, b) => a.S - b.S)
    .slice(0, 2)
    .map((p) => p.theta)
    .sort((a, b) => a - b);

  const raw = twiceOrderLessOne(theta1, theta2, t);
  const m = Math.round((raw + 1) / 2);
  const n = mean([indexFromMinimum(theta1, t, m), indexFromMinimum(theta2, t, m - 1)]);
  return { t, theta1, theta2, raw, m, n };
}

console.log('\ndark(mA)  cal0(cm)  |  t(cm)    theta1   theta2   2m-1     m    n         dev       (caliper)');
let worstCaliper = 0;
let worstOrderMiss = 0;
let allTen = true;
const caliperDevs = [];
for (const s of sessions) {
  const r = runPartA(s, 'caliper');
  const dev = r.n - SLAB_N;
  caliperDevs.push(dev);
  worstCaliper = Math.max(worstCaliper, Math.abs(dev));
  worstOrderMiss = Math.max(worstOrderMiss, Math.abs(r.raw - 19));
  allTen &&= r.m === 10;
  console.log(
    `${fmt(s.darkMa, 3)}     ${signed(s.zeroCm, 4)}   |  ${fmt(r.t, 3)}   ${fmt(r.theta1, 2)}    ${fmt(r.theta2, 2)}    ${fmt(r.raw, 3)}   ${r.m}   ${fmt(r.n)}    ${signed(dev)}`
  );
}
check(allTen, `m = 10 from the data in every session (2m - 1 within ${fmt(worstOrderMiss, 3)} of 19; rounding fails at 1)`);
check(worstCaliper <= tolCaliper, `caliper: worst |dev| ${fmt(worstCaliper)} <= ${fmt(tolCaliper)} (theta and t terms)`);

let worstRule = 0;
let ruleTen = true;
const ruleDevs = [];
for (const s of sessions) {
  const r = runPartA(s, 'rule');
  ruleDevs.push(r.n - SLAB_N);
  worstRule = Math.max(worstRule, Math.abs(r.n - SLAB_N));
  ruleTen &&= r.m === 10;
}
console.log(`rule:    thickness reads ${fmt(createRule().read(SLAB_T), 2)} cm, worst |dev| ${fmt(worstRule)}`);
check(ruleTen && worstRule <= tolRule, `rule: m = 10 every session, worst |dev| ${fmt(worstRule)} <= ${fmt(tolRule)} (theta and t terms)`);

// The choice of tool has to show in the answer, not only in the budget:
// the same sessions, the same noise, only the thickness reading differs.
const meanAbs = (xs) => mean(xs.map(Math.abs));
const ruleWorseIn = ruleDevs.filter((d, i) => Math.abs(d) > Math.abs(caliperDevs[i])).length;
console.log(
  `mean |dev|: caliper ${fmt(meanAbs(caliperDevs))}, rule ${fmt(meanAbs(ruleDevs))}   ` +
    `mean dev: caliper ${signed(mean(caliperDevs))}, rule ${signed(mean(ruleDevs))}   ` +
    `rule worse in ${ruleWorseIn} of ${sessions.length} sessions`
);
check(
  meanAbs(ruleDevs) > 2 * meanAbs(caliperDevs) && worstRule > worstCaliper,
  'rule does measurably worse than the caliper: over twice the mean |dev|, and a larger worst case'
);

// ---------------------------------------------------------------------------
// 3. ln(I) against d, and the inversion back to n
// ---------------------------------------------------------------------------
console.log('\n=== Check 3: ln(I) against d is linear with slope -2*gamma ===');
const gamma = decayConstant();
const ds = [];
for (let d = 0.6; d <= 1.4 + 1e-9; d += 0.1) ds.push(d);
const exact = linfit(ds, ds.map((d) => Math.log(gapTransmission(d))));
const maxResidual = Math.max(...ds.map((d) => Math.abs(Math.log(gapTransmission(d)) - exact.intercept - exact.slope * d)));
console.log(`k2 = ${fmt(waveNumber())} /cm   gamma = ${fmt(gamma)} /cm   -2*gamma = ${fmt(-2 * gamma)} /cm`);
console.log(`fit slope ${fmt(exact.slope)} /cm   max residual ${maxResidual.toExponential(2)}`);
check(Math.abs(exact.slope + 2 * gamma) < 1e-9 && maxResidual < 1e-9, 'slope is -2*gamma, residuals vanish');
const nBack = indexFromDecay(-exact.slope / 2);
console.log(`n from the slope ${fmt(nBack, 6)}   PRISM_N ${fmt(PRISM_N, 6)}`);
check(Math.abs(nBack - PRISM_N) < 1e-9, 'inversion returns PRISM_N');
// The detector reads amplitude: ln(S) gives half the slope.
const amp = linfit(ds, ds.map((d) => Math.log(detectorSignal(gapTransmission(d)))));
console.log(`ln(S) against d instead: slope ${fmt(amp.slope)} /cm, ratio to ln(S^2) ${fmt(amp.slope / exact.slope, 4)}`);
check(Math.abs(amp.slope / exact.slope - 0.5) < 1e-9, 'ln(S) gives exactly half the slope');

// ---------------------------------------------------------------------------
// 4. A simulated Part B run recovers n; leaving the dark current in doesn't
// ---------------------------------------------------------------------------
console.log('\n=== Check 4: simulated Part B run, d = 0.6-1.4 cm, caliper ===');

// dn/dslope and dn/dlambda by central difference on the inversion.
function partBUncertainty(slope, slopeSE) {
  const n = (g, l) => indexFromDecay(g, PRISM_THETA, l);
  const g = -slope / 2;
  const h = 1e-6;
  const dnDg = (n(g + h, LAMBDA) - n(g - h, LAMBDA)) / (2 * h);
  const dnDl = (n(g, LAMBDA + h) - n(g, LAMBDA - h)) / (2 * h);
  return { fit: Math.abs(dnDg) * 2 * (slopeSE / 2), lambda: Math.abs(dnDl) * LAMBDA_UNCERTAINTY };
}

function runPartB(session) {
  const random = mulberry32(session.seed + 500);
  const meter = createMultimeter({ darkMa: session.darkMa, random });
  const caliper = createCaliper({ zeroCm: session.zeroCm });
  const dark = mean(Array.from({ length: 5 }, () => meter.read(0)));
  const zero = caliper.read(0);
  const xs = [];
  const raw = [];
  for (const d of ds) {
    xs.push(caliper.read(d) - zero);
    raw.push(readMean(meter, detectorSignal(gapTransmission(d))));
  }
  const fitFor = (ys) => {
    const f = linfit(xs, ys);
    return { ...f, n: indexFromDecay(-f.slope / 2), u: partBUncertainty(f.slope, f.slopeSE) };
  };
  return {
    subtracted: fitFor(raw.map((S) => Math.log((S - dark) ** 2))),
    raw: fitFor(raw.map((S) => Math.log(S ** 2))),
  };
}

console.log('dark(mA)  |  dark subtracted: n       dev       2σ(fit)  |  not subtracted: n       dev       2σ(fit)');
let partBOk = true;
let rawWorse = true;
let worstSub = 0;
for (const s of sessions) {
  const { subtracted: a, raw: b } = runPartB(s);
  const devA = a.n - PRISM_N;
  const devB = b.n - PRISM_N;
  worstSub = Math.max(worstSub, Math.abs(devA));
  partBOk &&= Math.abs(devA) <= a.u.fit;
  // Visibly worse: outside its own fit's error bar, so the student's
  // stated uncertainty doesn't cover it, and worse than subtracting.
  rawWorse &&= Math.abs(devB) > b.u.fit && Math.abs(devB) > Math.abs(devA);
  console.log(
    `${fmt(s.darkMa, 3)}     |  ${fmt(a.n)}  ${signed(devA)}   ${fmt(a.u.fit)}   |  ${fmt(b.n)}  ${signed(devB)}   ${fmt(b.u.fit)}  (${signed(pctErr(b.n, PRISM_N), 2)}%)`
  );
}
const lambdaTerm = partBUncertainty(-2 * gamma, 0).lambda;
console.log(`lambda term in n (not exercised by the simulation): ${fmt(lambdaTerm)}`);
check(partBOk, `dark subtracted: every |dev| within its fit's 2σ (worst ${fmt(worstSub)})`);
check(rawWorse, 'dark left in: every |dev| outside its own fit\'s 2σ and larger than with the dark subtracted');

console.log(`\n${failures === 0 ? 'All checks pass.' : `${failures} check(s) failed.`}`);
process.exitCode = failures === 0 ? 0 : 1;
