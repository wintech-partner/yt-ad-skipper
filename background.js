// Dispatches a real (trusted) mouse click into the tab through the DevTools protocol.
const PROTOCOL = '1.3';
const SKIP_SELECTOR =
  '.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-ad-skip-button-container button';

function send(target, method, params) {
  return chrome.debugger.sendCommand(target, method, params);
}

// Only click when an ad is showing and the point really is a skip button inside the player.
async function isSkipButtonAt(target, x, y) {
  const expression = `((x, y) => {
    const player = document.querySelector('#movie_player');
    if (!player || !player.classList.contains('ad-showing')) return false;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return false;
    const el = document.elementFromPoint(x, y);
    const btn = el && el.closest(${JSON.stringify(SKIP_SELECTOR)});
    return !!btn && player.contains(btn);
  })(${x}, ${y})`;
  const res = await send(target, 'Runtime.evaluate', { expression, returnByValue: true });
  return res.result && res.result.value === true;
}

async function trustedClick(tabId, x, y) {
  const target = { tabId };
  await chrome.debugger.attach(target, PROTOCOL);
  try {
    if (!(await isSkipButtonAt(target, x, y))) return;
    const base = { x, y, button: 'left', clickCount: 1 };
    await send(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await send(target, 'Input.dispatchMouseEvent', { ...base, type: 'mousePressed' });
    await send(target, 'Input.dispatchMouseEvent', { ...base, type: 'mouseReleased' });
  } finally {
    await chrome.debugger.detach(target).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type !== 'click' || !sender.tab || sender.frameId !== 0) return;
  if (!/^https:\/\/(www|m)\.youtube\.com\//.test(sender.url || '')) return;
  if (!Number.isFinite(msg.x) || !Number.isFinite(msg.y)) return;
  trustedClick(sender.tab.id, msg.x, msg.y).catch((e) => console.warn('skip click failed', e));
});
