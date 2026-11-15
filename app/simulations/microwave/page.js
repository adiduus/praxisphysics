import MicrowaveExperiment from '@/components/MicrowaveExperiment';
import { microwaveParts, microwaveSymbols } from '@/data/microwaveGuide';

export const metadata = { title: 'Microwave Optics — Praxis' };

export default function MicrowavePage() {
  return (
    <section className="bench-page">
      <div className="wrap">
        <div className="head">
          <h2>Microwave Optics</h2>
        </div>
      </div>
      {/* Outside .wrap on purpose: the 1160px cap suits prose, not a bench. */}
      <div className="bench-wrap">
        {/* Imported here, not in the client tree, so its maths is rendered
            on the server — see data/microwaveGuide.js. */}
        <MicrowaveExperiment parts={microwaveParts} symbols={microwaveSymbols} />
      </div>
    </section>
  );
}
