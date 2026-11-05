// The vernier caliper: one 15 cm outside caliper, the same instrument on
// every bench that uses it (the microwave bench, and Experiments 1 and 2
// of docs/optics-plan.md), so its session zero is keyed to the caliper, not
// to an experiment. Plain ESM, so the worked-example and verify scripts
// read it under Node exactly as the bench does.
//
// The vernier has 20 divisions over 39 mm: each is 1.95 mm, 0.05 mm short
// of two main-scale millimetres, so it reads to 0.05 mm = 0.005 cm. The
// jaws themselves move continuously (reading a vernier is the skill, so
// nothing snaps); what the scales show is quantized through `read`, so at
// any opening exactly one vernier line meets a main-scale line.
import { sessionUniform } from './rng.js';
import { quantize } from './reading.js';

export const CALIPER_RESOLUTION = 0.005; // cm
export const CALIPER_MAX_ZERO = 0.01; // cm, either sign; the microwave model set it (docs/microwave-bench.md)
export const CALIPER_RANGE_CM = 15;
export const VERNIER_DIVISIONS = 20;
export const VERNIER_SPAN_CM = 3.9;

// Zero error is found by closing the jaws (a true length of zero). It is
// geometric on the bench: with the jaws shut, the vernier's zero sits off
// the main scale's by zeroCm.
export function createCaliper({
  zeroCm = sessionUniform('caliper-zero', -CALIPER_MAX_ZERO, CALIPER_MAX_ZERO),
} = {}) {
  return {
    zeroCm,
    read(trueCm) {
      return quantize(trueCm + zeroCm, CALIPER_RESOLUTION);
    },
  };
}
