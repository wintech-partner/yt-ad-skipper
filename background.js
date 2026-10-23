// Dispatches a real (trusted) mouse click into the tab through the DevTools protocol.
const PROTOCOL = '1.3';

function send(target, method, params) {
  return chrome.debugger.sendCommand(target, method, params);
}

async function trustedClick(tabId, x, y) {
  const target = { tabId };
  await chrome.debugger.attach(target, PROTOCOL);
  try {
    const base = { x, y, button: 'left', clickCount: 1 };
    await send(target, 'Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
    await send(target, 'Input.dispatchMouseEvent', { ...base, type: 'mousePressed' });
    await send(target, 'Input.dispatchMouseEvent', { ...base, type: 'mouseReleased' });
  } finally {
    await chrome.debugger.detach(target).catch(() => {});
  }
}

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'click' && sender.tab) {
    trustedClick(sender.tab.id, msg.x, msg.y).catch((e) => console.warn('skip click failed', e));
  }
});
