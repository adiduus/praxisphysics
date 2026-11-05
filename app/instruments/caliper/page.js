import VernierCaliper from '@/components/instruments/VernierCaliper';

// The vernier caliper on its own, for its layout audit
// (scripts/layout-audit.mjs --pages caliper) before any bench uses it. Not
// linked from anywhere and not indexed; the microwave bench, and later
// Experiments 1 and 2, mount the same component in their panels.
export const metadata = { title: 'Vernier caliper — Praxis', robots: { index: false, follow: false } };

export default function CaliperPage() {
  return (
    <section className="bench-page">
      <div className="wrap">
        <div className="head">
          <h2>Vernier caliper</h2>
        </div>
      </div>
      <div className="bench-wrap">
        <div className="instrument-panels">
          <VernierCaliper />
        </div>
      </div>
    </section>
  );
}
