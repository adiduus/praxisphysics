'use client';

import { useEffect, useRef, useState } from 'react';
import { InstrumentNoteButton, InstrumentNotePopover, useInstrumentNote } from './instruments/InstrumentNote';
import { GONIOMETER_RESOLUTION } from '@/lib/microwave/instruments.mjs';
import { ARM_REACH, GONIOMETER_EXTENT, TABLE_RADIUS, angleAt, drawGoniometer } from '@/lib/microwave/goniometerScene';

// The microwave goniometer, as the bench's pinned apparatus: the graduated
// circle, the fixed source arm with the transmitter and its lens, the
// detector arm with the receiver, and the table at the centre. No beam is
// drawn and nothing animates; the canvas is redrawn when its state changes
// or it resizes.
//
// The detector arm is geared to the table at two to one
// (docs/microwave-bench.md, Part A step 2), so it always sits on the
// direction a mounted face would reflect into. The student turns either:
// dragging the table turns it, dragging the arm turns the table through
// half as much. The table's pointer stops on the circle's half-degree
// divisions, which is how scripts/microwave-verify.mjs steps its scan; the
// arm lands at twice that. The circle has no zero offset (see
// createGoniometer in lib/microwave/instruments.mjs).
//
// `inLine` is Part B's set-up: the gearing released, the arm straight
// through (true 180°) and the table clamped square to the beam, so nothing
// turns; the prisms fix the angle at the gap.
//
// Controlled by the bench (MicrowaveBench.js) through `table` and
// `onTable`, which it needs for the meter; on its own (its audit page) it
// keeps its own. `children` go in the controls strip under the canvas, and
// `hint` (the bench's BenchHint) under that, inside the pinned frame.

export const TABLE_MIN = 15; // the receiver's horn clears the transmitter's
// The arm stays well off the straight-through beam, where the receiver
// sees nothing unless something on the table reflects into it.
export const TABLE_MAX = 80;
const TABLE_START = 45;
const KEY_STEP_BIG = 5;
const FILL = 0.96;
const IN_LINE_TABLE_DEG = 90; // true: the clamp along the beam
const IN_LINE_ARM_DEG = 180;

export const snapTable = (p) =>
  Math.min(TABLE_MAX, Math.max(TABLE_MIN, Math.round(p / GONIOMETER_RESOLUTION) * GONIOMETER_RESOLUTION));

export default function Goniometer({
  table: tableProp,
  onTable,
  inLine = false,
  specimen = null,
  slabCm,
  gapCm,
  beamBlock = false,
  readout = null,
  hint = null,
  children,
}) {
  const note = useInstrumentNote('goniometer');
  const [ownTable, setOwnTable] = useState(TABLE_START); // the table pointer's reading, degrees
  const [size, setSize] = useState(null);
  const canvasRef = useRef(null);
  const viewRef = useRef(null);
  const dragRef = useRef(null);

  const table = tableProp ?? ownTable;
  const setTable = (next) => {
    const v = typeof next === 'function' ? next(table) : next;
    if (onTable) onTable(v);
    else setOwnTable(v);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const measure = () => {
      const r = canvas.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const tableDeg = inLine ? IN_LINE_TABLE_DEG : table;
  const armDeg = inLine ? IN_LINE_ARM_DEG : 2 * tableDeg;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size || !size.w) return;
    const { w, h } = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const E = GONIOMETER_EXTENT;
    const R = Math.min((w * FILL) / (E.right - E.left), (h * FILL) / (E.bottom - E.top));
    const view = { cx: w / 2 - ((E.left + E.right) / 2) * R, cy: h / 2 - ((E.top + E.bottom) / 2) * R, R, width: w, height: h };
    viewRef.current = view;
    drawGoniometer(ctx, view, { tableDeg, armDeg, specimen, slabCm, gapCm, beamBlock, readout });
  }, [size, tableDeg, armDeg, specimen, slabCm, gapCm, beamBlock, readout]);

  // Grab the table anywhere on its disc, or the detector arm anywhere along
  // it; the drag turns from where it was grabbed, so nothing jumps.
  const onDown = (e) => {
    const view = viewRef.current;
    if (!view || inLine) return;
    const r = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - r.left;
    const py = e.clientY - r.top;
    const dist = Math.hypot(px - view.cx, py - view.cy) / view.R;
    const at = angleAt(view, px, py);
    const offArm = Math.abs(((at - armDeg + 540) % 360) - 180);
    let gear;
    if (dist <= TABLE_RADIUS + 0.05) gear = 1;
    else if (dist <= ARM_REACH + 0.05 && offArm * (Math.PI / 180) * dist < 0.09) gear = 0.5;
    else return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    dragRef.current = { from: table, gear, last: at, turned: 0 };
    canvasRef.current.classList.add('dragging');
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const r = canvasRef.current.getBoundingClientRect();
    const at = angleAt(viewRef.current, e.clientX - r.left, e.clientY - r.top);
    // Unwrapped, so a drag across the ±180° seam keeps turning the same way.
    d.turned += ((at - d.last + 540) % 360) - 180;
    d.last = at;
    setTable(snapTable(d.from + d.turned * d.gear));
  };
  const onUp = () => {
    dragRef.current = null;
    canvasRef.current?.classList.remove('dragging');
  };
  const onKey = (e) => {
    if (inLine) return;
    const step = e.shiftKey ? KEY_STEP_BIG : GONIOMETER_RESOLUTION;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setTable((t) => snapTable(t + step));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setTable((t) => snapTable(t - step));
    else return;
    e.preventDefault();
  };

  return (
    <div className="goniometer-frame bench-pinned" ref={note.panelRef}>
      <canvas
        ref={canvasRef}
        className={`goniometer-canvas${inLine ? ' in-line' : ''}`}
        data-table={inLine ? undefined : table}
        tabIndex={0}
        aria-label={
          inLine
            ? 'Goniometer, seen from above, with the arms in line through the table.'
            : 'Goniometer, seen from above. Drag the table, or the detector arm, or use the arrow keys, to turn them; the arm turns through twice the table’s angle.'
        }
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      />
      <div className="goniometer-controls">
        <b>GONIOMETER</b>
        {children}
        <span className="instrument-head-end">
          <span className="instrument-res">{GONIOMETER_RESOLUTION}°</span>
          <InstrumentNoteButton note={note} name="goniometer" />
        </span>
      </div>
      {hint}
      <InstrumentNotePopover note={note} name="goniometer">
        The circle is divided in half-degrees and numbered every 10°. The source arm is fixed. The
        detector arm is geared to the table and turns through twice its angle, so turning either
        turns both, a half-degree at a time; for a straight-through set-up the gearing is released
        and the arms sit in line. The table&rsquo;s pointer and each arm read against the circle.
      </InstrumentNotePopover>
    </div>
  );
}
