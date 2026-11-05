// Pure canvas drawing for the vernier caliper, seen from the side. World
// space is centimetres with the origin at the main scale's printed 0 on its
// graduated edge (the fixed jaw's inner face), +x along the beam, +y down
// towards the jaw tips.
//
// drawCaliper() is called identically by VernierCaliper's panel canvas for
// the whole instrument and, at a much higher `view.pxPerCm`, by its
// magnifier — the same pattern as lib/pendulum/scene.js and its lens: one
// draw function, two views, nothing redrawn as a separate diagram. At
// panel scale a millimetre is two or three pixels and the vernier's lines
// run together; that is the point, and the magnifier is how they are read.
//
// The vernier is drawn from where the caliper *reads* (`vernierZeroCm`,
// lib/instruments/caliper.mjs's quantized read), the jaws from where they
// *are* (`openingCm`): they differ by the session's zero error, which is
// what a student sees with the jaws shut.
import { CALIPER_RANGE_CM, VERNIER_DIVISIONS, VERNIER_SPAN_CM } from './caliper.mjs';

// The whole instrument, for the panel's fit: beam, both pairs of jaws at
// full opening, the jaw tips, and whatever they hold.
export const CALIPER_EXTENT = { left: -1.7, right: CALIPER_RANGE_CM + 5.5, top: -2.25, bottom: 2.6 };

const MAIN_TICKS_TO_CM = 19.5; // past the vernier's last line at full opening
const JAW_TIP_Y = 2.4;
// The inside jaws, above the beam: knife-edged blades whose outer faces
// meet at x = 0 when the jaws are shut, so they read the same scale.
const INSIDE = { base: -1.2, tip: -2.05, width: 0.45, edge: 0.08 };
const BEAM = { left: -1.5, right: CALIPER_RANGE_CM + 5.2, top: -1.05, bottom: 0.3 };
// The slider, relative to the moving jaw's inner face; the vernier plate,
// relative to the vernier's zero line.
const SLIDER = { left: -0.4, right: 5.25, railTop: -1.2, bottom: 0.82 };
const PLATE = { left: -0.3, right: 4.95, bottom: 0.64 };

const STEEL = '#DCE4EC';
const SLIDER_STEEL = '#B9C5D1';
const PLATE_STEEL = '#E9EEF3';
const OUTLINE = 'rgba(78,197,255,.7)';
const INK = 'rgb(6,10,15)';
const HELD = 'rgba(214,190,140,.9)'; // what the jaws hold: polymer, wax
const FONT = '"IBM Plex Mono", monospace';

// state.holds, when the jaws hold something: { kind: 'outside', cm } is a
// solid between the main jaws (they close onto it); { kind: 'inside', cm }
// is a gap between two faces, with the inside jaws in it (they open onto
// it). Either is drawn true size; the component keeps the jaws off it.
export function drawCaliper(ctx, view, state) {
  const { originX, originY, pxPerCm, width, height } = view;
  const { openingCm, vernierZeroCm, holds } = state;
  const X = (x) => originX + x * pxPerCm;
  const Y = (y) => originY + y * pxPerCm;
  const rect = (l, t, r, b) => ctx.rect(X(l), Y(t), (r - l) * pxPerCm, (b - t) * pxPerCm);
  const poly = (pts) => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y))));
    ctx.closePath();
  };
  const body = (fill) => {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  ctx.clearRect(0, 0, width, height);
  // Engraved lines about 0.1 mm wide, never thinner than a hairline.
  const lineW = Math.max(0.5, 0.009 * pxPerCm);
  // Type is printed true size where that is legible (the magnifier) and
  // held at a readable floor at panel scale, like the pendulum scale's
  // decimetre numerals.
  const numeralPx = Math.min(15, Math.max(9, 0.2 * pxPerCm));
  const magnified = pxPerCm >= 60;
  const tick = (x, y0, y1, strong) => {
    ctx.beginPath();
    ctx.strokeStyle = strong ? 'rgba(6,10,15,.92)' : 'rgba(6,10,15,.7)';
    ctx.lineWidth = lineW;
    ctx.moveTo(X(x), Y(y0));
    ctx.lineTo(X(x), Y(y1));
    ctx.stroke();
  };

  // Beam, carrying the main scale on its lower edge (y = 0).
  ctx.beginPath();
  rect(BEAM.left, BEAM.top, BEAM.right, BEAM.bottom);
  body(STEEL);

  // Main scale: millimetres, longer every 5 mm, numbered every centimetre.
  ctx.font = `600 ${numeralPx}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = INK;
  const mainNumeralY = magnified ? -0.43 : -0.62;
  // Every centimetre numbered where two-digit numerals fit apart; every
  // second one on a phone's panel, where they would touch.
  const cmLabelEvery = pxPerCm > numeralPx * 2 ? 1 : 2;
  for (let mm = 0; mm <= MAIN_TICKS_TO_CM * 10; mm++) {
    const x = mm / 10;
    const isCm = mm % 10 === 0;
    const len = isCm ? 0.34 : mm % 5 === 0 ? 0.24 : 0.16;
    tick(x, 0, -len, isCm);
    if (isCm && (mm / 10) % cmLabelEvery === 0) ctx.fillText(String(mm / 10), X(x), Y(mainNumeralY));
  }
  // The unit: once by the 0 at panel scale; between every pair of
  // numerals when magnified, so it is in view wherever the magnifier looks.
  ctx.font = `${Math.max(8, numeralPx * 0.72)}px ${FONT}`;
  if (magnified) {
    for (let cm = 0; cm < Math.floor(MAIN_TICKS_TO_CM); cm++) ctx.fillText('cm', X(cm + 0.5), Y(mainNumeralY));
  } else {
    ctx.fillText('cm', X(-0.85), Y(mainNumeralY));
  }

  // Fixed jaw, inner face at x = 0.
  poly([
    [BEAM.left, BEAM.bottom],
    [0, BEAM.bottom],
    [0, JAW_TIP_Y],
    [-0.32, JAW_TIP_Y],
    [BEAM.left, 1.1],
  ]);
  body(STEEL);

  // Fixed inside jaw, its measuring face at x = 0 facing the fixed jaw's
  // side of the scale.
  poly([
    [0, BEAM.top],
    [INSIDE.width, BEAM.top],
    [INSIDE.edge, INSIDE.tip],
    [0, INSIDE.tip],
  ]);
  body(STEEL);

  // Slider: a rail over the beam's top edge and the body below the scale,
  // carrying the vernier plate and the moving jaw.
  const o = openingCm;
  ctx.beginPath();
  rect(o + SLIDER.left, SLIDER.railTop, o + SLIDER.right, BEAM.top + 0.12);
  body(SLIDER_STEEL);
  ctx.beginPath();
  rect(o + SLIDER.left, 0, o + SLIDER.right, SLIDER.bottom);
  body(SLIDER_STEEL);

  // Moving inside jaw, its measuring face at x = openingCm, crossing the
  // fixed one when nearly shut (they sit at different depths).
  poly([
    [o, SLIDER.railTop],
    [o - INSIDE.width, SLIDER.railTop],
    [o - INSIDE.edge, INSIDE.tip],
    [o, INSIDE.tip],
  ]);
  body(SLIDER_STEEL);

  // Moving jaw, inner face at x = openingCm, facing the fixed one.
  poly([
    [o, SLIDER.bottom],
    [o + 1.45, SLIDER.bottom],
    [o + 1.45, 1.1],
    [o + 0.32, JAW_TIP_Y],
    [o, JAW_TIP_Y],
  ]);
  body(SLIDER_STEEL);

  // What the jaws hold. A solid sits between the main jaws, from the fixed
  // jaw's face; a gap is two faces with the inside jaws' tips between them,
  // the near face on the fixed jaw's measuring face.
  if (holds?.kind === 'outside') {
    ctx.beginPath();
    rect(0, 0.95, holds.cm, CALIPER_EXTENT.bottom);
    body(HELD);
  } else if (holds?.kind === 'inside') {
    const top = CALIPER_EXTENT.top + 0.05;
    const bottom = INSIDE.tip + 0.3;
    ctx.beginPath();
    rect(-1.4, top, 0, bottom);
    body(HELD);
    ctx.beginPath();
    rect(holds.cm, top, holds.cm + 1.4, bottom);
    body(HELD);
  }

  // Vernier plate and its scale, hanging from the main scale's edge: 20
  // lines over 39 mm, longer every second line and at 0, 5 and 10, which
  // are the tenths of a millimetre the reading adds.
  const v = vernierZeroCm;
  ctx.beginPath();
  rect(v + PLATE.left, 0, v + PLATE.right, PLATE.bottom);
  body(PLATE_STEEL);
  const step = VERNIER_SPAN_CM / VERNIER_DIVISIONS;
  ctx.font = `600 ${numeralPx}px ${FONT}`;
  ctx.fillStyle = INK;
  // Numerals only where they fit apart; at panel scale they would collide.
  const labelVernier = 2 * step * pxPerCm > numeralPx * 1.6;
  const vernierNumeralY = magnified ? 0.405 : 0.46;
  for (let k = 0; k <= VERNIER_DIVISIONS; k++) {
    const x = v + k * step;
    const major = k % 10 === 0;
    const len = major ? 0.32 : k % 2 === 0 ? 0.26 : 0.16;
    tick(x, 0, len, major);
    if (labelVernier && k % 2 === 0) ctx.fillText(String(k / 2), X(x), Y(vernierNumeralY));
  }
  if (magnified) {
    ctx.font = `${Math.max(8, numeralPx * 0.72)}px ${FONT}`;
    ctx.fillText('0.05 mm', X(v + (VERNIER_SPAN_CM + PLATE.right) / 2), Y(vernierNumeralY));
  }
}

// The canvas point of a world point, for pointing a popover's tail at
// something drawn rather than an element.
export function caliperToClient(canvas, view, x, y) {
  const r = canvas.getBoundingClientRect();
  return { x: r.left + view.originX + x * view.pxPerCm, y: r.top + view.originY + y * view.pxPerCm };
}
