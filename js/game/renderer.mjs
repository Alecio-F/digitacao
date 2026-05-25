import { getSelectedStage, getVisualLaneCount, keyLabel } from "./state.mjs";

const HIT_LINE_RATIO = 0.74;
export const HIT_WINDOW = 68;

function cssVar(name, fallback) {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value || fallback;
}

export function getHitLineY(canvas) {
  return canvas.height * HIT_LINE_RATIO;
}

export function readTheme() {
  return {
    header: cssVar("--corHeader", "#eeeeee"),
    banner: cssVar("--corBanner", "#bfd7ea"),
    text: cssVar("--corTexto", "#087ca7"),
    title: cssVar("--corTitulo", "#0b3954"),
    bodyText: cssVar("--corTextoGeral", "#000000"),
    good: "#28d17c",
    perfect: "#ffd166",
    late: "#ffad42",
    miss: "#ff4f5e",
  };
}

export function addLaneFlash(state, laneIndex, color) {
  if (laneIndex === null || laneIndex === undefined || laneIndex < 0) {
    return;
  }

  state.laneFlashes[laneIndex] = {
    color,
    remaining: 190,
    duration: 190,
  };
}

export function addParticles(state, x, y, color, amount = 7) {
  for (let index = 0; index < amount; index += 1) {
    const angle = (Math.PI * 2 * index) / amount;
    const speed = 0.08 + Math.random() * 0.13;
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 3,
      life: 420,
      remaining: 420,
      color,
    });
  }
}

export function updateEffects(state, stepMs) {
  state.laneFlashes.forEach((flash, index) => {
    if (!flash) {
      return;
    }

    flash.remaining -= stepMs;
    if (flash.remaining <= 0) {
      state.laneFlashes[index] = null;
    }
  });

  for (let index = state.particles.length - 1; index >= 0; index -= 1) {
    const particle = state.particles[index];
    particle.remaining -= stepMs;
    particle.x += particle.vx * stepMs;
    particle.y += particle.vy * stepMs;
    particle.vy += 0.0002 * stepMs;

    if (particle.remaining <= 0) {
      state.particles.splice(index, 1);
    }
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

export function render(ctx, canvas, state, alpha) {
  const theme = readTheme();
  const stage = getSelectedStage(state);
  const laneCount = getVisualLaneCount(state);
  const laneWidth = canvas.width / laneCount;
  const hitLineY = getHitLineY(canvas);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArena(ctx, canvas, theme);
  drawGrid(ctx, canvas, state, laneCount, laneWidth);

  ctx.fillStyle = "rgba(0, 224, 255, 0.08)";
  ctx.fillRect(0, hitLineY - HIT_WINDOW, canvas.width, HIT_WINDOW * 2);

  ctx.shadowColor = "rgba(0, 224, 255, 0.75)";
  ctx.shadowBlur = 16;
  ctx.strokeStyle = "#00d6ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, hitLineY);
  ctx.lineTo(canvas.width, hitLineY);
  ctx.stroke();
  ctx.shadowColor = "transparent";

  for (const tile of state.activeTiles) {
    const interpolatedY = tile.previousY + (tile.y - tile.previousY) * alpha;
    drawTile(ctx, tile, interpolatedY, theme);
  }

  for (const particle of state.particles) {
    const opacity = Math.max(0, particle.remaining / particle.life);
    ctx.fillStyle = hexToRgba(particle.color, opacity);
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * opacity, 0, Math.PI * 2);
    ctx.fill();
  }

  if (stage.layout === "lanes") {
    drawLaneLabels(ctx, canvas, stage, theme);
  }
}

function drawArena(ctx, canvas) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#07131f");
  gradient.addColorStop(0.48, "#0f2634");
  gradient.addColorStop(1, "#0a151d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let y = 0; y < canvas.height; y += 28) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawGrid(ctx, canvas, state, laneCount, laneWidth) {
  for (let index = 0; index < laneCount; index += 1) {
    const x = index * laneWidth;
    ctx.fillStyle = index % 2 === 0 ? "rgba(0, 214, 255, 0.045)" : "rgba(64, 255, 180, 0.035)";
    ctx.fillRect(x, 0, laneWidth, canvas.height);

    const flash = state.laneFlashes[index];
    if (flash) {
      const opacity = Math.max(0, flash.remaining / flash.duration) * 0.28;
      ctx.fillStyle = hexToRgba(flash.color, opacity);
      ctx.fillRect(x, 0, laneWidth, canvas.height);
    }

    ctx.strokeStyle = "rgba(0, 214, 255, 0.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

function drawTile(ctx, tile, y, theme) {
  const gradient = ctx.createLinearGradient(tile.x, y, tile.x, y + tile.height);
  gradient.addColorStop(0, "#e8fbff");
  gradient.addColorStop(0.5, theme.banner);
  gradient.addColorStop(1, "#00a5c8");

  ctx.shadowColor = "rgba(0, 214, 255, 0.5)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = gradient;
  roundedRect(ctx, tile.x, y, tile.width, tile.height, 7);
  ctx.fill();
  ctx.shadowColor = "transparent";

  ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
  ctx.lineWidth = 2;
  roundedRect(ctx, tile.x + 1, y + 1, tile.width - 2, tile.height - 2, 6);
  ctx.stroke();

  ctx.fillStyle = "#082334";
  ctx.font = `700 ${Math.round(tile.height * 0.48)}px ${cssVar("--fontTitulo", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(tile.label, tile.x + tile.width / 2, y + tile.height / 2);
}

function drawLaneLabels(ctx, canvas, stage, theme) {
  const laneWidth = canvas.width / stage.keys.length;
  const y = canvas.height - 34;

  ctx.font = `700 22px ${cssVar("--fontTitulo", "sans-serif")}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let index = 0; index < stage.keys.length; index += 1) {
    const x = index * laneWidth + laneWidth / 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
    roundedRect(ctx, x - 22, y - 20, 44, 40, 7);
    ctx.fill();
    ctx.fillStyle = theme.title;
    ctx.fillText(keyLabel(stage.keys[index]), x, y + 1);
  }
}

function hexToRgba(color, opacity) {
  if (!color.startsWith("#")) {
    return color;
  }

  const value = color.slice(1);
  const normalized = value.length === 3
    ? value.split("").map((part) => part + part).join("")
    : value;
  const intValue = parseInt(normalized, 16);
  const red = (intValue >> 16) & 255;
  const green = (intValue >> 8) & 255;
  const blue = intValue & 255;

  return `rgba(${red}, ${green}, ${blue}, ${opacity})`;
}
