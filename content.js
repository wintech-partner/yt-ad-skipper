// Finds YouTube's visible skip button and asks the background worker for a trusted click.
// A plain element.click() is ignored by YouTube (isTrusted check), hence the debugger route.
const SELECTORS = [
  '.ytp-skip-ad-button',
  '.ytp-ad-skip-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-ad-skip-button-container button',
];

let lastClick = 0;

function findSkipButton() {
  for (const el of document.querySelectorAll(SELECTORS.join(','))) {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    if (r.width > 0 && r.height > 0 && style.visibility !== 'hidden' && style.display !== 'none') {
      return r;
    }
  }
  return null;
}

function tick() {
  const r = findSkipButton();
  if (!r || Date.now() - lastClick < 1500) return;
  lastClick = Date.now();
  chrome.runtime.sendMessage({ type: 'click', x: r.left + r.width / 2, y: r.top + r.height / 2 });
}

setInterval(tick, 400);
