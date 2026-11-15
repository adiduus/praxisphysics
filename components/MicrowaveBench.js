'use client';

import { useCallback, useEffect, useState } from 'react';
import Goniometer from './Goniometer';
import BenchHint from './BenchHint';
import InstrumentMenu from './instruments/InstrumentMenu';
import Multimeter from './instruments/Multimeter';
import VernierCaliper from './instruments/VernierCaliper';
import MetreRule from './instruments/MetreRule';
import { SLAB_T, detectorSignal, gapTransmission, slabReflectance } from '@/lib/microwave/model.mjs';
import { MULTIMETER_RESOLUTION, createMultimeter } from '@/lib/microwave/instruments.mjs';
import { microwaveDevices } from '@/data/microwaveDevices';

// The microwave optics bench: the goniometer pinned above, the instrument
// menu, and the panels. What the receiver sees comes from
// lib/microwave/model.mjs and nowhere else:
//
//   Part A, slab mounted     the slab's reflectance at the true angle of
//                            incidence (the arm is geared onto the specular
//                            direction, docs/microwave-bench.md)
//   Part A, nothing mounted  nothing: the arm is never within 20° of the
//                            straight-through beam (Goniometer's TABLE_MAX)
//   Part B, prisms mounted   the transmission across the gap, arms in line
//   Part B, nothing mounted  the whole beam, arms in line
//   beam block placed        nothing
//
// and the meter reads its amplitude, through createMultimeter's noise and
// session dark current. A reading is taken whenever anything that changes
// the signal changes, and again on READ, so "read it three times" is three
// presses; nothing animates, so it settles at once.
//
// Specimens and instruments are toggled from the menu, like the pendulum's
// scale and angle plate: mounted, never positioned. Mounting snaps a
// specimen into the table's clamp. The caliper is offered what this part's
// bench holds — the slab, or the gap once the prisms are on — and closes
// onto it (VernierCaliper's `holdables`). Part A also has the metre rule,
// so "something to measure thickness with" is a choice: the slab is laid
// against it and its far face falls between the half-millimetre divisions
// (10.03 cm, docs/optics-plan.md). Part B doesn't offer it: a rule can't
// be put into the gap.
//
// The gap adjuster never shows the gap: it is a bare slider, with no value
// for a screen reader either, and the caliper is how it is measured.

const MENU = {
  parta: [
    { key: 'slab', label: 'SLAB' },
    { key: 'multimeter', label: 'MULTIMETER' },
    { key: 'caliper', label: 'CALIPER' },
    { key: 'rule', label: 'METRE RULE' },
    { key: 'block', label: 'BEAM BLOCK' },
  ],
  partb: [
    { key: 'prisms', label: 'PRISMS' },
    { key: 'multimeter', label: 'MULTIMETER' },
    { key: 'caliper', label: 'CALIPER' },
    { key: 'block', label: 'BEAM BLOCK' },
  ],
};

const RULE_HOLDS = [{ key: 'slab', label: 'ON THE SLAB', cm: SLAB_T }];
const GAP_MAX_CM = 2;
const GAP_START_CM = 0.8;
const TABLE_START = 45;

export default function MicrowaveBench({ part = 'parta' }) {
  const [meter, setMeter] = useState(null);
  const [table, setTable] = useState(TABLE_START);
  const [gap, setGap] = useState(GAP_START_CM);
  const [open, setOpen] = useState({ parta: {}, partb: {} }); // every part's bench starts empty
  const [reading, setReading] = useState(null);
  const [reads, setReads] = useState(0);

  // Session-seeded, so made on the client.
  useEffect(() => {
    setMeter(createMultimeter());
  }, []);

  const partB = part === 'partb';
  const on = open[part] ?? {};
  const toggle = useCallback(
    (key) => setOpen((o) => ({ ...o, [part]: { ...o[part], [key]: !o[part]?.[key] } })),
    [part]
  );

  // The intensity at the receiver, as a fraction of the beam.
  let intensity = 0;
  if (on.block) intensity = 0;
  else if (partB) intensity = on.prisms ? gapTransmission(gap) : 1;
  else if (on.slab) intensity = slabReflectance(table);

  useEffect(() => {
    if (meter) setReading(meter.read(detectorSignal(intensity)));
  }, [meter, intensity, reads]);

  const specimen = partB ? (on.prisms ? 'prisms' : null) : on.slab ? 'slab' : null;
  const holdables = partB
    ? on.prisms
      ? [{ key: 'gap', label: 'IN THE GAP', kind: 'inside', cm: gap }]
      : []
    : [{ key: 'slab', label: 'ON THE SLAB', kind: 'outside', cm: SLAB_T }];

  return (
    <div className="pendulum-lab microwave-bench">
      <Goniometer
        table={table}
        onTable={setTable}
        inLine={partB}
        specimen={specimen}
        slabCm={SLAB_T}
        gapCm={gap}
        beamBlock={!!on.block}
        readout={on.multimeter && reading != null ? reading.toFixed(3) : null}
        hint={
          <BenchHint id="microwave">
            Drag the table, or the detector arm, to turn them; the arrow keys step the table a
            half-degree at a time. Mount a specimen and bring instruments onto the bench from the
            menu below. In Part B the arms sit in line, and GAP sets the prisms&rsquo; separation.
          </BenchHint>
        }
      >
        {partB && on.prisms && (
          <label className="gap-control">
            <span>GAP</span>
            <input
              type="range"
              min={0}
              max={GAP_MAX_CM}
              step={0.001}
              value={gap}
              aria-label="Prism gap adjuster"
              aria-valuetext="gap adjuster"
              onChange={(e) => setGap(Number(e.target.value))}
            />
          </label>
        )}
      </Goniometer>

      <InstrumentMenu items={MENU[part]} open={on} onToggle={toggle} />

      <div className="instrument-panels">
        {on.multimeter && (
          <Multimeter
            reading={reading}
            resolution={MULTIMETER_RESOLUTION}
            unit="mA"
            decimals={3}
            onRead={() => setReads((n) => n + 1)}
            note={microwaveDevices.multimeter.note}
          />
        )}
        {on.caliper && <VernierCaliper holdables={holdables} />}
        {!partB && on.rule && <MetreRule holdables={RULE_HOLDS} />}
      </div>
    </div>
  );
}
