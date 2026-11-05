// Fig. 5.4 — the microwave Part B worked example
// (content/guide/worked-examples.js, 'straight-and-wrong'): ln I against d
// for the same readings with the dark current subtracted (filled, with the
// best, steepest and shallowest lines) and left in (hollow, with its
// end-to-end line); below, the difference between the two.
//
// Every coordinate here is a reading or a line from
// scripts/worked-example-microwave.mjs at seed 2006, like the tables in the
// prose. Don't hand-edit it: if the data or the analysis change, regenerate
// the figure from the script's output. Converted from a 560x560 SVG with its
// C2PA metadata stripped. The explanation of the lower panel is in the Fig
// caption, not drawn here, because SVG text can't wrap. The @media rule
// raises the type on narrow screens: a media query in an inline SVG responds
// to the viewport, so at 390px the ticks render near 11px, not 5px.
// Colours sit in the style block, plain value first and var() second,
// because var() doesn't resolve in SVG presentation attributes; the plain
// values are the source file's light palette and only show where the site's
// properties are missing. --chalk and --trace as in PartBStageOne, with its
// opacities for the frame (.34) and grid (.13); --panel and --muted from the
// figure box and captions; --warn for the uncorrected data. .mwb-bg comes
// after .mwb-bad so the hollow markers are filled with the panel and hide
// their own error bars, as the source file intended. Classes are
// prefixed mwb-, and the text rule is scoped to .mwb, because an inline
// SVG's <style> applies to the whole page.
export default function MicrowavePartB() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mwb"
      viewBox="0 0 560 560"
      role="img"
      aria-labelledby="mwb-t mwb-d"
    >
      <title id="mwb-t">Log-linear plot of transmitted intensity against gap width, with and without the dark current subtracted</title>
      <desc id="mwb-d">The corrected readings give a straight line of gradient -3.24 per cm. The same readings with the dark current left in give a line that is also straight, but shallower at -3.07 per cm, and an answer 1.6 per cent low. The lower panel shows the offset between them growing steadily from 0.048 to 0.171 across the range, which is why the upper panel shows a tilt and not a bend.</desc>

      <style>{`
        .mwb-ink   { fill: #1f2328; fill: var(--chalk, #1f2328); }
        .mwb-rule  { stroke: #c9ced6; stroke: var(--chalk, #c9ced6); stroke-opacity: .34; fill: none; }
        .mwb-grid  { stroke: #e9ecf1; stroke: var(--chalk, #e9ecf1); stroke-opacity: .13; fill: none; }
        .mwb-muted { fill: #6b7280; fill: var(--muted, #6b7280); }
        .mwb-ok    { stroke: #2563a8; stroke: var(--trace, #2563a8); fill: none; }
        .mwb-okf   { fill: #2563a8; fill: var(--trace, #2563a8); }
        .mwb-bad   { stroke: #b4452f; stroke: var(--warn, #b4452f); fill: none; }
        .mwb-badf  { fill: #b4452f; fill: var(--warn, #b4452f); }
        .mwb-bg    { fill: #ffffff; fill: var(--panel, #ffffff); }
        .mwb text  { font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
                     font-family: var(--font-sans, ui-sans-serif), -apple-system, "Segoe UI", Roboto, sans-serif; }
        .mwb-lbl   { font-size: 12.5px; }
        .mwb-tick  { font-size: 12px; }
        .mwb-cap   { font-size: 12px; }
        .mwb-panel { font-size: 13px; font-weight: 600; }
        @media (max-width: 600px) {
          .mwb-lbl   { font-size: 17px; }
          .mwb-tick  { font-size: 17px; }
          .mwb-cap   { font-size: 16px; }
          .mwb-panel { font-size: 18px; }
        }
      `}</style>

      <rect className="mwb-bg" x="0" y="0" width="560" height="560" />
      <text className="mwb-panel mwb-ink" x="74" y="28">Transmitted intensity against gap width</text>
      <line className="mwb-grid" x1="74" y1="256.48" x2="536" y2="256.48" />
      <line className="mwb-grid" x1="74" y1="166" x2="536" y2="166" />
      <line className="mwb-grid" x1="74" y1="75.52" x2="536" y2="75.52" />
      <line className="mwb-rule" x1="74" y1="52" x2="74" y2="318" />
      <line className="mwb-rule" x1="74" y1="318" x2="536" y2="318" />
      <line className="mwb-rule" x1="71" y1="301.71" x2="74" y2="301.71" />
      <line className="mwb-rule" x1="68" y1="256.48" x2="74" y2="256.48" />
      <text className="mwb-tick mwb-muted" x="63" y="261.48" textAnchor="end">−4</text>
      <line className="mwb-rule" x1="71" y1="211.24" x2="74" y2="211.24" />
      <line className="mwb-rule" x1="68" y1="166" x2="74" y2="166" />
      <text className="mwb-tick mwb-muted" x="63" y="171" textAnchor="end">−3</text>
      <line className="mwb-rule" x1="71" y1="120.76" x2="74" y2="120.76" />
      <line className="mwb-rule" x1="68" y1="75.52" x2="74" y2="75.52" />
      <text className="mwb-tick mwb-muted" x="63" y="80.52" textAnchor="end">−2</text>
      <line className="mwb-rule" x1="99.67" y1="318" x2="99.67" y2="324" />
      <text className="mwb-tick mwb-muted" x="99.67" y="341" textAnchor="middle">0.6</text>
      <line className="mwb-rule" x1="151" y1="318" x2="151" y2="321" />
      <line className="mwb-rule" x1="202.33" y1="318" x2="202.33" y2="324" />
      <text className="mwb-tick mwb-muted" x="202.33" y="341" textAnchor="middle">0.8</text>
      <line className="mwb-rule" x1="253.67" y1="318" x2="253.67" y2="321" />
      <line className="mwb-rule" x1="305" y1="318" x2="305" y2="324" />
      <text className="mwb-tick mwb-muted" x="305" y="341" textAnchor="middle">1.0</text>
      <line className="mwb-rule" x1="356.33" y1="318" x2="356.33" y2="321" />
      <line className="mwb-rule" x1="407.67" y1="318" x2="407.67" y2="324" />
      <text className="mwb-tick mwb-muted" x="407.67" y="341" textAnchor="middle">1.2</text>
      <line className="mwb-rule" x1="459" y1="318" x2="459" y2="321" />
      <line className="mwb-rule" x1="510.33" y1="318" x2="510.33" y2="324" />
      <text className="mwb-tick mwb-muted" x="510.33" y="341" textAnchor="middle">1.4</text>
      <text className="mwb-lbl mwb-ink" transform="translate(24,185) rotate(-90)" textAnchor="middle">ln I  (I in mA²)</text>
      <text className="mwb-lbl mwb-ink" x="305" y="366" textAnchor="middle">gap d  (cm)</text>
      <path className="mwb-ok" strokeWidth="1" strokeDasharray="4 3" opacity="0.75" d="M 74 51.68 L 536 323.39" />
      <path className="mwb-ok" strokeWidth="1" strokeDasharray="4 3" opacity="0.75" d="M 74 57.73 L 536 314.1" />
      <path className="mwb-ok" strokeWidth="2" d="M 74 54.7 L 536 318.74" />
      <path className="mwb-bad" strokeWidth="2" d="M 74 50.89 L 536 301.19" />
      <line className="mwb-bad" strokeWidth="1.2" x1="99.67" y1="65.42" x2="99.67" y2="64.17" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="99.67" cy="64.8" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="151" y1="97" x2="151" y2="93.92" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="151" cy="95.46" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="202.33" y1="123.8" x2="202.33" y2="118.36" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="202.33" cy="121.08" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="253.67" y1="154.1" x2="253.67" y2="152.81" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="253.67" cy="153.45" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="305" y1="180.66" x2="305" y2="171.57" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="305" cy="176.11" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="356.33" y1="207.9" x2="356.33" y2="203.55" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="356.33" cy="205.72" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="407.67" y1="236.3" x2="407.67" y2="234.27" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="407.67" cy="235.28" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="459" y1="262.78" x2="459" y2="259.62" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="459" cy="261.2" r="3.6" />
      <line className="mwb-bad" strokeWidth="1.2" x1="510.33" y1="288.63" x2="510.33" y2="285.93" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="510.33" cy="287.28" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="99.67" y1="70.55" x2="99.67" y2="67.83" />
      <circle className="mwb-okf" cx="99.67" cy="69.19" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="151" y1="103.12" x2="151" y2="98.23" />
      <circle className="mwb-okf" cx="151" cy="100.68" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="202.33" y1="130.9" x2="202.33" y2="123.3" />
      <circle className="mwb-okf" cx="202.33" cy="127.1" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="253.67" y1="162.47" x2="253.67" y2="158.85" />
      <circle className="mwb-okf" cx="253.67" cy="160.66" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="305" y1="190.43" x2="305" y2="178.12" />
      <circle className="mwb-okf" cx="305" cy="184.28" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="356.33" y1="219.29" x2="356.33" y2="211.51" />
      <circle className="mwb-okf" cx="356.33" cy="215.4" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="407.67" y1="249.69" x2="407.67" y2="243.72" />
      <circle className="mwb-okf" cx="407.67" cy="246.7" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="459" y1="278.46" x2="459" y2="270.5" />
      <circle className="mwb-okf" cx="459" cy="274.48" r="3.6" />
      <line className="mwb-ok" strokeWidth="1.2" x1="510.33" y1="306.78" x2="510.33" y2="298.64" />
      <circle className="mwb-okf" cx="510.33" cy="302.71" r="3.6" />
      <line className="mwb-ok" strokeWidth="2" x1="190" y1="71" x2="216" y2="71" />
      <circle className="mwb-okf" cx="203" cy="71" r="3.6" />
      <text className="mwb-cap mwb-okf" x="224" y="75">dark subtracted, −3.24, n = 1.433</text>
      <line className="mwb-bad" strokeWidth="2" x1="190" y1="101" x2="216" y2="101" />
      <circle className="mwb-bad mwb-bg" strokeWidth="1.6" cx="203" cy="101" r="3.6" />
      <text className="mwb-cap mwb-badf" x="224" y="105">dark left in, −3.07, n = 1.408</text>
      <text className="mwb-panel mwb-ink" x="74" y="390">The gap between the two sets of points</text>
      <line className="mwb-grid" x1="74" y1="478.5" x2="536" y2="478.5" />
      <line className="mwb-grid" x1="74" y1="431.5" x2="536" y2="431.5" />
      <line className="mwb-rule" x1="74" y1="408" x2="74" y2="502" />
      <line className="mwb-rule" x1="74" y1="502" x2="536" y2="502" />
      <line className="mwb-rule" x1="68" y1="502" x2="74" y2="502" />
      <text className="mwb-tick mwb-muted" x="63" y="507" textAnchor="end">0.0</text>
      <line className="mwb-rule" x1="71" y1="478.5" x2="74" y2="478.5" />
      <line className="mwb-rule" x1="68" y1="455" x2="74" y2="455" />
      <text className="mwb-tick mwb-muted" x="63" y="460" textAnchor="end">0.1</text>
      <line className="mwb-rule" x1="71" y1="431.5" x2="74" y2="431.5" />
      <line className="mwb-rule" x1="68" y1="408" x2="74" y2="408" />
      <text className="mwb-tick mwb-muted" x="63" y="413" textAnchor="end">0.2</text>
      <line className="mwb-rule" x1="99.67" y1="502" x2="99.67" y2="508" />
      <text className="mwb-tick mwb-muted" x="99.67" y="525" textAnchor="middle">0.6</text>
      <line className="mwb-rule" x1="151" y1="502" x2="151" y2="505" />
      <line className="mwb-rule" x1="202.33" y1="502" x2="202.33" y2="508" />
      <text className="mwb-tick mwb-muted" x="202.33" y="525" textAnchor="middle">0.8</text>
      <line className="mwb-rule" x1="253.67" y1="502" x2="253.67" y2="505" />
      <line className="mwb-rule" x1="305" y1="502" x2="305" y2="508" />
      <text className="mwb-tick mwb-muted" x="305" y="525" textAnchor="middle">1.0</text>
      <line className="mwb-rule" x1="356.33" y1="502" x2="356.33" y2="505" />
      <line className="mwb-rule" x1="407.67" y1="502" x2="407.67" y2="508" />
      <text className="mwb-tick mwb-muted" x="407.67" y="525" textAnchor="middle">1.2</text>
      <line className="mwb-rule" x1="459" y1="502" x2="459" y2="505" />
      <line className="mwb-rule" x1="510.33" y1="502" x2="510.33" y2="508" />
      <text className="mwb-tick mwb-muted" x="510.33" y="525" textAnchor="middle">1.4</text>
      <text className="mwb-lbl mwb-ink" transform="translate(24,455) rotate(-90)" textAnchor="middle">offset in ln I</text>
      <text className="mwb-lbl mwb-ink" x="305" y="550" textAnchor="middle">gap d  (cm)</text>
      <path className="mwb-rule" strokeWidth="1" strokeDasharray="3 3" d="M 99.67 479.17 L 510.33 421.86" />
      <path className="mwb-bad" strokeWidth="1.6" d="M 99.67 479.17 L 151 474.91 L 202.33 470.76 L 253.67 464.55 L 305 459.6 L 356.33 451.74 L 407.67 442.68 L 459 432.99 L 510.33 421.86" />
      <circle className="mwb-badf" cx="99.67" cy="479.17" r="3" />
      <circle className="mwb-badf" cx="151" cy="474.91" r="3" />
      <circle className="mwb-badf" cx="202.33" cy="470.76" r="3" />
      <circle className="mwb-badf" cx="253.67" cy="464.55" r="3" />
      <circle className="mwb-badf" cx="305" cy="459.6" r="3" />
      <circle className="mwb-badf" cx="356.33" cy="451.74" r="3" />
      <circle className="mwb-badf" cx="407.67" cy="442.68" r="3" />
      <circle className="mwb-badf" cx="459" cy="432.99" r="3" />
      <circle className="mwb-badf" cx="510.33" cy="421.86" r="3" />
      <text className="mwb-cap mwb-muted" x="107.37" y="468.17">0.048</text>
      <text className="mwb-cap mwb-muted" x="502.63" y="410.86" textAnchor="end">0.171</text>
    </svg>
  );
}
