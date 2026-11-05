// Pure canvas drawing for the microwave goniometer, seen from above. World
// space is in units of the graduated circle's outer radius, with the origin
// at the common centre. Directions are true angles in degrees about that
// centre, measured from the source arm (pointing left, at 0) round through
// the top (90) to straight through (180): clockwise on screen.
//
// The circle's printed 0 is on the source arm's axis: there is no zero
// offset (lib/microwave/instruments.mjs, createGoniometer).
//
// No beam is drawn, and nothing animates: drawGoniometer is called once per
// change of state. Every division is drawn true, so at bench size the
// half-degrees run together, as the pendulum scale's millimetres do.

// The circle's outer radius in centimetres, for drawing what the table
// carries true size.
export const CIRCLE_RADIUS_CM = 45;
export const RING_INNER = 0.8;
export const TABLE_RADIUS = 0.4;
export const ARM_REACH = 1.5; // the horns' far ends
// The drawing's extent: the arms reach out to ARM_REACH left, up and right;
// below the centre there is only the circle.
export const GONIOMETER_EXTENT = { left: -1.55, right: 1.55, top: -1.55, bottom: 1.06 };

const RING_OUTER = 1;
const ARM_HALF_WIDTH = 0.035;
// The horn flares from its box towards the centre.
const HORN = { mouthAt: 1.24, throatAt: 1.36, mouth: 0.1, throat: 0.035, box: 0.075 };
const LENS_AT = 1.12;
const BLOCK_AT = 1.18; // the beam block's plate, just in front of the receiver's horn
// The specimens, in cm: the slab's face is on the table's axis, so a
// reflection happens over the centre; the prisms are equilateral.
const SLAB_WIDTH_CM = 30;
const PRISM_SIDE_CM = 15;

const STEEL = '#DCE4EC';
const ARM_STEEL = '#B9C5D1';
const TABLE_STEEL = '#E9EEF3';
const HORN_STEEL = '#8C9AA8';
const POLYMER = 'rgba(214,190,140,.9)';
const WAX = 'rgba(238,226,196,.92)';
const BLOCK = '#5E6B78';
const OUTLINE = 'rgba(78,197,255,.7)';
const INK = 'rgb(6,10,15)';
const FONT = '"IBM Plex Mono", monospace';
const RAD = Math.PI / 180;

// Screen direction of a true angle: 0 points left, 90 up, 180 right.
const dir = (deg) => ({ x: -Math.cos(deg * RAD), y: -Math.sin(deg * RAD) });

// The true angle of a canvas point about the centre, for dragging.
export function angleAt(view, px, py) {
  return Math.atan2(-(py - view.cy), -(px - view.cx)) / RAD;
}

// The canvas point of a world point given by radius and true angle.
export function polarToCanvas(view, r, deg) {
  const d = dir(deg);
  return { x: view.cx + d.x * r * view.R, y: view.cy + d.y * r * view.R };
}

// state: { tableDeg, armDeg } — the table's normal and the
// detector arm as true angles — and what is on the bench: `specimen`
// ('slab', with `slabCm`, or 'prisms', with `gapCm`), `beamBlock`, and
// `readout`, the meter's display as text, drawn beside the receiver.
export function drawGoniometer(ctx, view, state) {
  const { cx, cy, R, width, height } = view;
  const { tableDeg, armDeg, specimen, slabCm, gapCm, beamBlock, readout } = state;
  const P = (r, deg) => polarToCanvas(view, r, deg);
  const outline = (lw = 1.2) => {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = lw;
    ctx.stroke();
  };
  // A shape along a direction: pts are [along, across] in world units.
  const along = (deg, pts) => {
    const d = dir(deg);
    const n = { x: -d.y, y: d.x };
    ctx.beginPath();
    pts.forEach(([a, c], i) => {
      const x = cx + (d.x * a + n.x * c) * R;
      const y = cy + (d.y * a + n.y * c) * R;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.closePath();
  };

  ctx.clearRect(0, 0, width, height);

  // The graduated circle: a printed ring, divided every half-degree from
  // its inner edge outward, longer every 5, longest and numbered every 10.
  ctx.beginPath();
  ctx.arc(cx, cy, RING_OUTER * R, 0, 2 * Math.PI);
  ctx.arc(cx, cy, RING_INNER * R, 0, 2 * Math.PI, true);
  ctx.fillStyle = STEEL;
  ctx.fill('evenodd');
  outline(1.3);
  ctx.beginPath();
  ctx.arc(cx, cy, RING_INNER * R, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(78,197,255,.04)';
  ctx.fill();

  const lineW = Math.max(0.5, 0.0035 * R);
  const fontPx = Math.min(13, Math.max(9, 0.055 * R));
  ctx.font = `600 ${fontPx}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Every 10° numbered where three-digit numerals fit apart round the
  // ring; every 20° on a phone, where they would touch.
  const numeralR = 0.925;
  const labelEvery = 10 * RAD * numeralR * R > fontPx * 2.4 ? 10 : 20;
  for (let h = -359; h <= 360; h++) {
    const deg = h / 2; // -179.5 to 180
    const isTen = deg % 10 === 0;
    const isFive = !isTen && deg % 5 === 0;
    const len = isTen ? 0.075 : isFive ? 0.055 : 0.032;
    const a = P(RING_INNER, deg);
    const b = P(RING_INNER + len, deg);
    ctx.beginPath();
    ctx.strokeStyle = isTen ? 'rgba(6,10,15,.92)' : 'rgba(6,10,15,.6)';
    ctx.lineWidth = lineW;
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (deg % labelEvery === 0) {
      // Upright at the top of the circle, where the arms work: each
      // numeral's foot points at the centre.
      const lp = P(numeralR, deg);
      const d = dir(deg);
      ctx.save();
      ctx.translate(lp.x, lp.y);
      ctx.rotate(Math.atan2(d.y, d.x) + Math.PI / 2);
      ctx.fillStyle = INK;
      ctx.fillText(String(Math.abs(deg)), 0, 0);
      ctx.restore();
    }
  }

  // An arm: a bar from the centre to the circle, a hairline index across
  // the printed ring with a notch at either edge, the bar again beyond it,
  // and at the end the device's box with its horn opening towards the centre.
  const arm = (deg) => {
    along(deg, [[0, -ARM_HALF_WIDTH], [RING_INNER - 0.015, -ARM_HALF_WIDTH], [RING_INNER - 0.015, ARM_HALF_WIDTH], [0, ARM_HALF_WIDTH]]);
    ctx.fillStyle = ARM_STEEL;
    ctx.fill();
    outline();
    along(deg, [[RING_OUTER + 0.015, -ARM_HALF_WIDTH], [HORN.mouthAt, -ARM_HALF_WIDTH], [HORN.mouthAt, ARM_HALF_WIDTH], [RING_OUTER + 0.015, ARM_HALF_WIDTH]]);
    ctx.fill();
    outline();
    const notch = 0.03;
    for (const [r0, r1] of [[RING_INNER - 0.015, RING_INNER + 0.012], [RING_OUTER + 0.015, RING_OUTER - 0.012]]) {
      along(deg, [[r0, -notch], [r1, 0], [r0, notch]]);
      ctx.fillStyle = INK;
      ctx.fill();
    }
    const a = P(RING_INNER, deg);
    const b = P(RING_OUTER, deg);
    ctx.beginPath();
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(0.75, lineW);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    along(deg, [[HORN.throatAt, -HORN.box], [ARM_REACH, -HORN.box], [ARM_REACH, HORN.box], [HORN.throatAt, HORN.box]]);
    ctx.fillStyle = HORN_STEEL;
    ctx.fill();
    outline();
    along(deg, [[HORN.mouthAt, -HORN.mouth], [HORN.throatAt, -HORN.throat], [HORN.throatAt, HORN.throat], [HORN.mouthAt, HORN.mouth]]);
    ctx.fillStyle = ARM_STEEL;
    ctx.fill();
    outline();
  };

  // Source arm, fixed at true 0: the transmitter, and the plano-cylindrical
  // lens between it and the centre, flat face towards the transmitter.
  arm(0);
  {
    const d = dir(0);
    const n = { x: -d.y, y: d.x };
    const half = 0.13;
    const bulge = 0.05;
    const flat = LENS_AT + 0.025;
    ctx.beginPath();
    const pt = (a, c) => ({ x: cx + (d.x * a + n.x * c) * R, y: cy + (d.y * a + n.y * c) * R });
    const s = pt(flat, -half);
    ctx.moveTo(s.x, s.y);
    const e = pt(flat, half);
    ctx.lineTo(e.x, e.y);
    const m = pt(flat - 0.03 - 2 * bulge, 0);
    const f = pt(flat - 0.03, half);
    ctx.lineTo(f.x, f.y);
    const g = pt(flat - 0.03, -half);
    ctx.quadraticCurveTo(m.x, m.y, g.x, g.y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(233,238,243,.9)';
    ctx.fill();
    outline();
  }

  // Detector arm, carrying the receiver, and the beam block when it is
  // placed: a plate across the arm in front of the horn.
  arm(armDeg);
  if (beamBlock) {
    along(armDeg, [[BLOCK_AT - 0.012, -0.15], [BLOCK_AT + 0.012, -0.15], [BLOCK_AT + 0.012, 0.15], [BLOCK_AT - 0.012, 0.15]]);
    ctx.fillStyle = BLOCK;
    ctx.fill();
    outline();
  }

  // The table, on top of both arms' pivots: a disc with a mounting clamp
  // across it, and a pointer along the mounted face's normal out to the
  // circle.
  ctx.beginPath();
  ctx.arc(cx, cy, TABLE_RADIUS * R, 0, 2 * Math.PI);
  ctx.fillStyle = TABLE_STEEL;
  ctx.fill();
  outline(1.3);
  along(tableDeg + 90, [[-0.33, -0.022], [0.33, -0.022], [0.33, 0.022], [-0.33, 0.022]]);
  ctx.fillStyle = ARM_STEEL;
  ctx.fill();
  outline();
  along(tableDeg, [[TABLE_RADIUS - 0.01, -0.025], [RING_INNER - 0.01, -0.004], [RING_INNER - 0.01, 0.004], [TABLE_RADIUS - 0.01, 0.025]]);
  ctx.fillStyle = INK;
  ctx.fill();
  const a = P(TABLE_RADIUS, tableDeg);
  const b = P(RING_INNER + 0.02, tableDeg);
  ctx.beginPath();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(0.75, lineW);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 0.03 * R, 0, 2 * Math.PI);
  ctx.fillStyle = ARM_STEEL;
  ctx.fill();
  outline(1);

  const cm = 1 / CIRCLE_RADIUS_CM;
  if (specimen === 'slab') {
    // Front face across the centre, along the clamp; the slab behind it,
    // away from the source.
    const t = slabCm * cm;
    const w = (SLAB_WIDTH_CM / 2) * cm;
    along(tableDeg, [[0, -w], [-t, -w], [-t, w], [0, w]]);
    ctx.fillStyle = POLYMER;
    ctx.fill();
    outline(1.3);
  } else if (specimen === 'prisms') {
    // Two equilateral prisms face to face across the gap, in the beam's own
    // frame: the first face square to the source arm, the faces either side
    // of the gap at 30° to the beam, the last face square to it again.
    const s3 = Math.sqrt(3);
    const a = PRISM_SIDE_CM * cm;
    const d = gapCm * cm;
    // In beam coordinates (x towards the receiver, y across, down the
    // screen): the first prism's entry face is x = -a√3/4, and its gap face
    // runs from (-a√3/4, -a/4) to (a√3/4, a/4), through the centre. The
    // second is the first turned half a turn about the centre; each sits
    // half the gap off it, along the gap face's normal.
    const n = { x: -0.5, y: s3 / 2 };
    const half = d / 2;
    const P1 = [[-a * s3 / 4, -a / 4], [-a * s3 / 4, (3 * a) / 4], [a * s3 / 4, a / 4]]
      .map(([x, y]) => [x + n.x * half, y + n.y * half]);
    const P2 = P1.map(([x, y]) => [-x, -y]);
    for (const tri of [P1, P2]) {
      along(180, tri);
      ctx.fillStyle = WAX;
      ctx.fill();
      outline(1.3);
    }
  }

  // The meter's display, beside the receiver: upright, on the side of the
  // arm away from the source, kept inside the canvas.
  if (readout != null) {
    const d = dir(armDeg);
    const side = d.y <= 0 ? 1 : -1;
    const n = { x: -d.y * side, y: d.x * side };
    const at = { x: cx + (d.x * 1.32 + n.x * 0.2) * R, y: cy + (d.y * 1.32 + n.y * 0.2) * R };
    const fontPx = Math.min(15, Math.max(11, 0.065 * R));
    ctx.font = `600 ${fontPx}px ${FONT}`;
    const text = `${readout} mA`;
    const w = ctx.measureText(text).width + 14;
    const h = fontPx + 10;
    const x = Math.min(width - w - 4, Math.max(4, at.x - w / 2));
    const y = Math.min(height - h - 4, Math.max(4, at.y - h / 2));
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fillStyle = 'rgb(4,8,12)';
    ctx.fill();
    outline(1);
    ctx.fillStyle = '#4EC5FF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2 + 0.5);
  }
}
