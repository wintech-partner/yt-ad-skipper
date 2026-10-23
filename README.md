# YT Ad Skipper

Chromium MV3 extension that clicks YouTube's "Skip Ad" button as soon as it appears.

YouTube ignores synthetic `element.click()`, so the background worker sends a real
mouse click through the DevTools protocol (`debugger` permission). Chrome shows a
"started debugging this browser" bar for a moment on each skip.

Install: `chrome://extensions` -> Developer mode -> Load unpacked -> this folder.
