// Generates the readings for the microwave experiment's worked example from
// the model and the modelled instruments, so every number there is one a
// student could get off the bench, then carries them through the way the
// guide teaches: no regression, and best, steepest and shallowest lines
// wherever a line is involved. Prints every intermediate value the prose
// will need, so none of them is ever worked out by hand. Run with:
//   node scripts/worked-example-microwave.mjs
// SWEEP=1 adds the every-bar test at seed 2006 and 1-12, which the worked
// example quotes. Pass --no-warnings to quiet Node's module-type notice.
//
// The bench, as a student would set it up:
//   Part A
//   - Slab thickness from the vernier caliper: jaws closed first (the zero
//     check), then the slab; t is the difference. Each reading is good to
//     half a division, so t is +/- one division, 0.005 cm.
//   - Goniometer stepped from 30 to 70 deg through its own 0.5 deg
//     divisions, three meter readings averaged at each. The goniometer
//     has no zero offset (lib/microwave/instruments.mjs says why), so its
//     readings are the angles.
//   - The dark current is in every reading but isn't subtracted. It moves
//     the whole curve up by the same amount, so it can't move a minimum.
//   - The dips are sharp Vs, not rounded: R goes as (theta - theta0)^2 but
//     the meter reads its square root, so S goes as |theta - theta0|. Each
//     minimum is pinned to the nearest division without effort; Part A's
//     skills are the integer order and the propagation.
//   Part B
//   - Gap set from 0.6 to 1.4 cm in 0.1 cm steps and measured with the
//     caliper (zero check first). Two runs, as the IPhO paper does, each the
//     mean of three readings. The dark current is measured separately with
//     the beam blocked and subtracted.
//   - The same readings are then carried through with the dark current left
//     in. Over this range it tilts the line, it doesn't bend it: the offset
//     in ln I grows almost linearly with d, so the slope comes out shallower
//     and n low. Measuring the zero with the beam blocked is the defence.
//
// Session values (dark current, caliper zero) and meter noise come from a
// fixed-seed generator. The seed was fixed before the first run, not
// chosen for the result. SEED=n overrides it.
import {
  LAMBDA,
  LAMBDA_UNCERTAINTY,
  SLAB_N,
  SLAB_T,
  SLAB_ORDERS,
  PRISM_N,
  PRISM_THETA,
  slabReflectance,
  slabMinimumAngle,
  gapTransmission,
  decayConstant,
  indexFromDecay,
  waveNumber,
  detectorSignal,
} from '../lib/microwave/model.mjs';
import {
  createMultimeter,
  createCaliper,
  DARK_MIN_MA,
  DARK_MAX_MA,
  CALIPER_MAX_ZERO,
  CALIPER_RESOLUTION,
  MULTIMETER_RESOLUTION,
  GONIOMETER_RESOLUTION,
} from '../lib/microwave/instruments.mjs';
import { analyse } from './lib/lines.mjs';

const SEED = Number(process.env.SEED ?? 2006);
const DEG = Math.PI / 180;
const REPEATS = 3;

// mulberry32: small, deterministic, good enough for jitter.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (v, d) => v.toFixed(d);
const pad = (s, n) => String(s).padStart(n);
const sgn = (v, d) => (v >= 0 ? '+' : '') + v.toFixed(d);
const mean = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
const halfRange = (xs) => (Math.max(...xs) - Math.min(...xs)) / 2;

const random = rng(SEED);
const darkMa = DARK_MIN_MA + random() * (DARK_MAX_MA - DARK_MIN_MA);
const caliperZero = (2 * random() - 1) * CALIPER_MAX_ZERO;
const meter = createMultimeter({ darkMa, random });
const caliper = createCaliper({ zeroCm: caliperZero });
const reads = (trueMa) => Array.from({ length: REPEATS }, () => meter.read(trueMa));

console.log(`SEED ${SEED}`);
console.log(`Session (hidden from the student): dark current ${f(darkMa, 4)} mA, caliper zero error ${sgn(caliperZero, 4)} cm`);
console.log(`Model: lambda = ${LAMBDA} +/- ${LAMBDA_UNCERTAINTY} cm, slab n = ${SLAB_N}, t = ${SLAB_T} cm; prisms n = ${PRISM_N}, theta = ${PRISM_THETA} deg\n`);

// =============================================================================
// PART A
// =============================================================================
console.log('################ PART A — the slab ################\n');

const zeroA = caliper.read(0);
const slabRead = caliper.read(SLAB_T);
const t = slabRead - zeroA;
const dt = CALIPER_RESOLUTION; // two readings, each +/- half a division
console.log('--- A1: thickness ---');
console.log(`  jaws closed: ${f(zeroA, 3)} cm   on the slab: ${f(slabRead, 3)} cm`);
console.log(`  t = ${f(slabRead, 3)} - (${f(zeroA, 3)}) = ${f(t, 3)} +/- ${f(dt, 3)} cm   (true ${SLAB_T})\n`);

const scan = [];
for (let theta = 30; theta <= 70 + 1e-9; theta += GONIOMETER_RESOLUTION) {
  const r = reads(detectorSignal(slabReflectance(theta)));
  scan.push({ theta, r, S: mean(r) });
}
console.log('--- A2: receiver output against angle of incidence ---');
console.log('theta(deg)   S1(mA)   S2(mA)   S3(mA)   mean S(mA)');
for (const p of scan) {
  console.log(`${pad(f(p.theta, 1), 8)}    ${p.r.map((x) => f(x, 3)).join('    ')}    ${f(p.S, 4)}`);
}
console.log('');

// The two dips: the lowest mean within 3 deg either side, the two lowest
// of those, in angle order.
const reach = Math.round(3 / GONIOMETER_RESOLUTION);
const dipIdx = scan
  .map((p, i) => i)
  .filter((i) => scan.slice(Math.max(0, i - reach), i + reach + 1).every((o) => o === scan[i] || scan[i].S < o.S))
  .sort((a, b) => scan[a].S - scan[b].S)
  .slice(0, 2)
  .sort((a, b) => a - b);

console.log('--- A3: the two minima ---');
console.log('Each minimum with three divisions either side (mean S, mA):');
for (const i of dipIdx) {
  const around = scan.slice(i - 3, i + 4).map((p) => `${f(p.theta, 1)}: ${f(p.S, 4)}`);
  console.log(`  ${around.join('   ')}`);
}
// How sharp each dip is in the data: the drop from one division out to the
// bottom, against the scatter of the three readings at the bottom.
for (const i of dipIdx) {
  const left = scan[i - 1].S - scan[i].S;
  const right = scan[i + 1].S - scan[i].S;
  console.log(
    `  at ${f(scan[i].theta, 1)} deg: one division out the mean rises by ${f(left, 4)} (left) and ${f(right, 4)} (right) mA; ` +
      `half-range of the three readings at the bottom ${f(halfRange(scan[i].r), 4)} mA`
  );
}
const dTheta = GONIOMETER_RESOLUTION; // the true minimum lies between the lowest reading's neighbours
const [theta1, theta2] = dipIdx.map((i) => scan[i].theta);
console.log(`  theta1 = ${f(theta1, 1)} +/- ${dTheta} deg, theta2 = ${f(theta2, 1)} +/- ${dTheta} deg`);
console.log(`  (model's true zeros: ${SLAB_ORDERS.map((N) => `order ${N} at ${f(slabMinimumAngle(N), 3)} deg`).join(', ')})\n`);

// 2m - 1 = 4t^2 (sin^2 theta2 - sin^2 theta1) / lambda^2
const s1 = Math.sin(theta1 * DEG);
const s2 = Math.sin(theta2 * DEG);
const twoM1 = (4 * t * t * (s2 * s2 - s1 * s1)) / (LAMBDA * LAMBDA);
const m = Math.round((twoM1 + 1) / 2);
// Its own uncertainty, to show the rounding is safe.
const dTwoM1 = Math.sqrt(
  ((4 * t * t * Math.sin(2 * theta1 * DEG)) / LAMBDA ** 2 * dTheta * DEG) ** 2 +
    ((4 * t * t * Math.sin(2 * theta2 * DEG)) / LAMBDA ** 2 * dTheta * DEG) ** 2 +
    ((2 * twoM1 * dt) / t) ** 2 +
    ((2 * twoM1 * LAMBDA_UNCERTAINTY) / LAMBDA) ** 2
);
console.log('--- The order ---');
console.log(`  sin^2(theta1) = ${f(s1 * s1, 5)}, sin^2(theta2) = ${f(s2 * s2, 5)}, difference ${f(s2 * s2 - s1 * s1, 5)}`);
console.log(`  4t^2/lambda^2 = ${f((4 * t * t) / LAMBDA ** 2, 4)}`);
console.log(`  2m - 1 = ${f(twoM1, 3)} +/- ${f(dTwoM1, 3)}  ->  19 is the nearest odd integer: m = ${m} at theta1, ${m - 1} at theta2`);
console.log(`  (a half-wavelength error would put the minima at half-integer orders, and 2m - 1 would come out near an even number)\n`);

// n = sqrt(sin^2 theta + (m lambda / 2t)^2), with the general partial-
// derivative formula: neither the sum rule nor the power rule reaches it.
function propagate(theta, order) {
  const s = Math.sin(theta * DEG);
  const c = Math.cos(theta * DEG);
  const q = (order * LAMBDA) / (2 * t);
  const n = Math.sqrt(s * s + q * q);
  const dndTheta = (s * c) / n; // per radian
  const dndt = -(q * q) / (n * t);
  const dndLambda = (q * q) / (n * LAMBDA);
  return {
    theta,
    order,
    s2: s * s,
    q,
    q2: q * q,
    n,
    dndTheta,
    dndt,
    dndLambda,
    termTheta: Math.abs(dndTheta) * dTheta * DEG,
    termT: Math.abs(dndt) * dt,
    termLambda: Math.abs(dndLambda) * LAMBDA_UNCERTAINTY,
  };
}
const quad = (...xs) => Math.sqrt(xs.reduce((a, x) => a + x * x, 0));

const mins = [propagate(theta1, m), propagate(theta2, m - 1)];
console.log('--- n from each minimum, and its propagation ---');
console.log(`  n = sqrt(sin^2 theta + (m lambda / 2t)^2)`);
console.log(`  dn/dtheta = sin theta cos theta / n,  dn/dt = -(m lambda/2t)^2 / (n t),  dn/dlambda = (m lambda/2t)^2 / (n lambda)`);
console.log(`  dtheta = ${dTheta} deg = ${f(dTheta * DEG, 5)} rad, dt = ${dt} cm, dlambda = ${LAMBDA_UNCERTAINTY} cm`);
for (const r of mins) {
  console.log(`  theta = ${f(r.theta, 1)} deg, order ${r.order}:`);
  console.log(`    m lambda/2t = ${f(r.q, 5)}, its square ${f(r.q2, 5)}; sin^2 theta = ${f(r.s2, 5)}; n = ${f(r.n, 5)}`);
  console.log(`    dn/dtheta = ${f(r.dndTheta, 4)} /rad   term ${f(r.termTheta, 5)}`);
  console.log(`    dn/dt     = ${f(r.dndt, 4)} /cm    term ${f(r.termT, 5)}`);
  console.log(`    dn/dlambda= ${f(r.dndLambda, 4)} /cm    term ${f(r.termLambda, 5)}`);
  console.log(`    in quadrature ${f(quad(r.termTheta, r.termT, r.termLambda), 5)}, added plainly ${f(r.termTheta + r.termT + r.termLambda, 5)}`);
}
// The mean of the two: the angle terms are independent (two separate
// readings), so they combine in quadrature and halve; t and lambda are the
// same numbers in both, so their terms simply average. That changes which
// term dominates: the angle term is largest for either minimum on its own,
// lambda is largest for the mean. (With dtheta = 0.5 deg; at 0.25 deg the
// angle term halves and lambda leads throughout.)
const nMean = mean(mins.map((r) => r.n));
const meanTheta = quad(mins[0].termTheta, mins[1].termTheta) / 2;
const meanT = mean(mins.map((r) => r.termT));
const meanLambda = mean(mins.map((r) => r.termLambda));
const dnA = quad(meanTheta, meanT, meanLambda);
const dnAPlain = meanTheta + meanT + meanLambda;
const terms = [
  ['theta', meanTheta],
  ['t', meanT],
  ['lambda', meanLambda],
].sort((a, b) => b[1] - a[1]);
console.log('  the mean of the two:');
console.log(`    n = (${f(mins[0].n, 5)} + ${f(mins[1].n, 5)})/2 = ${f(nMean, 5)}`);
console.log(`    theta term sqrt(${f(mins[0].termTheta, 5)}^2 + ${f(mins[1].termTheta, 5)}^2)/2 = ${f(meanTheta, 5)}  (independent readings)`);
console.log(`    t term ${f(meanT, 5)}, lambda term ${f(meanLambda, 5)}  (shared by both minima, so averaged)`);
console.log(`    dn = ${f(dnA, 5)} in quadrature, ${f(dnAPlain, 5)} added plainly`);
console.log(`    largest term: ${terms.map(([k, v]) => `${k} ${f(v, 5)}`).join(' > ')}`);
for (const r of mins) {
  const big = [['theta', r.termTheta], ['t', r.termT], ['lambda', r.termLambda]].sort((a, b) => b[1] - a[1])[0];
  console.log(`    (largest at ${f(r.theta, 1)} deg alone: ${big[0]} ${f(big[1], 5)})`);
}
console.log(`    the angle terms average down because the two readings are independent; t and lambda are shared and don't`);
console.log(`  n = ${f(nMean, 3)} +/- ${f(dnA, 3)}   (true ${SLAB_N}: ${Math.abs(nMean - SLAB_N) <= dnA ? 'contains' : 'MISSES'})\n`);

// =============================================================================
// PART B
// =============================================================================
console.log('################ PART B — the prisms ################\n');

const gaps = [];
for (let d = 0.6; d <= 1.4 + 1e-9; d += 0.1) gaps.push(Math.round(d * 10) / 10);

const zeroB = caliper.read(0);
const darkReads = reads(0);
const dark = mean(darkReads);
const dDark = Math.max(halfRange(darkReads), MULTIMETER_RESOLUTION / 2);
const dd = CALIPER_RESOLUTION;
console.log('--- B1: dark current and caliper zero ---');
console.log(`  beam blocked: ${darkReads.map((x) => f(x, 3)).join(', ')} mA -> dark = ${f(dark, 4)} +/- ${f(dDark, 4)} mA`);
console.log(`  jaws closed: ${f(zeroB, 3)} cm; each gap +/- ${dd} cm\n`);

const rowsB = gaps.map((d) => {
  const S = detectorSignal(gapTransmission(d));
  const run1 = reads(S);
  const run2 = reads(S);
  const raw = mean([mean(run1), mean(run2)]);
  // Half the range of the two runs, never below half a division of the meter.
  const dRaw = Math.max(halfRange([mean(run1), mean(run2)]), MULTIMETER_RESOLUTION / 2);
  return { dTrue: d, dRead: caliper.read(d) - zeroB, run1, run2, raw, dRaw };
});

// S with the dark current subtracted (or not); I = S^2; ln I with its bar,
// d(ln I) = dI/I = 2 dS/S.
function withSignal(rows, subtract) {
  return rows.map((r) => {
    const S = subtract ? r.raw - dark : r.raw;
    const dS = subtract ? r.dRaw + dDark : r.dRaw;
    const I = S * S;
    return { ...r, S, dS, I, dI: 2 * S * dS, lnI: Math.log(I), dlnI: (2 * dS) / S };
  });
}

function printB(label, rows) {
  console.log(`--- ${label} ---`);
  console.log('d(cm)   run1 mean  run2 mean   S(mA)    dS       I=S^2(mA^2)  ln I      d(ln I)');
  for (const r of rows) {
    console.log(
      `${f(r.dRead, 3)}   ${f(mean(r.run1), 4)}     ${f(mean(r.run2), 4)}     ${f(r.S, 4)}   ${f(r.dS, 4)}   ${f(r.I, 5)}      ${pad(f(r.lnI, 3), 6)}   ${f(r.dlnI, 3)}`
    );
  }
}

console.log('Raw runs (each the mean of three readings):');
console.log('d(cm)   run 1: readings          mean     run 2: readings          mean');
for (const r of rowsB) {
  console.log(`${f(r.dRead, 3)}   ${r.run1.map((x) => f(x, 3)).join(' ')}   ${f(mean(r.run1), 4)}   ${r.run2.map((x) => f(x, 3)).join(' ')}   ${f(mean(r.run2), 4)}`);
}
console.log('');

const k = waveNumber();
const sinT = Math.sin(PRISM_THETA * DEG);
function lineB(label, rows) {
  // The shared line helper assumes a rising line when it allows for the
  // horizontal error bars, so run it on -d and turn the slopes back round.
  const a = analyse(rows.map((r) => ({ x: -r.dRead, ex: dd, y: r.lnI, ey: r.dlnI })));
  console.log(`  slope between neighbouring points (per cm):`);
  for (let i = 1; i < rows.length; i++) {
    const p = rows[i - 1];
    const q = rows[i];
    console.log(`    ${f(p.dRead, 3)}-${f(q.dRead, 3)}: ${f((q.lnI - p.lnI) / (q.dRead - p.dRead), 3)}`);
  }
  if (!a) {
    console.log(`  ${label}: no straight line passes through every error bar\n`);
    return null;
  }
  const lines = {
    steepest: { slope: -a.steep.b, icpt: a.steep.a },
    shallowest: { slope: -a.shallow.b, icpt: a.shallow.a },
    best: { slope: -a.best.b, icpt: a.best.a },
  };
  // steep/shallow are by the flipped slope; name them by the real one.
  const [steepest, shallowest] =
    lines.steepest.slope < lines.shallowest.slope ? [lines.steepest, lines.shallowest] : [lines.shallowest, lines.steepest];
  const out = {};
  for (const [name, L] of [['steepest', steepest], ['shallowest', shallowest], ['best', lines.best]]) {
    const gamma = -L.slope / 2;
    out[name] = { ...L, gamma, n: indexFromDecay(gamma) };
    console.log(
      `  ${pad(name, 10)}: ln I = ${f(L.icpt, 3)} ${L.slope < 0 ? '-' : '+'} ${f(Math.abs(L.slope), 3)} d   gamma = ${f(gamma, 4)} /cm   n = ${f(out[name].n, 4)}`
    );
  }
  const dSlope = Math.abs(steepest.slope - shallowest.slope) / 2;
  const dn = Math.abs(out.steepest.n - out.shallowest.n) / 2;
  console.log(`  best line through the centre (${f(-a.best.cx, 3)}, ${f(a.best.cy, 3)})`);
  console.log(`  slope = ${f(out.best.slope, 3)} +/- ${f(dSlope, 3)} /cm = -2 gamma`);
  console.log(`  gamma = ${f(out.best.gamma, 4)} +/- ${f(dSlope / 2, 4)} /cm`);
  console.log(`  n = sqrt(k^2 + gamma^2) / (k sin theta), k = 2 pi/lambda = ${f(k, 4)} /cm, sin ${PRISM_THETA} = ${f(sinT, 4)}`);
  console.log(`  n = ${f(out.best.n, 4)}; from the extreme lines ${f(out.steepest.n, 4)} and ${f(out.shallowest.n, 4)} -> dn = ${f(dn, 4)}`);
  // lambda's share, for completeness: small beside the lines'.
  const h = 1e-6;
  const dnLambda =
    (Math.abs(indexFromDecay(out.best.gamma, PRISM_THETA, LAMBDA + h) - indexFromDecay(out.best.gamma, PRISM_THETA, LAMBDA - h)) / (2 * h)) *
    LAMBDA_UNCERTAINTY;
  console.log(`  (lambda's term alone would be ${f(dnLambda, 4)})`);
  console.log(`  n = ${f(out.best.n, 3)} +/- ${f(dn, 3)}   (true ${PRISM_N}: ${Math.abs(out.best.n - PRISM_N) <= dn ? 'contains' : 'MISSES'})\n`);
  return { ...out, dn };
}

const sub = withSignal(rowsB, true);
printB('B2: dark current subtracted', sub);
console.log(`True: gamma = ${f(decayConstant(), 4)} /cm, slope -2 gamma = ${f(-2 * decayConstant(), 4)} /cm`);
lineB('dark subtracted', sub);

// The same readings with the dark current left in. Over 0.6-1.4 cm it tilts
// the line rather than bending it, so the prose can show n coming out low
// from data that gives no visible sign of it.
const raw = withSignal(rowsB, false);
printB('The same data, dark current left in', raw);
lineB('dark left in', raw);

// Whether the every-bar test itself gives the dark current away. The bars
// above differ (dDark is added only when the dark is subtracted), so compare
// like with like: the subtracted data with the run-only bars a student who
// never measured the dark would draw. Then the smallest factor on the ln I
// bars that lets a line through every one, for each.
const subRunBars = rowsB.map((r) => {
  const S = r.raw - dark;
  return { ...r, S, dS: r.dRaw, lnI: Math.log(S * S), dlnI: (2 * r.dRaw) / S };
});
const boxes = (rows, s) => rows.map((r) => ({ x: -r.dRead, ex: dd, y: r.lnI, ey: r.dlnI * s }));
function barFactor(rows) {
  if (analyse(boxes(rows, 1))) return 1;
  let lo = 1;
  let hi = 10;
  for (let i = 0; i < 40; i++) {
    const s = (lo + hi) / 2;
    if (analyse(boxes(rows, s))) hi = s;
    else lo = s;
  }
  return hi;
}
console.log('Every-bar test with the same (run-only) bars on both:');
for (const [label, rows] of [['dark subtracted', subRunBars], ['dark left in   ', raw]]) {
  const s = barFactor(rows);
  console.log(`  ${label}: ${s === 1 ? 'a line passes through every bar' : `no line; the bars would need x${f(s, 2)} to admit one`}`);
}
console.log('ln I with and without the dark current, and the difference:');
for (let i = 0; i < sub.length; i++) {
  console.log(`  ${f(sub[i].dRead, 3)}: ${pad(f(sub[i].lnI, 3), 6)}  ${pad(f(raw[i].lnI, 3), 6)}  ${f(raw[i].lnI - sub[i].lnI, 3)}`);
}
// Tilt, not bend, from chords rather than neighbouring pairs (which the
// noise swamps): the near half of the range against the far half, and end
// to end. Equal halves with the dark in mean a straight line, just the
// wrong one.
const chord = (rows, i, j) => (rows[j].lnI - rows[i].lnI) / (rows[j].dRead - rows[i].dRead);
const mid = Math.floor(sub.length / 2);
const last = sub.length - 1;
console.log('Chord slopes (per cm), and the n an end-to-end chord would give:');
for (const [label, rows] of [['dark subtracted', sub], ['dark left in   ', raw]]) {
  const near = chord(rows, 0, mid);
  const far = chord(rows, mid, last);
  const whole = chord(rows, 0, last);
  console.log(
    `  ${label}: ${f(rows[0].dRead, 1)}-${f(rows[mid].dRead, 1)} ${f(near, 3)}, ${f(rows[mid].dRead, 1)}-${f(rows[last].dRead, 1)} ${f(far, 3)}, ` +
      `end to end ${f(whole, 3)} -> n = ${f(indexFromDecay(-whole / 2), 4)}`
  );
}
// How far off the uncorrected answer is, against the true value and against
// the corrected answer, from end-to-end chords and from the best lines.
{
  const nChord = (rows) => indexFromDecay(-chord(rows, 0, last) / 2);
  const pct = (a, b) => f((100 * (a - b)) / b, 2);
  console.log('Dark left in, how far off:');
  console.log(`  end-to-end chord: n = ${f(nChord(raw), 4)}, ${pct(nChord(raw), PRISM_N)}% from true, ${pct(nChord(raw), nChord(sub))}% from the corrected chord`);
}

// =============================================================================
// Tables to paste: plain columns, a header row, no box drawing.
// =============================================================================
const cols = (cells, widths) => cells.map((c, i) => String(c).padEnd(widths[i])).join('  ').trimEnd();

console.log('\nTable A: Part A scan (S is the mean of three readings)');
const wA = [9, 9, 7];
console.log(cols(['theta_deg', 'S_mA', 'minimum'], wA));
for (let i = 0; i < scan.length; i++) {
  const k = dipIdx.indexOf(i);
  console.log(cols([f(scan[i].theta, 1), f(scan[i].S, 4), k < 0 ? '' : `m=${m - k}`], wA));
}

console.log('\nTable B: Part B (each run is the mean of three readings; I = S^2 in mA^2)');
console.log(`dark current ${f(dark, 4)} +/- ${f(dDark, 4)} mA, subtracted in S_minus_dark`);
const wB = [6, 8, 8, 8, 12, 7, 9, 12, 14];
console.log(cols(['d_cm', 'S_run1', 'S_run2', 'S_mean', 'S_minus_dark', 'ln_I', 'd_ln_I', 'ln_I_dark_in', 'd_ln_I_dark_in'], wB));
for (let i = 0; i < sub.length; i++) {
  const s = sub[i];
  console.log(
    cols(
      [f(s.dRead, 3), f(mean(s.run1), 4), f(mean(s.run2), 4), f(s.raw, 4), f(s.S, 4), f(s.lnI, 3), f(s.dlnI, 3), f(raw[i].lnI, 3), f(raw[i].dlnI, 3)],
      wB
    )
  );
}

// One line for this seed, read by the sweep below: does each case's line
// pass the every-bar test on its own proper bars (dDark included when the
// dark is subtracted, run-only when it isn't), and how far off is n from an
// end-to-end chord with the dark left in.
{
  const pass = (rows) => (analyse(boxes(rows, 1)) ? 'passes' : `fails x${f(barFactor(rows), 2)}`);
  const nRaw = indexFromDecay(-chord(raw, 0, last) / 2);
  console.log(
    `\nSUMMARY seed ${pad(SEED, 4)}  dark ${f(darkMa, 4)} mA  subtracted: ${pad(pass(sub), 11)}  left in: ${pad(pass(raw), 11)}  ` +
      `n left in ${f(nRaw, 4)} (${f((100 * (nRaw - PRISM_N)) / PRISM_N, 2)}% from true)`
  );
}

// SWEEP=1 reruns the script at seed 2006 and 1-12 and prints those lines,
// for the worked example's claim about how often the every-bar test warns.
if (process.env.SWEEP && !process.env.SWEEP_CHILD) {
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  console.log('\nEvery-bar test across seeds, each case on its own bars:');
  for (const s of [2006, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const out = execFileSync(process.execPath, ['--no-warnings', fileURLToPath(import.meta.url)], {
      env: { ...process.env, SEED: String(s), SWEEP_CHILD: '1' },
      encoding: 'utf8',
    });
    console.log('  ' + out.split('\n').find((l) => l.startsWith('SUMMARY')).slice(8));
  }
}
