# Microwave optics: component work

The microwave experiment's physics (`lib/microwave/model.mjs`,
`lib/microwave/instruments.mjs`, checked by `scripts/microwave-verify.mjs`)
and its guide content (`data/microwaveGuide.js`) are written. The guide uses
three fields that no component reads yet. Each item below can be done on its
own. The bench will be added here once it is specified.

When an item is done, update the component's header comment and the
matching entry in `docs/conventions.md`. Both currently say these fields are
"not yet read".

## 1. AnswerBox: `accept`, a list of correct values

**Where it's used.** In Part A, task A3 asks for the order of interference.
The 30–70° scan contains two minima, order 10 at 36.5° and order 9 at 59.1°.
A student may report either one, and both are right. The task deliberately
doesn't say which, because naming one would tell the student there are two.
The order isn't the deliverable (n is). The box is there so the student
realises the order must be a whole number. The spec in
`data/microwaveGuide.js` (A3's first answer):

```js
{ symbol: 'm', label: <M>m</M>, unit: '',
  trueValue: 10, accept: [10, 9], integer: true,
  afterCommit: 'Either order counts: the scan holds order 10 at 36.5° and order 9 at 59.1°.' }
```

(`accept` and the angles are built from `SLAB_ORDERS` and
`slabMinimumAngle` in the model, so they follow any change to the slab.)

**What happens now.** `components/AnswerBox.js` checks `trueValue` alone
(`contains`, around line 48), so a student who reports 9 is told their
answer is wrong.

**What it should do.**
- If `spec.accept` is present, the answer counts as correct when it matches
  any value in the list. For an ordinary ± answer, that means the student's
  interval contains at least one listed value. For an `integer` answer, see
  item 2.
- Copy `accept` into the committed record alongside `trueValue` at commit
  time (around line 78), so the reveal a student saw can't change later if
  the model does. The box already treats `trueValue` this way.
- In the reveal, don't print a single "The simulation uses m = 10" when
  there's an `accept` list. State every accepted value, for example "The
  simulation accepts m = 10 or 9". The spec's `afterCommit` already explains
  which order belongs to which angle, so the reveal sentence doesn't need to.
- Without `accept`, nothing changes. Every pendulum answer must behave
  exactly as it does today.

## 2. AnswerBox: `integer: true`, an exact answer with no uncertainty

**Why.** The order of interference is exactly 10 (or 9). It has no
uncertainty. A3 now reads "Determine the order of interference, and the
refractive index of the slab with its uncertainty", wording chosen on
purpose, so the order has no ±.

**What happens now.** The form shows a ± field and won't commit unless the
uncertainty is a finite number above zero (`valid`, around line 70). A
student has to write something like "10 ± 0.5" for a quantity that is
exactly 10. That teaches the opposite of what the task is for.

**What it should do** when `spec.integer` is true:
- Show no uncertainty field at all, not even a disabled one. The input can
  use `inputMode="numeric"`.
- Accept only a whole number. "10" and "10.0" both parse to 10 and are
  fine. "9.5" should not be committable. It would be the student's
  half-wavelength mistake, and the task's own logic says that's impossible,
  so the box shouldn't let it be committed.
- Check the value exactly against `accept`, falling back to `trueValue` if
  there's no list. Don't use an interval.
- Store the record without an `uncertainty` key, or with it as null. The
  reveal must not print "± undefined" or an interval sentence ("Your
  interval, … to …"). It should give the answer, the accepted values, and
  whether the answer is one of them, stated flatly as the box does now.
- Persistence (`lib/experiment/useCommittedAnswer.js`) needs no change. It
  stores whatever record the box commits, and `answerFor` only checks for
  `value`.

The field is general and not specific to the microwave experiment. Use it
for any counted or integer deliverable.

## 3. ExperimentGuide: render `equipment`

**What it is.** Each microwave part has an `equipment` string listing what
that part puts on the bench:

- Part A: "the goniometer, the rotating table, the polymer slab, the
  multimeter, and something to measure thickness with"
- Part B: "the goniometer, the wax prisms, the multimeter, and something to
  measure the gap with"

The measuring tool is deliberately unnamed. A vernier caliper and a metre
rule can both measure the slab and the gap. Choosing the caliper roughly
halves Part A's error budget, and that choice is the student's. Never
render this field as a list of device names or link it to specific
instruments.

**What it should do.** `components/ExperimentGuide.js` should render
`def.equipment`, when present, as a single "You will need" line. Render
the string as given: no list markup, and no capitalising or re-punctuating
it. Put it with the problem statement, after `body` and `credit` and before
the Formulae heading (around line 61). It's part of the always-visible
first tier in `docs/conventions.md`'s "three tiers", so it isn't
collapsed. Parts without the field render exactly as they do now.

## The bench

Not yet specified. It will be added here.
