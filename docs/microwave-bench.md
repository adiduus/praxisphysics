# Microwave optics — bench specification

Everything below is decided. Where something depends on code I cannot see, it
is marked **CHECK** and Claude Code should resolve it against the repo rather
than ask.

Governing rule, as everywhere on the site: nothing is computed for the student.
The task says what to produce, the bench explains its own controls, the guide
teaches the method.

---

## What is drawn

A top-down schematic of the goniometer, filling the pinned apparatus region.
No beam is drawn. There is no ray, no wavefront, no shading to suggest where
the microwaves go — the student sets a geometry and reads a number, which is
exactly what the real bench gives you.

Drawn, on canvas, DPR-aware, with the existing `ResizeObserver` and
`IntersectionObserver` pausing:

- A graduated circle, divided every 0.5°, numbered every 10°, its 0 on the
  beam axis. There is no printed-zero offset; see the Goniometer section.
- The **source arm**, fixed, carrying the transmitter and the
  plano-cylindrical lens.
- The **detector arm**, rotatable, carrying the receiver.
- The **table** at the centre, which rotates independently and carries whatever
  specimen is mounted.
- A small digital readout beside the receiver showing the current meter value,
  so the student can watch it while turning the arm. The multimeter's own
  controls live in the instrument panel.

Nothing animates. The readout settles immediately when an arm stops.

---

## Devices

### Transmitter

Fixed. No controls. A note states λ = 2.850 ± 0.005 cm and that the figure is
the source's stability, not a measurement the student is expected to make.

### Goniometer

Two arms about a common centre, each against the same scale.

- The detector arm **snaps to 0.5° divisions**. Dragging it between divisions
  is not possible.
- The table rotates independently, also snapping to 0.5°.
- Angle of incidence θ is read off the scale.

Snapping is deliberate: this experiment is about reading angles and doing the
algebra, not about fine motor control. Nothing is taught by letting a student
land on 36.37°.

**As built** (`components/Goniometer.js`). With the arm coupled to the table
(Part A step 2), only one of them can stop on divisions, so the table does.
Its pointer stops on the half-degree divisions, which is how
`scripts/microwave-verify.mjs` steps its scan, and the arm sits at twice that.
Dragging either one turns the table. Its range is 15° to 80°. At 15° the receiver's
horn still clears the transmitter. At 80° the arm is still 20° off the
straight-through beam: nothing models the receiver near that beam (see the
coupling note in Part A), so with nothing mounted it reads only the dark
current. Part B uses `inLine`: the gearing is released, the arm goes
straight through (180°), and the table is clamped.

**No printed-zero offset.** An earlier version of this spec gave the scale a
session-seeded offset of 0.3° to 1.0°, on the grounds that it cancels in
sin²θ₂ − sin²θ₁. It does not cancel in n. The order is safe, because 2m − 1
still rounds to 19 at any offset in that range. But n comes from each angle
on its own:

- at +0.85°, a student who reads both minima correctly gets n = 1.5442
  against a true 1.5400, with a stated uncertainty of about 0.003, and
  AnswerBox marks the interval as missing;
- at 0.3° the error is already 0.0016, so most sessions in the seeded range
  would fail.

The worked example deliberately leaves the offset out, so with it the guide
would model a procedure the bench defeats. Correcting the example instead
would mean regenerating Table A, Fig. 5.3 and the result, and adding an
uncertainty term for reading the source arm's index. The offset is removed
instead: `createGoniometer` has no zero, and the circle's 0 is on the beam.
(The verify script's simulated student had subtracted a reading taken with
the arms in line, which is why its checks passed with the offset.)

### Multimeter

A digital readout of the receiver output, in mA.

- **It reads amplitude, not intensity.** S ∝ √I. This is stated plainly on the
  instrument note. Every consequence in both parts follows from it, and
  withholding it would make the experiment a guessing game rather than a hard
  one.
- Resolution 0.001 mA, via `quantize`.
- Noise: three successive readings at the same geometry differ. The student
  averages. This is what makes "read it three times" meaningful rather than
  ritual.
- A **session-seeded dark current** of 0.01 to 0.03 mA, from `sessionUniform`,
  present in every reading.
- Nothing anywhere says the dark current exists, and nothing suggests blocking
  the beam. It is on the deliberately-not-provided list, and the worked example
  in the guide is where a student finds out what it costs.

### Beam block

A plate that can be placed in front of the receiver. This is the only route to
measuring the dark current, and it is listed in the equipment with no
explanation of why you would use it.

### Vernier caliper

Does **not** snap. Reading a vernier is the skill.

- Jaws open and close by dragging.
- A **magnifier popover** shows the main scale and the vernier scale enlarged,
  the same pattern as the pendulum's angle-plate magnifier, through
  `AnchoredPopover`.
- Resolution 0.005 cm.
- A **session-seeded jaw zero** of −0.01 to +0.01 cm, so the closed-jaw check
  matters. Unlike the vertical scale's deleted zero error, this one stays.
  The model is the authority on this figure: `lib/microwave/instruments.mjs`
  set ±0.01 cm before this spec was written, and the worked example's
  published numbers were generated from it, so the spec follows the model.
  (`CALIPER_MAX_ZERO` now lives in `lib/instruments/caliper.mjs`, which
  `instruments.mjs` re-exports.) It is also the realistic size: 0.1 mm of
  zero error on an instrument reading to 0.05 mm.

### Specimens

Mounted on the table, snapping into place:

- **Part A**: a polymer slab, true n = 1.5400, t = 10.03 cm. The thickness
  deliberately misses the metre rule's 0.05 cm divisions, so the caliper has to
  be used.
- **Part B**: two wax prisms face to face, true n = 1.4340, with an adjustable
  air gap. The beam enters normally and strikes the gap at 60°.

### Gap adjuster (Part B)

A control that sets the separation of the two prisms. It does **not** display
the gap: the student measures it with the caliper. A slider that announced
"1.100 cm" would hand over a measurement the task asks for.

### As built: specimens, meter, block, gap

Small choices made where this spec is silent, following the pendulum where it
has a precedent:

- **Mounting.** SLAB (Part A) and PRISMS (Part B) are instrument-menu toggles,
  like the pendulum's scale and angle plate: mounted, never positioned. Each
  snaps into the table's clamp. The slab's front face sits on the table's axis,
  so the reflection happens over the centre. Both are drawn true size, with the
  slab 30 cm wide and the prisms 15 cm a side. The spec gives neither size, and
  the model doesn't depend on either.
- **The caliper on the specimens.** The caliper panel offers what the part's
  bench holds. ON THE SLAB lets the main jaws close onto 10.03 cm. IN THE GAP
  (prisms mounted) lets the inside jaws, newly drawn above the beam, open onto
  the gap. If the adjuster narrows the gap on the jaws, they close with it.
  Both read through `createCaliper().read`, so the readings are the worked
  example's: `read(t) − read(0)`, and `read(d) − read(0)` for the gap.
- **Meter.** A reading is taken whenever the signal could change (table, gap,
  specimen, block) and again on READ, so three readings at one geometry are
  three presses. The display beside the receiver shows the same number as the
  panel, and only while the multimeter is on the bench. The note is
  `microwaveDevices.multimeter`, stated plainly.
- **What the receiver sees**, all from `model.mjs`:
  - Part A with the slab: `slabReflectance` at the true angle.
  - Part A without it: nothing.
  - Part B with the prisms: `gapTransmission`.
  - Part B without them: the whole beam (the arms are in line).
  - The beam block: nothing.
- **Beam block.** BEAM BLOCK puts a plate across the detector arm in front of
  the horn. It appears in the equipment sentence and the menu, with no note and
  no word in the bench hint about why you'd use it.
- **Gap adjuster.** GAP appears in the goniometer's controls once the prisms
  are mounted. It is a bare slider from 0 to 2.0 cm, starting at 0.8 cm, with
  no scale, no number, and an `aria-valuetext` that gives nothing away.
- **Two runs** are the student's procedure. The bench needs nothing for them:
  the gap can be set, measured and read as often as wanted.
- **Metre rule** (Part A, METRE RULE; `components/instruments/MetreRule.js`,
  `lib/instruments/rule.mjs`). This is the other answer to "something to
  measure thickness with". It is a 100 cm rule divided in half-millimetres,
  with its 0 at the end and no zero error. ON THE SLAB lays the slab against
  it, near face on the 0. Its magnifier, at 120 px/cm (a division is 6 px),
  shows the far face at its true 10.03 cm, between the 10.00 and 10.05 lines.
  The face is not snapped to the division `createRule().read` would give, so
  the student can see why the rule falls short. 120 px/cm is coarse enough
  that interpolating to 10.03 isn't realistic. At 80 px/cm the face looked as
  if it sat on the 10. The rule isn't offered in Part B, where it couldn't be
  put into the gap.
- **Not built:** the site listing. `/simulations/microwave` is noindex and not
  in `data/simulations.js` until it is released.

---

## Part A — the student's path

1. Measure the slab with the caliper, jaws closed first.
2. Mount the slab, set the detector arm to twice the table angle for specular
   reflection. **Resolved: the bench couples them.** Turning the table moves
   the detector arm with it, so the arm always sits on the specular
   direction, and θ is read off the scale as before. Three things in the code
   decide it:
   - `lib/microwave/model.mjs` gives the signal only as
     `slabReflectance(θ)`, which assumes the receiver is on the reflected beam.
     Nothing models what the receiver reads off that direction (the beam's
     width after the lens, how fast the signal falls away). Leaving the
     coupling to the student would need that model first. It would also have
     to be verified like the rest, and it would show only as a reading that
     drifts, since no beam is drawn.
   - The precedent is to supply geometry that isn't the skill being taught.
     The pendulum's angle plate and vertical scale are mounted, never
     positioned ("the student toggles whether each is mounted, never where it
     sits", docs/conventions.md), and HANG STRAIGHT sets the rest position
     for the student. The goniometer's 0.5° snapping already follows the same
     reasoning in this spec.
   - Nothing in Part A's task or answers depends on the student setting 2θ.
     A3 is the order and n, from two minimum angles.

   Part B needs no coupling: the arms sit in line through the prisms.
   `microwaveDevices.goniometer`'s note ("two arms rotating about a common
   centre") stays true. The student turns the table, and the arm follows.
3. Step θ from 30° to 70° in 0.5° steps, three meter readings at each.
4. Two minima appear. Read their angles.
5. Compute.

The task names no plot. A student who tables 81 rows and never draws them will
struggle to see where the minima are, which is the point — the figure in the
guide's worked example shows what a plot would have shown them.

## Part B — the student's path

1. Mount the prisms.
2. Set a gap, measure it with the caliper, read the meter three times.
3. Repeat across a range the student has to find. Below about 0.6 cm the
   transmitted signal is near its maximum and the exponential is hard to see;
   above about 1.4 cm it approaches the noise. Neither limit is stated.
4. Two runs, as the IPhO paper does.
5. Plot ln I against d and take the gradient.

The student computes ln I as a derived column rather than the plot having a log
axis. The linearisation is part of the method and should be done by hand.
**Resolved: yes, as a typed column, and nothing needs building.**
`components/DataTable.js` is "deliberately structure-free: no computed
columns, no built-in T² or averaging". The pendulum's T² column isn't
computed either. The student adds it with + COL, names it, and types each
value, which is exactly the by-hand linearisation wanted here. A student adds
an ln I column (and one for its uncertainty) the same way. `Plot.js` plots
any two columns, takes error bars from any column, and has no log axis, so
the only route to the straight line is the student's own column.

---

## Reused, not rebuilt

- `AnchoredPopover` for every instrument note and the caliper magnifier.
- `InstrumentNote` for the per-device notes.
- `BenchHint` for first-use hints.
- `QuickEntry` for table entry, with the student choosing columns.
- `AnswerBox` / `useCommittedAnswer`, with `accept: [10, 9]` and
  `integer: true` for the order, and `trueValue` for each index.
- `lib/instruments/rng.js` for every session-seeded value.
- `lib/instruments/reading.js` `quantize` for every resolution.
- `ExperimentWorkspace` with the `data` / `sim` panes.
- `lib/microwave/model.mjs` and `instruments.mjs`, which already exist and pass
  their 16 verification checks.

## New

- The goniometer canvas component.
- The vernier caliper component and its magnifier. This is the one genuinely
  new instrument, and it will be reused by Experiments 1 and 2.
- The gap adjuster.
- The beam block.

---

## Deliberately not provided

- That squaring and subtracting the two minimum conditions eliminates n.
- That 2m − 1 must be an odd integer.
- That ln I against d is the plot.
- Where the usable range of d begins and ends.
- That the meter has a dark current worth measuring.
- That the beam block is how you measure it.

---

## Build order

The caliper first, alone, with its own audit baseline. It is new, it is fiddly,
it is reused by two later experiments, and getting it wrong twice would be
expensive. Then the goniometer, then Part A end to end, then Part B.

Run `scripts/layout-audit.mjs` against a new baseline at each step. Six
regressions were caught that way on the pendulum.
