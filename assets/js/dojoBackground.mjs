let animationFrame = null;
let canvas = null;
let ctx = null;
let particles = [];
let reducedMotion = false;
let paused = false;
let eventsBound = false;

const SYMBOLS = ["A", "S", "D", "F", "J", "K", "L", "Ç"];
const COLORS = ["rgba(0,168,204,0.22)", "rgba(124,92,255,0.16)", "rgba(217,154,23,0.12)", "rgba(40,168,107,0.14)"];

export function initDojoBackground(options = {}) {
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return null;

  canvas = document.querySelector(".dojo-bg-canvas");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "dojo-bg-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.prepend(canvas);
  }

  ctx = canvas.getContext("2d");
  resize();
  createParticles(options.density || getDensity());
  bindEvents();
  start();

  return { start, stop, destroy };
}

function getDensity() {
  const area = window.innerWidth * window.innerHeight;
  return Math.max(22, Math.min(58, Math.floor(area / 26000)));
}

function bindEvents() {
  if (eventsBound) return;
  eventsBound = true;
  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function handleVisibilityChange() {
  paused = document.hidden;
  if (paused) {
    stop();
    return;
  }
  start();
}

function handleResize() {
  resize();
  createParticles(getDensity());
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function createParticles(count) {
  particles = Array.from({ length: count }, (_, index) => {
    const type = index % 11 === 0 ? "bamboo" : index % 17 === 0 ? "panda" : index % 3 === 0 ? "spark" : "key";
    return {
      type,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: type === "key" ? 12 + Math.random() * 12 : 8 + Math.random() * 24,
      speed: 0.08 + Math.random() * 0.28,
      drift: -0.12 + Math.random() * 0.24,
      alpha: 0.18 + Math.random() * 0.24,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
    };
  });
}

function start() {
  if (animationFrame || paused) return;
  loop();
}

function stop() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
}

function destroy() {
  stop();
  window.removeEventListener("resize", handleResize);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  eventsBound = false;
  canvas?.remove();
  canvas = null;
  ctx = null;
  particles = [];
}

function loop() {
  if (!ctx || paused) {
    animationFrame = null;
    return;
  }
  animationFrame = requestAnimationFrame(loop);

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  drawSoftGradient();
  drawArcadeGrid();
  for (const particle of particles) {
    updateParticle(particle);
    drawParticle(particle);
  }
}

function drawSoftGradient() {
  const gradient = ctx.createRadialGradient(window.innerWidth * 0.16, window.innerHeight * 0.12, 0, window.innerWidth * 0.16, window.innerHeight * 0.12, window.innerWidth * 0.52);
  gradient.addColorStop(0, "rgba(0,168,204,0.06)");
  gradient.addColorStop(1, "rgba(0,168,204,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

function drawArcadeGrid() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const horizon = height * 0.68;
  const spacing = Math.max(42, Math.min(78, width / 18));

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "rgba(20,184,212,0.55)";
  ctx.lineWidth = 1;

  for (let y = horizon; y < height + spacing; y += spacing) {
    const progress = (y - horizon) / Math.max(1, height - horizon);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + progress * 18);
    ctx.stroke();
  }

  for (let x = -width; x <= width * 2; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(width / 2, horizon);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "rgba(124,92,255,0.7)";
  for (let y = 18; y < height; y += 82) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

function updateParticle(particle) {
  particle.y -= particle.speed;
  particle.x += particle.drift;
  particle.rotation += 0.0018;

  if (particle.y < -40) {
    particle.y = window.innerHeight + 40;
    particle.x = Math.random() * window.innerWidth;
  }
  if (particle.x < -40) particle.x = window.innerWidth + 40;
  if (particle.x > window.innerWidth + 40) particle.x = -40;
}

function drawParticle(particle) {
  ctx.save();
  ctx.globalAlpha = particle.alpha;
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);

  if (particle.type === "key") {
    drawKey(particle);
  } else if (particle.type === "bamboo") {
    drawBamboo(particle);
  } else if (particle.type === "panda") {
    drawPandaMark(particle);
  } else {
    drawSpark(particle);
  }

  ctx.restore();
}

function drawKey(particle) {
  ctx.fillStyle = "rgba(255,255,255,0.26)";
  ctx.strokeStyle = particle.color;
  ctx.lineWidth = 1;
  roundRect(-particle.size, -particle.size * 0.7, particle.size * 2, particle.size * 1.4, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = particle.color;
  ctx.font = `700 ${Math.max(11, particle.size * 0.72)}px Quicksand, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(particle.symbol, 0, 1);
}

function drawBamboo(particle) {
  ctx.strokeStyle = "rgba(40,168,107,0.18)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -particle.size);
  ctx.lineTo(0, particle.size);
  ctx.stroke();
  for (let y = -particle.size * 0.6; y <= particle.size * 0.6; y += particle.size * 0.45) {
    ctx.beginPath();
    ctx.moveTo(-5, y);
    ctx.lineTo(5, y - 2);
    ctx.stroke();
  }
}

function drawPandaMark(particle) {
  ctx.fillStyle = "rgba(11,57,84,0.07)";
  ctx.beginPath();
  ctx.arc(0, 0, particle.size * 0.72, 0, Math.PI * 2);
  ctx.arc(-particle.size * 0.55, -particle.size * 0.58, particle.size * 0.34, 0, Math.PI * 2);
  ctx.arc(particle.size * 0.55, -particle.size * 0.58, particle.size * 0.34, 0, Math.PI * 2);
  ctx.fill();
}

function drawSpark(particle) {
  ctx.fillStyle = particle.color;
  ctx.beginPath();
  ctx.arc(0, 0, particle.size * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
