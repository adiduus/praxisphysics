// The metre rule: 100 cm, divided in half-millimetres, its 0 at the very
// end. Plain ESM, like caliper.mjs, so the verify script reads it under Node
// exactly as the bench draws it. No session zero: the scale starts at the
// end, and the bench sets a specimen's near face on it.
//
// `read` is a student reading to the nearest division, which is how
// scripts/microwave-verify.mjs models choosing the rule. The bench itself
// draws the specimen true size against the divisions (lib/instruments/
// ruleScene.js), so a face that falls between two of them is seen to.
import { quantize } from './reading.js';

export const RULE_RESOLUTION = 0.05; // cm: half-millimetre divisions
export const RULE_LENGTH_CM = 100;

export function createRule() {
  return {
    read(trueCm) {
      return quantize(trueCm, RULE_RESOLUTION);
    },
  };
}
