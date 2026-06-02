import { getSelectedStage, getVisualLaneCount, keyLabel } from './state';
import type { GameState, LaneFlash, Particle } from './types';

const HIT_LINE_RATIO = 0.74;
export const HIT_WINDOW = 68;
const MAX_RENDER_SCALE = 2;

function cssVar(name: string, fallback: string): string {
  const value = getComputedStyle(document.body).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Escala de renderização do canvas (devicePixelRatio limitado a 2 por
 * performance). O backing store é multiplicado por esta escala e o contexto
 * recebe setTransform(scale, ...), de modo que toda a lógica do jogo trabalha
 * em pixels lógicos (CSS) — evitando blur em telas HiDPI.
 */
export function getRenderScale(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_RENDER_SCALE);
}

/** Largura lógica (CSS px) da pista, independente do devicePixelRatio. */
export function viewWidth(canvas: HTMLCanvasElement): number {
  return canvas.width / getRenderScale();
}

/** Altura lógica (CSS px) da pista, independente do devicePixelRatio. */
export function viewHeight(canvas: HTMLCanvasElement): number {
  return canvas.height / getRenderScale();
}

export function getHitLineY(canvas: HTMLCanvasElement): number {
  return viewHeight(canvas) * HIT_LINE_RATIO;
}

export function addLaneFlash(state: GameState, laneIndex: number | null | undefined, color: string): void {
  if (laneIndex == null || laneIndex < 0) return;
  state.laneFlashes[laneIndex] = { color, remaining: 190, duration: 190 };
}

export function addParticles(state: GameState, x: number, y: number, color: string, amount = 7): void {
  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = 0.08 + Math.random() * 0.13;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 3,
      life: 420,
      remaining: 420,
      color,
    });
  }
}

export function updateEffects(state: GameState, stepMs: number): void {
  state.laneFlashes.forEach((flash: LaneFlash | null, index: number) => {
    if (!flash) return;
    flash.remaining -= stepMs;
    if (flash.remaining <= 0) state.laneFlashes[index] = null;
  });

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p: Particle = state.particles[i];
    p.remaining -= stepMs;
    p.x += p.vx * stepMs;
    p.y += p.vy * stepMs;
    p.vy += 0.0002 * stepMs;
    if (p.remaining <= 0) state.particles.splice(i, 1);
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function hexToRgba(color: string, opacity: number): string {
  if (!color.startsWith('#')) return color;
  const v = color.slice(1);
  const hex = v.length === 3 ? v.split('').map((c) => c + c).join('') : v;
  const n = parseInt(hex, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}

export function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: GameState,
  alpha: number,
): void {
  const stage = getSelectedStage(state);
  const laneCount = getVisualLaneCount(state);
  const w = viewWidth(canvas);
  const h = viewHeight(canvas);
  const laneWidth = w / laneCount;
  const hitLineY = getHitLineY(canvas);
  const bannerColor = cssVar('--dojo-primary', '#00a8cc');
  const titleColor = cssVar('--dojo-text-strong', '#082334');
  const fontTitle = cssVar('--font-title', 'sans-serif');

  ctx.clearRect(0, 0, w, h);

  // Background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#07131f');
  bg.addColorStop(0.48, '#0f2634');
  bg.addColorStop(1, '#0a151d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let y = 0; y < h; y += 28) ctx.fillRect(0, y, w, 1);

  // Grid + lane flashes
  for (let i = 0; i < laneCount; i++) {
    const x = i * laneWidth;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(0,214,255,0.045)' : 'rgba(64,255,180,0.035)';
    ctx.fillRect(x, 0, laneWidth, h);

    const flash = state.laneFlashes[i];
    if (flash) {
      const opacity = Math.max(0, flash.remaining / flash.duration) * 0.28;
      ctx.fillStyle = hexToRgba(flash.color, opacity);
      ctx.fillRect(x, 0, laneWidth, h);
    }

    ctx.strokeStyle = 'rgba(0,214,255,0.13)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  // Hit zone
  ctx.fillStyle = 'rgba(0,224,255,0.08)';
  ctx.fillRect(0, hitLineY - HIT_WINDOW, w, HIT_WINDOW * 2);

  ctx.shadowColor = 'rgba(0,224,255,0.75)';
  ctx.shadowBlur = 16;
  ctx.strokeStyle = '#00d6ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, hitLineY);
  ctx.lineTo(w, hitLineY);
  ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Tiles
  for (const tile of state.activeTiles) {
    const interpolatedY = tile.previousY + (tile.y - tile.previousY) * alpha;
    const grad = ctx.createLinearGradient(tile.x, interpolatedY, tile.x, interpolatedY + tile.height);
    grad.addColorStop(0, '#e8fbff');
    grad.addColorStop(0.5, bannerColor);
    grad.addColorStop(1, '#00a5c8');

    ctx.shadowColor = 'rgba(0,214,255,0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 3;
    ctx.fillStyle = grad;
    roundedRect(ctx, tile.x, interpolatedY, tile.width, tile.height, 7);
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = 'rgba(255,255,255,0.68)';
    ctx.lineWidth = 2;
    roundedRect(ctx, tile.x + 1, interpolatedY + 1, tile.width - 2, tile.height - 2, 6);
    ctx.stroke();

    ctx.fillStyle = titleColor;
    ctx.font = `700 ${Math.round(tile.height * 0.48)}px ${fontTitle}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tile.label, tile.x + tile.width / 2, interpolatedY + tile.height / 2);
  }

  // Particles
  for (const p of state.particles) {
    const opacity = Math.max(0, p.remaining / p.life);
    ctx.fillStyle = hexToRgba(p.color, opacity);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * opacity, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lane labels (lanes layout only)
  if (stage.layout === 'lanes') {
    const lw = w / stage.keys.length;
    const y = h - 34;
    ctx.font = `700 22px ${fontTitle}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < stage.keys.length; i++) {
      const x = i * lw + lw / 2;
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      roundedRect(ctx, x - 22, y - 20, 44, 40, 7);
      ctx.fill();
      ctx.fillStyle = titleColor;
      ctx.fillText(keyLabel(stage.keys[i]), x, y + 1);
    }
  }
}
