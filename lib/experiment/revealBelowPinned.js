// Brings a just-placed instrument panel wholly into view under the bench's
// pinned apparatus (.bench-pinned), where a student reading it would put it
// (scripts/layout-audit.mjs's underPinned does the same as a check). Scrolls
// the panel's own scroller, the bench column on a wide screen or the page
// on a phone, and only ever down: a panel already in view stays put.
//
// Why: once the pinned region sticks, a panel starts only the menu row and
// two gaps (~69 px) below it, so scrolling down to a panel that is half off
// the bottom leaves a band of a few dozen px before it slides under; one
// wheel notch overshoots it (docs/conventions.md, Bench layout).

const MARGIN = 12;

function scrollParent(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
  }
  return window;
}

// The nearest pinned apparatus sharing an ancestor with the panel.
function pinnedFor(el) {
  for (let p = el.parentElement; p; p = p.parentElement) {
    const pin = p.querySelector('.bench-pinned');
    if (pin && !pin.contains(el)) return pin;
  }
  return null;
}

export function revealBelowPinned(el) {
  if (!el) return;
  const scroller = scrollParent(el);
  const scroll = (dy) => (scroller === window ? window.scrollBy({ top: dy, behavior: 'instant' }) : scroller.scrollBy({ top: dy, behavior: 'instant' }));
  const viewBottom = Math.min(window.innerHeight, scroller === window ? Infinity : scroller.getBoundingClientRect().bottom);
  // Down until its bottom is on screen…
  const below = el.getBoundingClientRect().bottom - (viewBottom - MARGIN);
  if (below > 0) scroll(below);
  // …but never so far that its top passes under the pinned region (which
  // may itself have ridden up and stuck during that scroll).
  const pin = pinnedFor(el);
  if (!pin) return;
  const under = pin.getBoundingClientRect().bottom + MARGIN - el.getBoundingClientRect().top;
  if (under > 0 && below > 0) scroll(-Math.min(under, below));
}
