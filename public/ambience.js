// Decorative code texture inspired by the supplied Chronicle visual reference.
// This module does not read tool inputs or selected files.
export function initAmbient(canvas) {
  if (!canvas) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const glyphs = '01ABCDEF<>/{}[]:.';
  let width = 0, height = 0, phase = 0, frame = 0, previous = 0;
  function paint() {
    context.clearRect(0, 0, width, height);
    context.font = '12px "JetBrains Mono", monospace';
    for (let column = 0; column < Math.ceil(width / 26); column++) {
      const head = ((column * 59 + phase) % (height + 240)) - 80;
      for (let tail = 0; tail < 12; tail++) {
        const y = head - tail * 20;
        if (y < 0 || y > height) continue;
        context.globalAlpha = (1 - tail / 12) * 0.46;
        context.fillStyle = column % 7 === 0 ? '#f0a500' : '#00d4ff';
        context.fillText(glyphs[(column * 17 + tail * 7 + Math.floor(phase / 40)) % glyphs.length], column * 26, y);
      }
    }
    context.globalAlpha = 1;
  }
  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width; height = box.height;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0); paint();
  }
  function animate(time) {
    if (time - previous > 90) { phase += 3; previous = time; paint(); }
    frame = requestAnimationFrame(animate);
  }
  function update() {
    cancelAnimationFrame(frame); frame = 0;
    if (!document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(animate);
    else paint();
  }
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  reducedMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  window.addEventListener('pagehide', () => { cancelAnimationFrame(frame); observer.disconnect(); });
  window.addEventListener('pageshow', () => { observer.observe(canvas); resize(); update(); });
  resize(); update();
}
