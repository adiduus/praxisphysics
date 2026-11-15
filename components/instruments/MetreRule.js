'use client';

import { useEffect, useRef, useState } from 'react';
import AnchoredPopover from '../AnchoredPopover';
import { InstrumentNoteButton, InstrumentNotePopover, useInstrumentNote } from './InstrumentNote';
import { RULE_LENGTH_CM, RULE_RESOLUTION } from '@/lib/instruments/rule.mjs';
import { RULE_EXTENT, drawRule, ruleToClient } from '@/lib/instruments/ruleScene';

// The metre rule, as an instrument panel: the whole rule across the panel,
// and a magnifier that shows a few centimetres of it enlarged. There is no
// readout, as on the caliper. Blind to any experiment: the bench offers it
// `holdables` ({ key, label, cm }), solids it can be laid against, near face
// on the 0; holding one is a toggle in the panel.
//
// The magnifier is drawn by the same drawRule at a higher pxPerCm (the
// caliper's pattern) and placed by AnchoredPopover the way the caliper's
// is: beside the panel where there's room, tail on what the rule holds (or
// on where the magnifier is looking), never over the apparatus. A sideways
// drag inside it looks along the rule. At 120 px/cm a half-millimetre
// division is 6 px: enough to see that the slab's face (10.03 cm) falls
// between 10.00 and 10.05, not to read far inside a division. At 80 px/cm
// that face looked as if it sat on the 10.

const MAG_PX_PER_CM = 120;
const MAG_HEIGHT_PX = 168;
const MAG_MAX_WIDTH_PX = 620;
const MAG_TOP_CM = -0.4;
const MAG_MIN_BESIDE_PX = 360;

const ASPECT = (RULE_EXTENT.right - RULE_EXTENT.left) / (RULE_EXTENT.bottom - RULE_EXTENT.top);
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function setupCanvas(canvas, w, h) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// As VernierCaliper's magWidth: beside the panel when there's room there.
function magWidth(panel) {
  const vw = document.documentElement.clientWidth;
  const r = panel?.getBoundingClientRect();
  const beside = r ? Math.floor(Math.max(r.left, vw - r.right) - 24 - 30) : 0;
  if (beside >= MAG_MIN_BESIDE_PX) return Math.min(MAG_MAX_WIDTH_PX, beside);
  return Math.min(MAG_MAX_WIDTH_PX, vw - 16 - 30);
}

export default function MetreRule({ holdables = [] }) {
  const note = useInstrumentNote('rule');
  const [benchW, setBenchW] = useState(0);
  const [heldKey, setHeldKey] = useState(null);
  const [magOpen, setMagOpen] = useState(false);
  const [magW, setMagW] = useState(0);
  const [lookCm, setLookCm] = useState(null); // the magnifier's centre along the rule
  const held = holdables.find((h) => h.key === heldKey) ?? null;
  const heldCm = held ? held.cm : null;

  const benchRef = useRef(null);
  const magRef = useRef(null);
  const viewRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    const canvas = benchRef.current;
    if (!canvas) return undefined;
    const measure = () => setBenchW(canvas.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = benchRef.current;
    if (!canvas || !benchW) return;
    const h = benchW / ASPECT;
    const ctx = setupCanvas(canvas, benchW, h);
    const pxPerCm = benchW / (RULE_EXTENT.right - RULE_EXTENT.left);
    const view = { originX: -RULE_EXTENT.left * pxPerCm, originY: -RULE_EXTENT.top * pxPerCm, pxPerCm, width: benchW, height: h };
    viewRef.current = view;
    drawRule(ctx, view, { heldCm });
  }, [benchW, heldCm]);

  useEffect(() => {
    if (!magOpen) return undefined;
    const onResize = () => setMagW(magWidth(note.panelRef.current));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [magOpen, note.panelRef]);

  // Opened on what the rule holds, its far face a little right of centre so
  // the divisions before it are in view; with nothing held, on the 0.
  const halfCm = magW / 2 / MAG_PX_PER_CM;
  const look = lookCm ?? (heldCm != null ? heldCm - halfCm / 3 : halfCm - 0.5);

  useEffect(() => {
    const canvas = magRef.current;
    if (!magOpen || !canvas || !magW) return;
    const ctx = setupCanvas(canvas, magW, MAG_HEIGHT_PX);
    const view = {
      originX: magW / 2 - look * MAG_PX_PER_CM,
      originY: -MAG_TOP_CM * MAG_PX_PER_CM,
      pxPerCm: MAG_PX_PER_CM,
      width: magW,
      height: MAG_HEIGHT_PX,
    };
    drawRule(ctx, view, { heldCm });
  }, [magOpen, magW, look, heldCm]);

  const onMagDown = (e) => {
    e.preventDefault();
    magRef.current.setPointerCapture(e.pointerId);
    dragRef.current = { x0: e.clientX, from: look };
  };
  const onMagMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    setLookCm(clamp(d.from - (e.clientX - d.x0) / MAG_PX_PER_CM, -halfCm + 0.5, RULE_LENGTH_CM + halfCm - 0.5));
  };
  const onMagUp = () => {
    dragRef.current = null;
  };

  const toggleMag = () => {
    if (!magOpen) setMagW(magWidth(note.panelRef.current));
    setMagOpen(!magOpen);
    setLookCm(null);
  };
  const toggleHeld = (h) => {
    setHeldKey(heldKey === h.key ? null : h.key);
    setLookCm(null);
  };

  // The tail points at where the magnifier opened: the held face, or the 0.
  const anchorPoint = () =>
    viewRef.current && benchRef.current
      ? ruleToClient(benchRef.current, viewRef.current, heldCm ?? 0, 0)
      : null;

  return (
    <div className="instrument rule" ref={note.panelRef}>
      <div className="instrument-head">
        <b>METRE RULE</b>
        <span className="instrument-head-end">
          <span className="instrument-res">{RULE_RESOLUTION}cm</span>
          <InstrumentNoteButton note={note} name="metre rule" />
        </span>
      </div>
      <InstrumentNotePopover note={note} name="metre rule">
        A metre rule divided in half-millimetres, its 0 at the end. MAGNIFIER shows a few
        centimetres of it enlarged.
      </InstrumentNotePopover>
      <canvas
        ref={benchRef}
        className="rule-canvas"
        style={{ height: benchW ? benchW / ASPECT : undefined }}
        aria-label="Metre rule. Open the magnifier to read it."
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
      <AnchoredPopover
        open={magOpen}
        box={note.panelRef}
        anchor={anchorPoint}
        label="Metre rule magnifier"
        className="caliper-magnifier rule-magnifier"
      >
        <canvas
          ref={magRef}
          style={{ width: magW || undefined, height: MAG_HEIGHT_PX }}
          aria-label="The rule, enlarged. Drag sideways to look along it."
          onPointerDown={onMagDown}
          onPointerMove={onMagMove}
          onPointerUp={onMagUp}
          onPointerCancel={onMagUp}
        />
        <div className="caliper-magnifier-foot">
          <p>Drag sideways to look along the rule.</p>
          <button type="button" onClick={toggleMag}>
            CLOSE
          </button>
        </div>
      </AnchoredPopover>
    </div>
  );
}
