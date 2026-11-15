// Ground-truth microwave optics model. Angles in degrees, lengths in cm,
// intensities as a fraction of the transmitter's beam at the detector.
// The meter reads amplitude, not intensity (detectorSignal below) — that is
// a property of the crystal detector, and Part B's analysis depends on it.

// Stated, not measured, so its uncertainty is the source's own stability:
// a Gunn oscillator holds to about 0.1% (0.003 cm), rounded up. The IPhO
// paper's ±0.02 was their measurement of it, a part we don't build.
export const LAMBDA = 2.85;
export const LAMBDA_UNCERTAINTY = 0.005;

// Part A: the polymer slab, about three and a half wavelengths thick.
// SLAB_N is Part A's answer. SLAB_T is deliberately off the metre rule's
// 0.05 cm divisions, so the caliper is worth choosing. At this thickness a 30-70 degree scan holds
// two consecutive minima (orders 10 and 9), which is what Part A uses:
// the Airy R has no local maximum near the half-order angle to use instead.
export const SLAB_N = 1.54;
export const SLAB_T = 10.03;

// Part B: the wax prisms. PRISM_N is Part B's answer; PRISM_THETA is the
// internal angle of incidence at the gap, fixed by the prisms' geometry.
export const PRISM_N = 1.434;
export const PRISM_THETA = 60;

// Meter reading, in mA, for the whole beam (I = 1) falling on the detector.
export const DETECTOR_MA = 1;

const RAD = Math.PI / 180;

// Part A. The transmitter's E is perpendicular to the plane of incidence,
// so this is the s-polarised Fresnel coefficient in the exact Airy sum over
// all internal reflections, not the two-beam approximation: the minima are
// exactly zero and r grows with angle, so the curve is not a clean cosine.
// The zeros fall where 2t*q is a whole number of wavelengths, whatever r is.
export function slabReflectance(thetaDeg, n = SLAB_N, t = SLAB_T, lambda = LAMBDA) {
  const th = thetaDeg * RAD;
  const s = Math.sin(th);
  const c = Math.cos(th);
  const q = Math.sqrt(n * n - s * s);
  const r = (c - q) / (c + q);
  const delta = ((4 * Math.PI * t) / lambda) * q;
  const r2 = r * r;
  const half = Math.sin(delta / 2);
  return (4 * r2 * half * half) / (1 - 2 * r2 * Math.cos(delta) + r2 * r2);
}

// The angle of the zero of order N, where 2t*q = N*lambda, or null if no
// real angle gives it. With the constants above, 30-70 degrees holds
// N = 10 and N = 9; Part A's reveal names both.
export const SLAB_ORDERS = [10, 9];
export function slabMinimumAngle(N, n = SLAB_N, t = SLAB_T, lambda = LAMBDA) {
  const q = (N * lambda) / (2 * t);
  const s2 = n * n - q * q;
  return s2 >= 0 && s2 <= 1 ? Math.asin(Math.sqrt(s2)) / RAD : null;
}

// Part B: frustrated total internal reflection across a gap d.
export function waveNumber(lambda = LAMBDA) {
  return (2 * Math.PI) / lambda;
}

export function decayConstant(n = PRISM_N, thetaDeg = PRISM_THETA, lambda = LAMBDA) {
  const s = Math.sin(thetaDeg * RAD);
  return waveNumber(lambda) * Math.sqrt(n * n * s * s - 1);
}

export function gapTransmission(d, n = PRISM_N, thetaDeg = PRISM_THETA, lambda = LAMBDA, i0 = 1) {
  return i0 * Math.exp(-2 * decayConstant(n, thetaDeg, lambda) * d);
}

// The inverse of decayConstant: the index a measured gamma implies.
export function indexFromDecay(gamma, thetaDeg = PRISM_THETA, lambda = LAMBDA) {
  const k = waveNumber(lambda);
  return Math.sqrt(k * k + gamma * gamma) / (k * Math.sin(thetaDeg * RAD));
}

// The crystal detector: the meter's reading goes as the amplitude, sqrt(I).
// Plotting ln(S) against d instead of ln(S^2) gives half the slope.
export function detectorSignal(intensity) {
  return DETECTOR_MA * Math.sqrt(Math.max(intensity, 0));
}
