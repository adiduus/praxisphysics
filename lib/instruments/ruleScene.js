// Pure canvas drawing for the metre rule, seen face on. World space is
// centimetres with the origin at the rule's printed 0 on its graduated
// (top) edge, +x along the rule, +y down into it.
//
// drawRule() is called by MetreRule's panel for the whole rule and, at a
// higher `view.pxPerCm`, by its magnifier — the caliper's pattern
// (caliperScene.js): one draw function, two views. What the rule holds is
// drawn true size, its near face on the 0 and its far face wherever it
// falls, between divisions if that is where it is: a rule is read by eye,
// and seeing that a face misses the divisions is the point.
import { RULE_LENGTH_CM } from './rule.mjs';

export const RULE_EXTENT = { left: -1, right: RULE_LENGTH_CM + 1, top: -2.4, bottom: 3 };
const BODY = { left: -0.25, right: RULE_LENGTH_CM + 0.25, bottom: 2.6 };
const HELD_TOP = -2.2;

const WOOD = '#E4D9BF';
const OUTLINE = 'rgba(78,197,255,.7)';
const INK = 'rgb(6,10,15)';
const HELD = 'rgba(214,190,140,.9)';
const FONT = '"IBM Plex Mono", monospace';

// state: { heldCm } — the length of what the rule holds, or null.
export function drawRule(ctx, view, state) {
  const { originX, originY, pxPerCm, width, height } = view;
  const { heldCm } = state;
  const X = (x) => originX + x * pxPerCm;
  const Y = (y) => originY + y * pxPerCm;
  const box = (l, t, r, b, fill) => {
    ctx.beginPath();
    ctx.rect(X(l), Y(t), (r - l) * pxPerCm, (b - t) * pxPerCm);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  };

  ctx.clearRect(0, 0, width, height);
  box(BODY.left, 0, BODY.right, BODY.bottom, WOOD);

  // Half-millimetre divisions, longer every millimetre, 5 mm and centimetre;
  // drawn only where they are on screen (the magnifier sees a few cm).
  const lineW = Math.max(0.5, 0.012 * pxPerCm);
  const numeralPx = Math.min(14, Math.max(9, 0.16 * pxPerCm));
  const magnified = pxPerCm >= 30;
  const from = Math.max(0, Math.floor((-originX / pxPerCm) * 20) - 1);
  const to = Math.min(RULE_LENGTH_CM * 20, Math.ceil(((width - originX) / pxPerCm) * 20) + 1);
  ctx.font = `600 ${numeralPx}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Every centimetre numbered when magnified; every ten on the panel, where
  // a centimetre is a few pixels.
  const labelEvery = magnified ? 1 : pxPerCm * 5 > numeralPx * 3 ? 5 : 10;
  for (let h = from; h <= to; h++) {
    const x = h / 20;
    const isCm = h % 20 === 0;
    const len = isCm ? 0.5 : h % 10 === 0 ? 0.36 : h % 2 === 0 ? 0.26 : 0.16;
    if (!magnified && !isCm && h % 10 !== 0) continue; // sub-pixel at panel scale
    ctx.beginPath();
    ctx.strokeStyle = isCm ? 'rgba(6,10,15,.92)' : 'rgba(6,10,15,.7)';
    ctx.lineWidth = lineW;
    ctx.moveTo(X(x), Y(0));
    ctx.lineTo(X(x), Y(len));
    ctx.stroke();
    if (isCm && (h / 20) % labelEvery === 0) {
      ctx.fillStyle = INK;
      ctx.fillText(String(h / 20), X(x), Y(0.85));
    }
  }
  ctx.font = `${Math.max(8, numeralPx * 0.72)}px ${FONT}`;
  ctx.fillStyle = INK;
  if (magnified) {
    for (let cm = Math.floor(from / 20); cm < Math.ceil(to / 20); cm++) ctx.fillText('cm', X(cm + 0.5), Y(0.85));
  } else {
    ctx.fillText('cm', X(RULE_LENGTH_CM / 2 + 2.5), Y(1.7));
  }

  if (heldCm != null) box(0, HELD_TOP, heldCm, 0, HELD);
}

// The viewport point of a world point, for a popover's tail.
export function ruleToClient(canvas, view, x, y) {
  const r = canvas.getBoundingClientRect();
  return { x: r.left + view.originX + x * view.pxPerCm, y: r.top + view.originY + y * view.pxPerCm };
}
