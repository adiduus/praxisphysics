// The microwave bench's instruments. Each takes a true value and returns
// what the instrument displays. Session-seeded systematics (dark current,
// zero offsets) are drawn once per session through sessionUniform and can
// be overridden, which is how the verify script sweeps them. Per-reading
// noise draws from `random` (Math.random unless one is passed in).
import { sessionUniform } from '../instruments/rng.js';
import { quantize } from '../instruments/reading.js';

export const MULTIMETER_RESOLUTION = 0.001; // mA
export const MULTIMETER_NOISE_MA = 0.002; // fixed part of the noise's standard deviation
export const MULTIMETER_NOISE_FRACTION = 0.01; // part proportional to the reading
export const DARK_MIN_MA = 0.01;
export const DARK_MAX_MA = 0.03;

export const GONIOMETER_RESOLUTION = 0.5; // degrees

// The caliper and the rule are shared with the other optics benches; see
// their own files.
export { CALIPER_RESOLUTION, CALIPER_MAX_ZERO, createCaliper } from '../instruments/caliper.mjs';
export { RULE_RESOLUTION, createRule } from '../instruments/rule.mjs';


// Standard normal draw (Box–Muller).
function gaussian(random) {
  let u = 0;
  while (u === 0) u = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

// Reads mA. The dark current is added to every reading: the real paper's
// minimum read 0.022 mA where the model gives zero. It is found by blocking
// the beam (a true signal of zero).
export function createMultimeter({
  darkMa = sessionUniform('microwave-dark-current', DARK_MIN_MA, DARK_MAX_MA),
  random = Math.random,
} = {}) {
  return {
    darkMa,
    read(trueMa) {
      const sigma = MULTIMETER_NOISE_MA + MULTIMETER_NOISE_FRACTION * trueMa;
      const raw = trueMa + darkMa + sigma * gaussian(random);
      return quantize(Math.max(raw, 0), MULTIMETER_RESOLUTION);
    },
  };
}

// No printed-zero offset: the scale's 0 is on the beam axis. An offset
// doesn't cancel in n (it shifts both minima the same way, and n depends
// on each angle, not only their difference), and the worked example,
// which leaves it out, would then model a procedure the bench defeats —
// see docs/microwave-bench.md.
export function createGoniometer() {
  return {
    read(trueDeg) {
      return quantize(trueDeg, GONIOMETER_RESOLUTION);
    },
  };
}
