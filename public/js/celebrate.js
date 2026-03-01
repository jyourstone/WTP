/**
 * Full-screen silver fireworks celebration.
 * Launches from absolute screen coordinates (cx, cy).
 */
export function celebrate(cx, cy) {
  const container = document.createElement('div');
  container.className = 'celebrate-container';
  container.setAttribute('aria-hidden', 'true');
  document.body.appendChild(container);

  // Flash centered on the origin point
  const flash = document.createElement('div');
  flash.className = 'celebrate-flash';
  flash.style.background = `radial-gradient(circle at ${cx}px ${cy}px, rgba(255,255,255,0.2) 0%, transparent 60%)`;
  container.appendChild(flash);

  // Silver/white palette
  const colors = [
    '#e2e8f0', '#cbd5e1', '#f8fafc', '#ffffff',
    '#94a3b8', '#d4d4d8', '#c0c0c0', '#e5e7eb',
  ];

  // Wave 1: fast burst outward
  spawnWave(container, cx, cy, {
    count: 40,
    colors,
    velocityMin: 120,
    velocityMax: 350,
    sizeMin: 3,
    sizeMax: 7,
    durationMin: 600,
    durationMax: 1100,
    delay: 0,
    gravity: 60,
    sparkle: true,
  });

  // Wave 2: slower, bigger particles
  spawnWave(container, cx, cy, {
    count: 25,
    colors,
    velocityMin: 80,
    velocityMax: 250,
    sizeMin: 4,
    sizeMax: 10,
    durationMin: 800,
    durationMax: 1400,
    delay: 80,
    gravity: 40,
    sparkle: false,
  });

  // Wave 3: trailing sparkles
  spawnWave(container, cx, cy, {
    count: 20,
    colors: ['#ffffff', '#f8fafc', '#e2e8f0'],
    velocityMin: 60,
    velocityMax: 200,
    sizeMin: 2,
    sizeMax: 5,
    durationMin: 1000,
    durationMax: 1600,
    delay: 150,
    gravity: 80,
    sparkle: true,
  });

  setTimeout(() => container.remove(), 2000);
}

function spawnWave(container, cx, cy, opts) {
  for (let i = 0; i < opts.count; i++) {
    const particle = document.createElement('div');
    particle.className = 'celebrate-particle';
    if (opts.sparkle && Math.random() > 0.5) {
      particle.classList.add('celebrate-particle--sparkle');
    }

    const angle = (Math.PI * 2 * i) / opts.count + (Math.random() - 0.5) * 0.8;
    const velocity = opts.velocityMin + Math.random() * (opts.velocityMax - opts.velocityMin);
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity * 0.7 - velocity * 0.3;
    const size = opts.sizeMin + Math.random() * (opts.sizeMax - opts.sizeMin);
    const color = opts.colors[Math.floor(Math.random() * opts.colors.length)];
    const duration = opts.durationMin + Math.random() * (opts.durationMax - opts.durationMin);
    const delay = opts.delay + Math.random() * 100;

    particle.style.cssText = `
      left: ${cx}px;
      top: ${cy}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      --dx: ${dx}px;
      --dy: ${dy}px;
      --gravity: ${opts.gravity}px;
      animation-duration: ${duration}ms;
      animation-delay: ${delay}ms;
      border-radius: ${Math.random() > 0.3 ? '50%' : '1px'};
      box-shadow: 0 0 ${size}px ${color};
    `;

    container.appendChild(particle);
  }
}
