// Static problem statement, formulae, and task per part — the microwave
// optics experiment's content, in the shape data/pendulumGuide.js uses and
// with the same Server/Client constraint: JSX and plain values only, no
// functions, and the true values from lib/microwave/model.mjs.
//
// Part A's body introduces the physics, since interference in a slab is new
// to many students, but stops at the principle: the interference conditions
// themselves are the student's step. Get the half-wavelength on reflection
// backwards and the order comes out half-integer, which is impossible, so
// the mistake announces itself. Nothing here says what to plot, that two
// minima are what matter in Part A, that the reading must be squared in
// Part B, or where the gap's usable range begins and ends.
//
// `equipment` is new: what each part puts on the bench, with the measuring
// tool left unnamed where choosing it is part of the task. `microwaveDevices`
// holds the instruments' notes (InstrumentNote content), device only, never
// method — see docs/conventions.md. The multimeter's line about amplitude is
// load-bearing and stops there: that intensity goes as its square is the
// student's step, and missing it halves Part B's slope.
//
// No worked solution exists for this experiment yet, so the footer links
// error analysis only.
import Link from 'next/link';
import { M } from '@/components/Maths';
import { SLAB_N, SLAB_ORDERS, PRISM_N, slabMinimumAngle } from '@/lib/microwave/model.mjs';
import { guideHref, guideSections } from '@/data/guide';

// A symbol picked out in the formulae box. KaTeX's colour check rejects
// var(--trace), so this is its hex.
const hl = (tex) => String.raw`\textcolor{#4EC5FF}{${tex}}`;

// A link to a guide section, labelled with its own title so a rename
// doesn't leave stale text behind (guideHref already throws on a bad slug).
function guideLink(slug) {
  const href = guideHref(slug);
  return <Link href={href}>{guideSections.find((s) => s.slug === slug).title}</Link>;
}

const footer = (
  <>
    <p>For a guide on error analysis, see {guideLink('error-analysis')}.</p>
  </>
);

const credit = 'Adapted from IPhO 2006 (Singapore), Experimental Competition, Parts 2 and 3.';

// Part A's reveal: both orders in the scan and the angle of each, from the
// model, so a change to the slab can't leave it stale.
const ordersInScan = SLAB_ORDERS.map((N) => `order ${N} at ${slabMinimumAngle(N).toFixed(1)}°`).join(' and ');

// The data table's symbol bar, after its shared base (Δ ± ° ² ³ ₀).
export const microwaveSymbols = ['θ', 'λ', 'γ'];

// Stated, not measured: the transmitter's card gives it.
const wavelength = {
  expr: <M>{String.raw`\lambda = 2.850 \pm 0.005\ \text{cm}`}</M>,
  note: 'wavelength',
};

export const microwaveParts = [
  {
    key: 'parta',
    label: 'PART A',
    tag: 'PART A',
    title: 'Reflection from a slab',
    body: (
      <p>
        A beam reflected from a slab splits in two: part reflects from the front surface, and part
        passes through and reflects from the back. The two beams meet again and interfere. What
        decides the result is the difference in their optical path lengths — when that difference
        is a whole number of wavelengths the beams reinforce, and when it is a half-integer number
        they cancel. One extra detail matters here: a reflection at the surface of a denser medium
        adds half a wavelength of its own.
      </p>
    ),
    credit,
    // The path difference and the wavelength only. The conditions for
    // reinforcement and cancellation are assembled from the body's
    // principle, not printed here.
    formulae: [
      {
        expr: <M>{String.raw`2t\sqrt{${hl('n')}^2 - \sin^2\theta}`}</M>,
        note: 'optical path difference',
      },
      wavelength,
    ],
    equipment: 'The goniometer, the rotating table, the polymer slab, the multimeter, a beam block, and something to measure thickness with.',
    task: [
      {
        id: 'A1',
        text: 'Measure the thickness of the slab.',
      },
      {
        id: 'A2',
        text: 'Record the receiver output against the angle of incidence, between 30 and 70 degrees.',
      },
      {
        id: 'A3',
        text: 'Determine the order of interference, and the refractive index of the slab with its uncertainty.',
        // The deliverable is n; the order box is there so the student sees
        // it must be a whole number. Either minimum's order is right, and the
        // task never says which (that would say there are two). `accept`
        // lists every value that counts, and `integer` makes it an exact
        // whole number with no ± field; AnswerBox reads both.
        answer: [
          {
            symbol: 'm',
            label: <M>m</M>,
            unit: '',
            trueValue: SLAB_ORDERS[0],
            accept: SLAB_ORDERS,
            integer: true,
            afterCommit: `Either order counts: the scan holds ${ordersInScan}.`,
          },
          { symbol: 'n', label: <M>n</M>, unit: '', trueValue: SLAB_N },
        ],
      },
    ],
    // Opt-in, and only a nudge toward using integrality: not which
    // extrema, not how many, not the formula for m.
    stuckHint: 'The order of interference is a whole number. That is a constraint, not just a fact.',
    startOver: {
      label: 'Start Part A over',
      confirm: 'This clears your table, your plot and your committed answers for Part A.',
    },
    notes: {
      table: 'Record your readings in the table; add a column for the uncertainty in any quantity.',
      plot: 'On the plot, choose which columns are the axes and which hold the error bars, and set the axis range. Drag across the plot to draw a line.',
    },
    footer,
  },
  {
    key: 'partb',
    label: 'PART B',
    tag: 'PART B',
    title: 'Frustrated total internal reflection',
    body: (
      <p>
        When a wave is totally internally reflected, the field does not stop abruptly at the
        surface. It extends a short way into the air beyond and dies away with distance. Bring a
        second piece of the same material close enough and some of the wave crosses the gap and
        continues on its way. How much gets through depends on how wide the gap is.
      </p>
    ),
    credit,
    // Both given: deriving an evanescent decay is out of scope.
    formulae: [
      {
        expr: <M>{String.raw`I_t = I_0\, e^{-2\gamma d}`}</M>,
        note: 'transmitted intensity across a gap d',
      },
      {
        expr: <M>{String.raw`\gamma = \frac{2\pi}{\lambda}\sqrt{${hl('n')}^2\sin^2\theta - 1}`}</M>,
        note: 'decay constant',
      },
    ],
    equipment: 'The goniometer, the wax prisms, the multimeter, a beam block, and something to measure the gap with.',
    task: [
      {
        id: 'B1',
        text: 'Record the transmitted signal against the width of the air gap.',
      },
      {
        id: 'B2',
        text: 'Determine the refractive index of the prism material, with its uncertainty.',
        answer: { symbol: 'n', label: <M>n</M>, unit: '', trueValue: PRISM_N },
      },
    ],
    // Opt-in: linearise, without naming the axes or the detector's square;
    // and point at the angle being a deduction, without making it. θ = 60°
    // is never stated, and taking 45° gives n ≈ 1.75 with no self-check.
    stuckHint:
      'The relationship is exponential. A straight line is still available to you. The angle at which the wave meets the gap is fixed by the prisms’ shape, not by anything you can adjust.',
    startOver: {
      label: 'Start Part B over',
      confirm: 'This clears your table, your plot and your committed answers for Part B.',
    },
    footer,
  },
];

// The instruments' notes live in their own file, plain strings with no
// KaTeX, so the bench (a Client Component) can import them.
export { microwaveDevices } from './microwaveDevices';
