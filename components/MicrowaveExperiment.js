'use client';

// The microwave optics experiment as a consumer of ExperimentWorkspace, the
// way PendulumExperiment is: the guide content (from the page, so its maths
// is rendered on the server — see data/microwaveGuide.js), the bench, and
// the generic QuickEntry for the student's own table. Nothing here names a
// column: the table starts empty and the student chooses what to record.
import ExperimentWorkspace from './ExperimentWorkspace';
import MicrowaveBench from './MicrowaveBench';
import QuickEntry from './QuickEntry';

// Module-level, so its identity is stable and a part switch doesn't
// remount the bench (see CircuitsExperiment.js).
function Bench({ part }) {
  return <MicrowaveBench part={part} />;
}

export default function MicrowaveExperiment({ parts, symbols }) {
  return (
    <ExperimentWorkspace
      experimentId="microwave"
      parts={parts}
      symbols={symbols}
      Bench={Bench}
      DataTools={QuickEntry}
    />
  );
}
