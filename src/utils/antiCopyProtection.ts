// WATTOPro Anti-Copy & System Protection Layer
// 1. Right Click Disabled
// 2. Text Selection & Copy/Cut Disabled
// 3. DevTools shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S) Disabled
// 4. Console Security Warnings
// 5. DOM Integrity Watermark Sentinel ("WATTOPro - Kasur")

export function initAntiCopyProtection(): () => void {
  // Console Warning
  try {
    console.log(
      "%c⚠️ WATTOPro Protected System",
      "color: #ff1744; font-size: 32px; font-weight: 900; text-shadow: 0 0 10px rgba(255,23,68,0.7);"
    );
    console.log(
      "%cCopying this bot is illegal!",
      "color: #ffd600; font-size: 18px; font-weight: bold;"
    );
    console.log(
      "%cWATTOPro Trading Terminal • All Rights Reserved • Proprietary Algorithms Protected.",
      "color: #00e5ff; font-size: 13px;"
    );
  } catch {
    // ignore
  }

  // 1. Disable Right Click
  const handleContextMenu = (e: MouseEvent) => {
    try {
      e.preventDefault();
    } catch {}
    return false;
  };

  // 2. Disable Copy & Cut
  const handleCopy = (e: ClipboardEvent) => {
    try {
      e.preventDefault();
    } catch {}
    return false;
  };

  const handleCut = (e: ClipboardEvent) => {
    try {
      e.preventDefault();
    } catch {}
    return false;
  };

  // 3. Disable DevTools keys (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
  const handleKeyDown = (e: KeyboardEvent) => {
    try {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key ? e.key.toLowerCase() : '';

      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (isCtrl && (key === 'u' || key === 's' || key === 'p'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    } catch {}
  };

  // Attach global event listeners
  try {
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('copy', handleCopy, { capture: true });
    document.addEventListener('cut', handleCut, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
  } catch {}

  // Watermark Sentinel: "WATTOPro - Kasur"
  const WATERMARK_ID = 'wattopro-sentinel-watto-kasur';
  try {
    let sentinelEl = document.getElementById(WATERMARK_ID);
    if (!sentinelEl && typeof document !== 'undefined' && document.body) {
      sentinelEl = document.createElement('div');
      sentinelEl.id = WATERMARK_ID;
      sentinelEl.setAttribute('data-author', 'WATTOPro - Kasur');
      sentinelEl.setAttribute('aria-hidden', 'true');
      sentinelEl.style.cssText =
        'position: fixed; bottom: 0; right: 0; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; z-index: -9999; user-select: none; font-size: 1px; color: transparent;';
      sentinelEl.textContent = 'WATTOPro - Kasur';
      document.body.appendChild(sentinelEl);
    }
  } catch {}

  // Return cleanup function
  return () => {
    try {
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('copy', handleCopy, { capture: true });
      document.removeEventListener('cut', handleCut, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    } catch {}
  };
}
