'use client';

import { InstrumentNoteButton, InstrumentNotePopover, useInstrumentNote } from './InstrumentNote';

// A digital meter's panel: the reading, and READ, which takes the next one.
// Blind to the experiment, like every instrument here (docs/conventions.md):
// the bench hands it `reading` (already through the meter's own noise,
// offset and quantize — lib/microwave/instruments.mjs's createMultimeter)
// and takes a fresh one when READ is pressed. It never averages; three
// readings are three presses. `note` is the device's own description.
export default function Multimeter({ reading, resolution, unit, decimals, onRead, note: noteText }) {
  const note = useInstrumentNote('multimeter');
  return (
    <div className="instrument multimeter" ref={note.panelRef}>
      <div className="instrument-head">
        <b>MULTIMETER</b>
        <span className="instrument-head-end">
          <span className="instrument-res">
            {resolution}
            {unit}
          </span>
          <InstrumentNoteButton note={note} name="multimeter" />
        </span>
      </div>
      <InstrumentNotePopover note={note} name="multimeter">
        {noteText}
      </InstrumentNotePopover>
      <div className="instrument-read" aria-live="polite">
        {reading == null ? '—' : reading.toFixed(decimals)}
        <span className="unit">{unit}</span>
      </div>
      <div className="instrument-controls">
        <button type="button" onClick={onRead}>
          READ
        </button>
      </div>
    </div>
  );
}
