import Goniometer from '@/components/Goniometer';

// The microwave goniometer on its own, for its layout audit
// (scripts/layout-audit.mjs --pages goniometer) before the bench mounts it.
// Not linked from anywhere and not indexed, like the caliper's page.
export const metadata = { title: 'Goniometer — Praxis', robots: { index: false, follow: false } };

export default function GoniometerPage() {
  return (
    <section className="bench-page">
      <div className="wrap">
        <div className="head">
          <h2>Goniometer</h2>
        </div>
      </div>
      <div className="bench-wrap">
        <div className="goniometer-host">
          <Goniometer />
        </div>
      </div>
    </section>
  );
}
