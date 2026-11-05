// The microwave bench's device notes (InstrumentNote content), split from
// data/microwaveGuide.js so the bench can import them without the guide's
// server-rendered maths. Device only, never method — see docs/conventions.md.
// The multimeter's line about amplitude is load-bearing and stops there.
// The beam block has no entry: it is listed in the equipment with no
// explanation (docs/microwave-bench.md), and has no panel to carry a note.

// Each instrument's note: what the device is, never how to use it for the
// measurement. Keyed by the id its panel or bench object will use.
export const microwaveDevices = {
  transmitter: {
    name: 'Transmitter',
    note: 'Emits microwaves at a fixed wavelength of 2.850 ± 0.005 cm. The lens in front of it makes the beam approximately parallel.',
  },
  receiver: {
    name: 'Receiver',
    note: 'Detects microwaves. Its output drives the multimeter.',
  },
  multimeter: {
    name: 'Multimeter',
    note: 'Reads the receiver’s output in mA, to 0.001 mA. The reading is proportional to the amplitude of the received wave.',
  },
  goniometer: {
    name: 'Goniometer',
    note: 'Two arms rotating about a common centre, read against a scale divided in half-degrees.',
  },
  table: {
    name: 'Rotating table',
    note: 'Holds the sample at the centre of the goniometer.',
  },
  caliper: {
    name: 'Vernier caliper',
    note: 'Jaws and a vernier scale, reading to 0.005 cm.',
  },
  rule: {
    name: 'Metre rule',
    note: 'Divided in half-millimetres.',
  },
  slab: {
    name: 'Polymer slab',
    note: 'A rectangular slab of polymer.',
  },
  prisms: {
    name: 'Wax prisms',
    note: 'Two equilateral prisms of the same wax.',
  },
};
