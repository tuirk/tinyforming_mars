/**
 * Synthetic cursor for the recording.
 *
 * Playwright's video has no cursor, so clicks appear to happen by themselves.
 * Playwright 1.63 can draw one via `recordVideo.showActions`, but that also
 * burns action titles like `click getByTestId('pass')` into the frame — fine for
 * a test artifact, wrong for a gameplay video the user intends to edit. So we
 * draw our own: pointer, no labels.
 *
 * The overlay is `pointer-events: none`, so it never intercepts a click.
 */
export const CURSOR_INIT_SCRIPT = `
(() => {
  const draw = () => {
    if (document.getElementById('__tfCursor')) return;
    const root = document.createElement('div');
    root.id = '__tfCursor';
    root.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:28px', 'height:28px',
      'pointer-events:none', 'z-index:2147483647',
      'transform:translate(-100px,-100px)', 'will-change:transform',
    ].join(';');
    root.innerHTML =
      '<svg width="28" height="28" viewBox="0 0 28 28">' +
      '<path d="M5 3 L5 21 L10 16.5 L13.2 23.5 L16.6 22 L13.4 15.2 L20 15 Z"' +
      ' fill="#ffffff" stroke="#111111" stroke-width="1.4" stroke-linejoin="round"/>' +
      '</svg>';

    const ripple = document.createElement('div');
    ripple.id = '__tfRipple';
    ripple.style.cssText = [
      'position:fixed', 'left:0', 'top:0', 'width:34px', 'height:34px',
      'margin:-17px 0 0 -17px', 'border-radius:50%',
      'border:2px solid rgba(232,135,45,0.9)', 'background:rgba(232,135,45,0.22)',
      'pointer-events:none', 'z-index:2147483646', 'opacity:0',
      'transform:translate(-100px,-100px) scale(0.4)',
      'transition:opacity 340ms ease-out, transform 340ms ease-out',
    ].join(';');

    document.body.appendChild(root);
    document.body.appendChild(ripple);

    addEventListener('mousemove', (e) => {
      root.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    }, { capture: true, passive: true });

    addEventListener('mousedown', (e) => {
      ripple.style.transition = 'none';
      ripple.style.opacity = '1';
      ripple.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) scale(0.4)';
      requestAnimationFrame(() => {
        ripple.style.transition = 'opacity 340ms ease-out, transform 340ms ease-out';
        ripple.style.opacity = '0';
        ripple.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px) scale(1.5)';
      });
    }, { capture: true, passive: true });
  };

  if (document.body) draw();
  else addEventListener('DOMContentLoaded', draw, { once: true });
})();
`;
