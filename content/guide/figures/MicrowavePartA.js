// Fig. 5.3 — the microwave Part A worked example
// (content/guide/worked-examples.js, 'two-minima'): the mean receiver output
// S against the angle of incidence for the whole 30–70° scan, with the two
// minima marked.
//
// Every coordinate here is a reading from scripts/worked-example-microwave.mjs
// at seed 2006 (Table A in its output), like the tables in the prose. Don't
// hand-edit it: if the data change, regenerate the figure from the script's
// output. Converted from a 560x430 SVG with its C2PA metadata stripped, the
// same way as MicrowavePartB.js: plain value first and var() second in the
// style block, because var() doesn't resolve in SVG presentation attributes;
// --chalk and --trace with PartBStageOne's frame (.34) and grid (.13)
// opacities; --panel and --muted from the figure box and captions. The
// @media rule raises the type on narrow screens, since a media query in an
// inline SVG responds to the viewport. Classes are prefixed mwa-, and the
// text rule is scoped to .mwa, because an inline SVG's <style> applies to the
// whole page.
export default function MicrowavePartA() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="mwa"
      viewBox="0 0 560 430"
      role="img"
      aria-labelledby="mwa-t mwa-d"
    >
      <title id="mwa-t">Receiver output against the angle of incidence, across the whole scan</title>
      <desc id="mwa-d">The reading falls to a sharp minimum at 36.5 degrees and again at 59.0 degrees, with straight sides rather than rounded ones, and rises between and beyond them. The two minima are consecutive orders, 10 and 9.</desc>

      <style>{`
        .mwa-ink   { fill: #1f2328; fill: var(--chalk, #1f2328); }
        .mwa-rule  { stroke: #c9ced6; stroke: var(--chalk, #c9ced6); stroke-opacity: .34; fill: none; }
        .mwa-grid  { stroke: #e9ecf1; stroke: var(--chalk, #e9ecf1); stroke-opacity: .13; fill: none; }
        .mwa-muted { fill: #6b7280; fill: var(--muted, #6b7280); }
        .mwa-ok    { stroke: #2563a8; stroke: var(--trace, #2563a8); fill: none; }
        .mwa-okf   { fill: #2563a8; fill: var(--trace, #2563a8); }
        .mwa-bg    { fill: #ffffff; fill: var(--panel, #ffffff); }
        .mwa text  { font-family: ui-sans-serif, -apple-system, "Segoe UI", Roboto, sans-serif;
                     font-family: var(--font-sans, ui-sans-serif), -apple-system, "Segoe UI", Roboto, sans-serif; }
        .mwa-lbl   { font-size: 12.5px; }
        .mwa-tick  { font-size: 12px; }
        .mwa-cap   { font-size: 12px; }
        .mwa-panel { font-size: 13px; font-weight: 600; }
        @media (max-width: 600px) {
          .mwa-lbl   { font-size: 17px; }
          .mwa-tick  { font-size: 17px; }
          .mwa-cap   { font-size: 16px; }
          .mwa-panel { font-size: 18px; }
        }
      `}</style>

      <rect className="mwa-bg" x="0" y="0" width="560" height="430" />
      <text className="mwa-panel mwa-ink" x="66" y="26">Receiver output across the scan</text>
      <line className="mwa-grid" x1="66" y1="268.26" x2="536" y2="268.26" />
      <line className="mwa-grid" x1="66" y1="206.52" x2="536" y2="206.52" />
      <line className="mwa-grid" x1="66" y1="144.78" x2="536" y2="144.78" />
      <line className="mwa-grid" x1="66" y1="83.04" x2="536" y2="83.04" />
      <line className="mwa-rule" x1="66" y1="46" x2="66" y2="330" />
      <line className="mwa-rule" x1="66" y1="330" x2="536" y2="330" />
      <line className="mwa-rule" x1="60" y1="330" x2="66" y2="330" />
      <text className="mwa-tick mwa-muted" x="55" y="335" textAnchor="end">0.0</text>
      <line className="mwa-rule" x1="63" y1="299.13" x2="66" y2="299.13" />
      <line className="mwa-rule" x1="60" y1="268.26" x2="66" y2="268.26" />
      <text className="mwa-tick mwa-muted" x="55" y="273.26" textAnchor="end">0.2</text>
      <line className="mwa-rule" x1="63" y1="237.39" x2="66" y2="237.39" />
      <line className="mwa-rule" x1="60" y1="206.52" x2="66" y2="206.52" />
      <text className="mwa-tick mwa-muted" x="55" y="211.52" textAnchor="end">0.4</text>
      <line className="mwa-rule" x1="63" y1="175.65" x2="66" y2="175.65" />
      <line className="mwa-rule" x1="60" y1="144.78" x2="66" y2="144.78" />
      <text className="mwa-tick mwa-muted" x="55" y="149.78" textAnchor="end">0.6</text>
      <line className="mwa-rule" x1="63" y1="113.91" x2="66" y2="113.91" />
      <line className="mwa-rule" x1="60" y1="83.04" x2="66" y2="83.04" />
      <text className="mwa-tick mwa-muted" x="55" y="88.04" textAnchor="end">0.8</text>
      <line className="mwa-rule" x1="77.19" y1="330" x2="77.19" y2="336" />
      <text className="mwa-tick mwa-muted" x="77.19" y="353" textAnchor="middle">30</text>
      <line className="mwa-rule" x1="133.14" y1="330" x2="133.14" y2="333" />
      <line className="mwa-rule" x1="189.1" y1="330" x2="189.1" y2="336" />
      <text className="mwa-tick mwa-muted" x="189.1" y="353" textAnchor="middle">40</text>
      <line className="mwa-rule" x1="245.05" y1="330" x2="245.05" y2="333" />
      <line className="mwa-rule" x1="301" y1="330" x2="301" y2="336" />
      <text className="mwa-tick mwa-muted" x="301" y="353" textAnchor="middle">50</text>
      <line className="mwa-rule" x1="356.95" y1="330" x2="356.95" y2="333" />
      <line className="mwa-rule" x1="412.9" y1="330" x2="412.9" y2="336" />
      <text className="mwa-tick mwa-muted" x="412.9" y="353" textAnchor="middle">60</text>
      <line className="mwa-rule" x1="468.86" y1="330" x2="468.86" y2="333" />
      <line className="mwa-rule" x1="524.81" y1="330" x2="524.81" y2="336" />
      <text className="mwa-tick mwa-muted" x="524.81" y="353" textAnchor="middle">70</text>
      <text className="mwa-lbl mwa-ink" transform="translate(22,188) rotate(-90)" textAnchor="middle">receiver output S (mA)</text>
      <text className="mwa-lbl mwa-ink" x="301" y="378" textAnchor="middle">angle of incidence θ (degrees)</text>
      <path className="mwa-ok" strokeWidth="1.4" d="M 77.19 213.62 L 82.79 219.27 L 88.38 225.26 L 93.98 232.36 L 99.57 237.79 L 105.17 245.94 L 110.76 254.77 L 116.36 263.54 L 121.95 272.68 L 127.55 282.68 L 133.14 292.86 L 138.74 304.16 L 144.33 315.49 L 149.93 325.59 L 155.52 313.64 L 161.12 300.58 L 166.71 288.42 L 172.31 275.58 L 177.9 263.94 L 183.5 251.68 L 189.1 240.39 L 194.69 230.82 L 200.29 219.58 L 205.88 209.52 L 211.48 200.26 L 217.07 190.99 L 222.67 181.83 L 228.26 174.32 L 233.86 170 L 239.45 162.29 L 245.05 157.84 L 250.64 152.1 L 256.24 148.39 L 261.83 146.73 L 267.43 143.24 L 273.02 143.64 L 278.62 140.06 L 284.21 138.61 L 289.81 135.83 L 295.4 138.52 L 301 139.94 L 306.6 141.91 L 312.19 141.17 L 317.79 144.78 L 323.38 151.36 L 328.98 156.11 L 334.57 159.29 L 340.17 165.56 L 345.76 173.18 L 351.36 180.5 L 356.95 191.7 L 362.55 199.21 L 368.14 214.24 L 373.74 228.44 L 379.33 244.09 L 384.93 261.87 L 390.52 281.94 L 396.12 300.67 L 401.71 321.67 L 407.31 310.46 L 412.9 287.62 L 418.5 266.01 L 424.1 245.2 L 429.69 224.12 L 435.29 206 L 440.88 188.83 L 446.48 172.26 L 452.07 157.04 L 457.67 143.46 L 463.26 133.58 L 468.86 119.25 L 474.45 111.23 L 480.05 103.42 L 485.64 96.63 L 491.24 94.16 L 496.83 87.67 L 502.43 82.95 L 508.02 72.76 L 513.62 72.86 L 519.21 68.63 L 524.81 65.66" />
      <circle className="mwa-okf" cx="77.19" cy="213.62" r="1.9" />
      <circle className="mwa-okf" cx="82.79" cy="219.27" r="1.9" />
      <circle className="mwa-okf" cx="88.38" cy="225.26" r="1.9" />
      <circle className="mwa-okf" cx="93.98" cy="232.36" r="1.9" />
      <circle className="mwa-okf" cx="99.57" cy="237.79" r="1.9" />
      <circle className="mwa-okf" cx="105.17" cy="245.94" r="1.9" />
      <circle className="mwa-okf" cx="110.76" cy="254.77" r="1.9" />
      <circle className="mwa-okf" cx="116.36" cy="263.54" r="1.9" />
      <circle className="mwa-okf" cx="121.95" cy="272.68" r="1.9" />
      <circle className="mwa-okf" cx="127.55" cy="282.68" r="1.9" />
      <circle className="mwa-okf" cx="133.14" cy="292.86" r="1.9" />
      <circle className="mwa-okf" cx="138.74" cy="304.16" r="1.9" />
      <circle className="mwa-okf" cx="144.33" cy="315.49" r="1.9" />
      <circle className="mwa-okf" cx="149.93" cy="325.59" r="1.9" />
      <circle className="mwa-okf" cx="155.52" cy="313.64" r="1.9" />
      <circle className="mwa-okf" cx="161.12" cy="300.58" r="1.9" />
      <circle className="mwa-okf" cx="166.71" cy="288.42" r="1.9" />
      <circle className="mwa-okf" cx="172.31" cy="275.58" r="1.9" />
      <circle className="mwa-okf" cx="177.9" cy="263.94" r="1.9" />
      <circle className="mwa-okf" cx="183.5" cy="251.68" r="1.9" />
      <circle className="mwa-okf" cx="189.1" cy="240.39" r="1.9" />
      <circle className="mwa-okf" cx="194.69" cy="230.82" r="1.9" />
      <circle className="mwa-okf" cx="200.29" cy="219.58" r="1.9" />
      <circle className="mwa-okf" cx="205.88" cy="209.52" r="1.9" />
      <circle className="mwa-okf" cx="211.48" cy="200.26" r="1.9" />
      <circle className="mwa-okf" cx="217.07" cy="190.99" r="1.9" />
      <circle className="mwa-okf" cx="222.67" cy="181.83" r="1.9" />
      <circle className="mwa-okf" cx="228.26" cy="174.32" r="1.9" />
      <circle className="mwa-okf" cx="233.86" cy="170" r="1.9" />
      <circle className="mwa-okf" cx="239.45" cy="162.29" r="1.9" />
      <circle className="mwa-okf" cx="245.05" cy="157.84" r="1.9" />
      <circle className="mwa-okf" cx="250.64" cy="152.1" r="1.9" />
      <circle className="mwa-okf" cx="256.24" cy="148.39" r="1.9" />
      <circle className="mwa-okf" cx="261.83" cy="146.73" r="1.9" />
      <circle className="mwa-okf" cx="267.43" cy="143.24" r="1.9" />
      <circle className="mwa-okf" cx="273.02" cy="143.64" r="1.9" />
      <circle className="mwa-okf" cx="278.62" cy="140.06" r="1.9" />
      <circle className="mwa-okf" cx="284.21" cy="138.61" r="1.9" />
      <circle className="mwa-okf" cx="289.81" cy="135.83" r="1.9" />
      <circle className="mwa-okf" cx="295.4" cy="138.52" r="1.9" />
      <circle className="mwa-okf" cx="301" cy="139.94" r="1.9" />
      <circle className="mwa-okf" cx="306.6" cy="141.91" r="1.9" />
      <circle className="mwa-okf" cx="312.19" cy="141.17" r="1.9" />
      <circle className="mwa-okf" cx="317.79" cy="144.78" r="1.9" />
      <circle className="mwa-okf" cx="323.38" cy="151.36" r="1.9" />
      <circle className="mwa-okf" cx="328.98" cy="156.11" r="1.9" />
      <circle className="mwa-okf" cx="334.57" cy="159.29" r="1.9" />
      <circle className="mwa-okf" cx="340.17" cy="165.56" r="1.9" />
      <circle className="mwa-okf" cx="345.76" cy="173.18" r="1.9" />
      <circle className="mwa-okf" cx="351.36" cy="180.5" r="1.9" />
      <circle className="mwa-okf" cx="356.95" cy="191.7" r="1.9" />
      <circle className="mwa-okf" cx="362.55" cy="199.21" r="1.9" />
      <circle className="mwa-okf" cx="368.14" cy="214.24" r="1.9" />
      <circle className="mwa-okf" cx="373.74" cy="228.44" r="1.9" />
      <circle className="mwa-okf" cx="379.33" cy="244.09" r="1.9" />
      <circle className="mwa-okf" cx="384.93" cy="261.87" r="1.9" />
      <circle className="mwa-okf" cx="390.52" cy="281.94" r="1.9" />
      <circle className="mwa-okf" cx="396.12" cy="300.67" r="1.9" />
      <circle className="mwa-okf" cx="401.71" cy="321.67" r="1.9" />
      <circle className="mwa-okf" cx="407.31" cy="310.46" r="1.9" />
      <circle className="mwa-okf" cx="412.9" cy="287.62" r="1.9" />
      <circle className="mwa-okf" cx="418.5" cy="266.01" r="1.9" />
      <circle className="mwa-okf" cx="424.1" cy="245.2" r="1.9" />
      <circle className="mwa-okf" cx="429.69" cy="224.12" r="1.9" />
      <circle className="mwa-okf" cx="435.29" cy="206" r="1.9" />
      <circle className="mwa-okf" cx="440.88" cy="188.83" r="1.9" />
      <circle className="mwa-okf" cx="446.48" cy="172.26" r="1.9" />
      <circle className="mwa-okf" cx="452.07" cy="157.04" r="1.9" />
      <circle className="mwa-okf" cx="457.67" cy="143.46" r="1.9" />
      <circle className="mwa-okf" cx="463.26" cy="133.58" r="1.9" />
      <circle className="mwa-okf" cx="468.86" cy="119.25" r="1.9" />
      <circle className="mwa-okf" cx="474.45" cy="111.23" r="1.9" />
      <circle className="mwa-okf" cx="480.05" cy="103.42" r="1.9" />
      <circle className="mwa-okf" cx="485.64" cy="96.63" r="1.9" />
      <circle className="mwa-okf" cx="491.24" cy="94.16" r="1.9" />
      <circle className="mwa-okf" cx="496.83" cy="87.67" r="1.9" />
      <circle className="mwa-okf" cx="502.43" cy="82.95" r="1.9" />
      <circle className="mwa-okf" cx="508.02" cy="72.76" r="1.9" />
      <circle className="mwa-okf" cx="513.62" cy="72.86" r="1.9" />
      <circle className="mwa-okf" cx="519.21" cy="68.63" r="1.9" />
      <circle className="mwa-okf" cx="524.81" cy="65.66" r="1.9" />
      <text className="mwa-cap mwa-ink" x="160" y="316.11">36.5°, order 10</text>
      <text className="mwa-cap mwa-ink" x="411.79" y="316.11">59.0°, order 9</text>
    </svg>
  );
}
