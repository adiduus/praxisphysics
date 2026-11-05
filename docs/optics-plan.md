# Waves and optics — three experiments

One quantity, six methods. Every experiment determines a refractive index, and
each does it a different way, so the series answers a real question: how many
ways can you measure one number, and which is best?

| | method | skill it teaches |
|---|---|---|
| 1A | block, Snell's law | straight-line gradient; a zero error visible as an intercept |
| 1B | disk, multiple internal reflections | slope of a sequence; the same zero error cancelling; a stationary setup removing a variable |
| 2 | prism, dispersion | angle inferred from two lengths; arctan propagation; Cauchy fit |
| 3A | thin film interference | eliminating an unknown by squaring and subtracting; an integer order as a constraint; which uncertainty term dominates |
| 3B | frustrated total internal reflection | exponential decay on a log-linear plot; a systematic with no graphical signature |

Nothing repeats except the straight-line fit in 1A, which is the deliberate
warm-up.

---

## Build order

**Experiment 3 first**, then 1, then 2 — which is the opposite of what the
physics difficulty suggests.

Microwaves are not drawn. There is no beam to render: the student sees a
goniometer, a sample, and a number on a multimeter. The physics is a formula
evaluated at whatever geometry is set. Experiment 1 needs a beam drawn inside
glass and multiple internal reflections fading around a rim; experiment 2 needs
four spectral lines at four deviations. So experiment 3 is the most physics per
unit of rendering work, and it reuses the existing digital-readout instrument
pattern directly.

For each one, the order within it is the same as the pendulum: model and verify
script first, then the guide content and the task, then the bench. Steps one to
three need no rendering and can be finished and checked before any component
exists.

## New instrument classes

- **Multimeter** — a digital readout of an arbitrary signal, with resolution and
  noise. Closest existing thing is the circuits voltmeter.
- **Vernier caliper** — reading a vernier is a classic olympiad skill and no
  instrument on the site has one. Needed for the slab thickness in 3A and the
  air gap in 3B, and it carries a session-seeded jaw zero in both.
- **Goniometer** — two arms rotating independently about a common centre, each
  against the same angular scale.
- **Measuring tape** — long-range length reading against a distant screen, with
  the spot locatable to a couple of millimetres.

The graduated circular table in experiment 1 is the pendulum's angle plate at a
different scale, including its session-seeded printed-zero offset.

---

# Experiment 1 — refraction through glass

Fixed laser, graduated circular table, swappable specimen at its centre. The
beam is visible inside the glass, as it is in a real lab with a laser and
slightly scattering glass.

**Scale:** divided in half-degrees, readable to about ±0.25° with the
magnifier. Carries a session-seeded zero offset of 0.3° to 1°, sign random, as
the pendulum's angle plate does.

## Part A — the block

Rectangular block at the centre. Read the angle of incidence and the angle of
refraction against the same scale, for a series of incidence angles.

n = sin i / sin r, so sin i against sin r is a straight line through the origin
with gradient n.

Δ(sin i) = cos i · Δi, with Δi in radians.

**The systematic:** the printed zero does not coincide with the beam, so every
angle is shifted by δ and the line no longer passes through the origin. The
intercept is roughly δ(n − 1) at small angles. It is discoverable from the
student's own data, and nothing should say so.

**Expected precision:** n to about ±0.01, three significant figures.

**True value:** n = 1.5168 (borosilicate crown).

## Part B — the disk

A circular glass disk at the centre. The incidence angle is set by how far the
beam passes from the centre, not by rotation — a circle cannot be rotated into
a different configuration:

sin α = b / R

Inside a circle every chord meets the rim at the same angle β, so each internal
reflection advances the impact point around the rim by

γ = 180° − 2β

The beam is never totally internally reflected, since β is always below the
critical angle, so a little light escapes at every bounce and the impact points
are visible as a fading row of spots.

Plot the angular position of each impact point against the reflection number k.
The slope is γ, so β = (180° − γ)/2.

**The stationary trick.** Translate the disk until the k-th exit spot stops
moving and reverses. At that point (k+1)cos α = n cos β, and combining with
Snell's law eliminates α entirely:

n = 1 / √( sin²β + cos²β/(k+1)² )

So n comes from the slope alone. The incidence angle never has to be measured.

**Why this part exists:** the answer depends only on *differences* between
impact positions, so the scale's zero offset cancels completely. Part A is
ruined by the same systematic that Part B does not notice. Same instrument,
same error, opposite outcome.

**Expected precision:** with impact positions to ±0.25° over k = 0 to 5, the
slope gives β to about ±0.05°, so n to about ±0.002. Genuinely better than Part
A, which is the point of calling it the improved method.

**True value:** n = 1.6200 (dense flint). Deliberately a different glass from
the block, so Part B's answer cannot be copied from Part A.

## Deliberately not provided

- That sin i against sin r is the plot.
- That a non-zero intercept means the scale's zero is off.
- That the exit spot's turning point is the minimum-deviation configuration.
- That the zero error cancels in Part B.

---

# Experiment 2 — dispersion

Mercury lamp with a collimator, 60° prism on a rotating table, a distant screen,
a measuring tape. No angular scale anywhere.

**Lines:** 404.7, 435.8, 546.1 and 579.1 nm, each at its own deviation, so the
prism separates them visibly.

**How the angle is measured.** Exactly as IPhO 2019 did it:

δ = arctan(h / L)

where L is the prism-to-screen distance and h is the displacement of the spot
from where the undeviated beam lands. With L of order 1.5 m and the spot
locatable to a couple of millimetres, δ comes out to about ±0.05° — ten times
better than a degree-divided scale, which is what makes this experiment
possible at all.

**The analysis.** For each line, rotate to minimum deviation, measure h and L:

n_λ = sin((A + δ_min)/2) / sin(A/2) = 2 sin((60° + δ_min)/2)

Then plot n against 1/λ². Cauchy's relation makes that a straight line:

n = A_c + B_c/λ²

Intercept A_c, gradient B_c.

**The propagation is the hardest on the site.** Δδ comes from Δh and ΔL through
an arctangent; Δn comes from Δδ through a ratio of sines of sums. Neither the
sum rule nor the power rule touches either step, so Section 2's general
partial-derivative formula has to be used for real.

**The apex angle** is 60.00°, given, since measuring it needs an angular scale
this bench does not have.

**The systematic:** the undeviated spot's position has to be found by removing
the prism. A student who never does that has no zero for h. Nothing says so.

**Expected precision:** Δn about ±0.0005 per line, against a total dispersion
of about 0.018 across the four lines, so roughly thirty-five resolution
elements. B_c to a few per cent.

**True values:** A_c = 1.598, B_c = 0.00654 µm², giving n = 1.6380 at 404.7 nm
down to 1.6175 at 579.1 nm. Dense flint.

---

# Experiment 3 — microwave optics

Microwave transmitter at about 10.5 GHz, λ = 2.85 ± 0.005 cm (source stability,
not a measurement). Plano-cylindrical lens for a quasi-parallel beam, goniometer
with two arms, rotating table, receiver, multimeter, vernier caliper.

Adapted from IPhO 2006 (Singapore), experimental problem parts 2 and 3.

Nothing is drawn as a beam. The student sets a geometry and reads a number.

**The detector reads amplitude, not intensity.** S ∝ √I. This is stated on the
bench, because every other consequence in this experiment follows from it.

## Part A — thin film interference

A polymer slab acts as the film. Its thickness t is measured with the vernier
caliper, jaws closed first. The receiver output S is recorded against the angle
of incidence θ from 30° to 70° in the goniometer's 0.5° steps.

Path difference 2t√(n² − sin²θ), with a π shift at the first surface, so

minimum: 2t√(n² − sin²θ) = mλ

In that range there are two consecutive minima, orders m and m − 1. Squaring
both conditions and subtracting eliminates n outright:

sin²θ₂ − sin²θ₁ = (2m − 1) λ²/(4t²)

so 2m − 1 = 4t²(sin²θ₂ − sin²θ₁)/λ². That comes out 18.87 ± 0.57, which rounds
to the nearest odd integer 19, so m = 10 and the second minimum is order 9. The
uncertainty is comfortably inside ±1, so the rounding is safe and the student can
say why. n then follows from either condition.

**Why two minima and not a maximum and a minimum.** Minima are exact zeros of
sin²(δ/2) in the Airy reflectance, so their angles do not depend on the Fresnel
envelope at all. Maxima do, and in this geometry the envelope's growth with
angle removes the local maximum entirely. There is no maximum to find.

**The dips are sharp Vs, not rounded.** R goes as (θ − θ₀)² near a minimum, but
the meter reads √R, so S goes as |θ − θ₀|. Each minimum is pinned to the nearest
division without effort. Locating an extremum is therefore *not* a skill this
part teaches — an earlier draft of this plan claimed it did, on a wrong picture
of the dip shape.

**Skills:** seeing that squaring and subtracting eliminates n; using integrality
to fix m; and a three-term propagation in which the dominant term changes. The
angle term is largest for either minimum on its own, λ is largest for the mean,
because the two angle readings are independent and average down while t and λ
are shared by both minima and do not.

**True values:** n = 1.5400, t = 10.03 cm. The thickness deliberately misses the
metre rule's 0.05 cm divisions, so the caliper has to be used.

**Recovered in the worked example:** t = 10.030 ± 0.005 cm, minima at 36.5° and
59.0° against true zeros at 36.457° and 59.122°, n = 1.540 ± 0.003.

## Part B — frustrated total internal reflection

Two wax prisms face to face with an air gap d, measured with the caliper. The
beam enters normally and strikes the gap at θ = 60°. Transmitted intensity:

I_t = I₀ exp(−2γd),  γ = (2π/λ)√(n² sin²θ − 1)

Plot ln I_t against d. The slope is −2γ, and

n = √(1 + (γλ/2π)²) / sin θ

**Usable range:** γ = 1.62 /cm, so the intensity e-folds every 1/(2γ) = 0.31 cm.
Readings run from d = 0.6 cm to 1.4 cm — about 2.6 e-foldings, a factor of 13 in
intensity — before the signal approaches the meter's noise. That range is set by
the physics, and the student has to find it.

**The systematic: a dark current with no graphical signature.** The multimeter
reads a session-seeded 0.01–0.03 mA with the beam blocked. Over 0.6–1.4 cm,
leaving it in *tilts* the log-linear line rather than bending it: the offset in
ln I grows nearly linearly across this range, so the slope comes out shallow and
n low by one to four per cent depending on the seed. The line still looks
straight, and the half-range slopes agree. An earlier draft of this plan claimed
a visible bend at the large-gap end; that is wrong at these numbers, and forcing
it would mean pushing d past 1.4 cm where the signal is comparable to the noise.

The tilt is the stronger lesson. A bend warns you; a tilt hands you a healthy
straight line and a confidently wrong answer. The only defence is measuring the
zero with the beam blocked, which nothing in the data will prompt you to do.

**Skills:** exponential decay on a log-linear plot — the one plotting skill the
site does not currently teach anywhere — and a systematic that the graph's shape
does not reveal.

**True value:** n = 1.4340 (paraffin wax).

**Recovered in the worked example:** dark current 0.0093 ± 0.0015 mA measured
against a true 0.0114; best slope −3.242 ± 0.094 /cm; γ = 1.6209 ± 0.0472 /cm;
n = 1.433 ± 0.015. With the dark current left in, n = 1.4075, which is 1.6% below
the corrected value and 1.9% below the true one.

## Deliberately not provided

- That squaring and subtracting the two minimum conditions eliminates n.
- That 2m − 1 must be an odd integer.
- That ln I_t against d is the plot.
- Where the usable range of d begins and ends.
- That the meter has a dark current worth measuring.

---

## Where the numbers came from

The IPhO figures (δ_min geometry, the FTIR range, the microwave wavelength) are
from the papers. For experiments 1 and 2 the precision estimates are still mine
and need checking against the instrument models once those exist. Experiment 3's
are no longer estimates: every figure quoted above came out of
`scripts/worked-example-microwave.mjs` at a fixed seed, and `microwave-verify.mjs`
checks the model itself. The true values are chosen to be real and non-round, so
none can be recognised from memory — the same reasoning as g = 9.787 on the
pendulum.

Every number quoted in a worked example must come from a generator script, as
the pendulum's Part B does, not from hand calculation.
