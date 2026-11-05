'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import AnchoredPopover from '../AnchoredPopover';
import { InstrumentNoteButton, InstrumentNotePopover, useInstrumentNote } from './InstrumentNote';
import { CALIPER_RANGE_CM, CALIPER_RESOLUTION, VERNIER_SPAN_CM, createCaliper } from '@/lib/instruments/caliper.mjs';
import { CALIPER_EXTENT, caliperToClient, drawCaliper } from '@/lib/instruments/caliperScene';

// The vernier caliper, as an instrument panel: the whole caliper drawn true
// to scale across the panel, its sliding jaw dragged open and closed, and a
// magnifier that shows the main and vernier scales enlarged. There is no
// readout — reading the vernier is the skill. Nothing snaps: the jaw goes
// wherever it is dragged, and the scales show that opening quantized to
// 0.005 cm with the session's zero error (lib/instruments/caliper.mjs).
//
// Blind to any experiment, like every instrument here (see
// docs/conventions.md): it knows only where its own jaw is, and what it is
// offered to hold. `holdables` is a list of { key, label, kind, cm } from the
// bench: kind 'outside' is a solid the main jaws close onto (they stop at
// cm), 'inside' a gap the inside jaws open onto (they stop at cm). Holding
// one is a toggle in the panel; the jaws then can't pass it. A gap that
// narrows on the jaws pushes them shut with it.
//
// The magnifier is drawn by the same drawCaliper as the panel, at a higher
// pxPerCm (the pendulum lens's pattern), and placed by AnchoredPopover:
// beside the panel, tail on the vernier, never over the apparatus. It stays
// open while the jaw is dragged, and follows the slider, so the student can
// watch the scales move; dragging inside it looks along them.

const START_OPENING_CM = 3; // open, so the closed-jaw check is the student's own move
const KEY_STEP_CM = 0.01;
const KEY_STEP_BIG_CM = 0.1;

const MAG_PX_PER_CM = 200; // 2 mm a division at 20 px/mm; neighbouring vernier lines miss by 1 px
const MAG_HEIGHT_PX = 196;
const MAG_MAX_WIDTH_PX = 620;
const MAG_TOP_CM = -0.5; // from just above the main numerals to just below the vernier's
// How far the magnifier can look along the scales, measured from the
// vernier's zero: back over the main-scale reading, on past the last line.
const PAN_MIN_CM = -1.2;
const PAN_MAX_CM = VERNIER_SPAN_CM + 1.1;

const ASPECT = (CALIPER_EXTENT.right - CALIPER_EXTENT.left) / (CALIPER_EXTENT.bottom - CALIPER_EXTENT.top);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function setupCanvas(canvas, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// The magnifier's width: as much of the vernier as the screen allows. Where
// the panel sits in a bench column with room beside it (the problem column),
// it is sized to open there, beside the panel: below it, under a pinned
// apparatus, there is no room for both on a laptop screen. 30 px is the
// popover's padding and border, 24 its gap and margin with a little slack
// for a panel edge that falls between pixels.
const MAG_MIN_BESIDE_PX = 360;
function magWidth(panel) {
  const vw = document.documentElement.clientWidth;
  const r = panel?.getBoundingClientRect();
  const beside = r ? Math.floor(Math.max(r.left, vw - r.right) - 24 - 30) : 0;
  if (beside >= MAG_MIN_BESIDE_PX) return Math.min(MAG_MAX_WIDTH_PX, beside);
  return Math.min(MAG_MAX_WIDTH_PX, vw - 16 - 30);
}

export default function VernierCaliper({ holdables = [] }) {
  const note = useInstrumentNote('caliper');
  const [caliper, setCaliper] = useState(null); // session-seeded, so made on the client
  const [opening, setOpening] = useState(START_OPENING_CM);
  const [benchW, setBenchW] = useState(0);
  const [magOpen, setMagOpen] = useState(false);
  const [magW, setMagW] = useState(0);
  // Where the magnifier looks, as an offset from the vernier's zero; it
  // rides with the slider, so this survives the jaw moving.
  const [pan, setPan] = useState(null);
  const [heldKey, setHeldKey] = useState(null);
  const held = holdables.find((h) => h.key === heldKey) ?? null;

  const benchRef = useRef(null);
  const magRef = useRef(null);
  const viewRef = useRef(null); // the panel canvas's view, for the popover's tail
  const dragRef = useRef(null);

  useEffect(() => setCaliper(createCaliper()), []);

  // The panel canvas fills the panel's width; its height follows.
  useEffect(() => {
    const canvas = benchRef.current;
    if (!canvas) return undefined;
    const measure = () => setBenchW(canvas.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  // A gap that closes on the inside jaws pushes them shut with it.
  useEffect(() => {
    if (held?.kind === 'inside' && opening > held.cm) setOpening(held.cm);
  }, [held, opening]);

  const vernierZero = caliper ? caliper.read(opening) : opening;
  const holds = held ? { kind: held.kind, cm: held.cm } : null;

  useEffect(() => {
    const canvas = benchRef.current;
    if (!canvas || !benchW || !caliper) return;
    const h = benchW / ASPECT;
    const ctx = setupCanvas(canvas, benchW, h);
    const pxPerCm = benchW / (CALIPER_EXTENT.right - CALIPER_EXTENT.left);
    const view = { originX: -CALIPER_EXTENT.left * pxPerCm, originY: -CALIPER_EXTENT.top * pxPerCm, pxPerCm, width: benchW, height: h };
    viewRef.current = view;
    drawCaliper(ctx, view, { openingCm: opening, vernierZeroCm: vernierZero, holds });
  }, [benchW, caliper, opening, vernierZero, held?.kind, held?.cm]);

  useEffect(() => {
    if (!magOpen) return undefined;
    const onResize = () => setMagW(magWidth(note.panelRef.current));
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [magOpen]);

  // Opened with the vernier's zero a little in from the left edge, so the
  // main-scale reading before it and the first lines after it are in view.
  const halfCm = magW / 2 / MAG_PX_PER_CM;
  const panCm = pan ?? clamp(halfCm - Math.min(0.8, halfCm / 2), PAN_MIN_CM, PAN_MAX_CM);

  useEffect(() => {
    const canvas = magRef.current;
    if (!magOpen || !canvas || !magW || !caliper) return;
    const ctx = setupCanvas(canvas, magW, MAG_HEIGHT_PX);
    const centre = vernierZero + panCm;
    const view = {
      originX: magW / 2 - centre * MAG_PX_PER_CM,
      originY: -MAG_TOP_CM * MAG_PX_PER_CM,
      pxPerCm: MAG_PX_PER_CM,
      width: magW,
      height: MAG_HEIGHT_PX,
    };
    drawCaliper(ctx, view, { openingCm: opening, vernierZeroCm: vernierZero, holds });
  }, [magOpen, magW, caliper, opening, vernierZero, panCm, held?.kind, held?.cm]);

  // The jaws go anywhere on the beam except through what they hold.
  const lo = held?.kind === 'outside' ? held.cm : 0;
  const hi = held?.kind === 'inside' ? held.cm : CALIPER_RANGE_CM;
  const moveJaw = useCallback((cm) => setOpening(clamp(cm, lo, hi)), [lo, hi]);

  // Putting something in the jaws needs room for it: a solid goes in with
  // the jaws opened past it, the inside jaws go into a gap shut.
  const toggleHeld = (h) => {
    if (heldKey === h.key) {
      setHeldKey(null);
      return;
    }
    if (h.kind === 'outside' && opening < h.cm) setOpening(Math.min(CALIPER_RANGE_CM, h.cm + 1));
    if (h.kind === 'inside') setOpening(0);
    setHeldKey(h.key);
  };

  // The slider is grabbed anywhere over it, jaw included; the drag moves it
  // by however far the pointer moves, so it doesn't jump to the pointer.
  const onBenchDown = (e) => {
    const view = viewRef.current;
    if (!view) return;
    const r = benchRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left - view.originX) / view.pxPerCm;
    if (x < opening - 1 || x > opening + 6) return;
    e.preventDefault();
    benchRef.current.setPointerCapture(e.pointerId);
    dragRef.current = { kind: 'jaw', x0: e.clientX, from: opening, pxPerCm: view.pxPerCm };
  };
  const onMagDown = (e) => {
    e.preventDefault();
    magRef.current.setPointerCapture(e.pointerId);
    dragRef.current = { kind: 'pan', x0: e.clientX, from: panCm };
  };
  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x0;
    if (d.kind === 'jaw') moveJaw(d.from + dx / d.pxPerCm);
    else setPan(clamp(d.from - dx / MAG_PX_PER_CM, PAN_MIN_CM, PAN_MAX_CM));
  };
  const onUp = () => {
    dragRef.current = null;
  };
  const onKey = (e) => {
    const step = e.shiftKey ? KEY_STEP_BIG_CM : KEY_STEP_CM;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') moveJaw(opening + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') moveJaw(opening - step);
    else return;
    e.preventDefault();
  };

  // Sized before it opens, so the popover picks its side at its real size.
  const toggleMag = () => {
    if (!magOpen) setMagW(magWidth(note.panelRef.current));
    setMagOpen(!magOpen);
    setPan(null);
  };

  // The tail points at the middle of the vernier, wherever the slider was
  // when the magnifier opened.
  const vernierPoint = () =>
    viewRef.current && benchRef.current
      ? caliperToClient(benchRef.current, viewRef.current, vernierZero + VERNIER_SPAN_CM / 2, 0)
      : null;

  return (
    <div className="instrument caliper" ref={note.panelRef}>
      <div className="instrument-head">
        <b>VERNIER CALIPER</b>
        <span className="instrument-head-end">
          <span className="instrument-res">{CALIPER_RESOLUTION}cm</span>
          <InstrumentNoteButton note={note} name="vernier caliper" />
        </span>
      </div>
      <InstrumentNotePopover note={note} name="vernier caliper">
        Drag the sliding jaw to open and close it. The main jaws, below the beam, close onto a
        solid; the inside jaws, above it, open into a gap. Both read the same scales: the main scale
        is in centimetres and millimetres, and the vernier reads to 0.005 cm. MAGNIFIER shows both
        scales enlarged.
      </InstrumentNotePopover>
      <canvas
        ref={benchRef}
        className="caliper-canvas"
        style={{ height: benchW ? benchW / ASPECT : undefined }}
        tabIndex={0}
        aria-label="Vernier caliper. Drag the sliding jaw, or use the arrow keys, to open and close it; open the magnifier to read the scales."
        onPointerDown={onBenchDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
      />
      <div className="instrument-controls">
        <button type="button" aria-pressed={magOpen} className={magOpen ? 'active' : ''} onClick={toggleMag}>
          MAGNIFIER
        </button>
        {holdables.map((h) => (
          <button
            key={h.key}
            type="button"
            aria-pressed={heldKey === h.key}
            className={heldKey === h.key ? 'active' : ''}
            onClick={() => toggleHeld(h)}
          >
            {h.label}
          </button>
        ))}
      </div>
      {/* No onDismiss: a press outside is usually the student dragging the
          jaw while watching the scales, which mustn't close it. */}
      <AnchoredPopover
        open={magOpen}
        box={note.panelRef}
        anchor={vernierPoint}
        label="Vernier caliper magnifier"
        className="caliper-magnifier"
      >
        <canvas
          ref={magRef}
          style={{ width: magW || undefined, height: MAG_HEIGHT_PX }}
          aria-label="The main and vernier scales, enlarged. Drag sideways to look along them."
          onPointerDown={onMagDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        <div className="caliper-magnifier-foot">
          <p>Drag sideways to look along the scales.</p>
          <button type="button" onClick={toggleMag}>
            CLOSE
          </button>
        </div>
      </AnchoredPopover>
    </div>
  );
}
