import { useEffect, useRef } from 'react';
import { useSettingsContext } from '@/app/settingsContext';
import styles from './BackgroundCanvas.module.css';

const SYMBOLS = ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'Ç'];
const COLORS = [
  'rgba(0,168,204,0.22)',
  'rgba(124,92,255,0.16)',
  'rgba(217,154,23,0.12)',
  'rgba(40,168,107,0.14)',
];

interface Particle {
  type: 'key' | 'bamboo' | 'panda' | 'spark';
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  symbol: string;
  color: string;
  rotation: number;
}

function getDensity() {
  const area = window.innerWidth * window.innerHeight;
  const base = Math.max(14, Math.min(58, Math.floor(area / 26000)));
  return window.innerWidth < 720 ? Math.min(base, 22) : base;
}

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const type: Particle['type'] =
      i % 11 === 0 ? 'bamboo' : i % 17 === 0 ? 'panda' : i % 3 === 0 ? 'spark' : 'key';
    return {
      type,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: type === 'key' ? 12 + Math.random() * 12 : 8 + Math.random() * 24,
      speed: 0.08 + Math.random() * 0.28,
      drift: -0.12 + Math.random() * 0.24,
      alpha: 0.18 + Math.random() * 0.24,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * Math.PI,
    };
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

interface Props {
  density?: number;
}

export function BackgroundCanvas({ density }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { animationsEnabled, reducedEffects } = useSettingsContext();

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !animationsEnabled || reducedEffects) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number | null = null;
    let particles: Particle[] = [];
    let paused = false;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      canvas!.width = Math.floor(window.innerWidth * dpr);
      canvas!.height = Math.floor(window.innerHeight * dpr);
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawGradient() {
      const g = ctx!.createRadialGradient(
        window.innerWidth * 0.16, window.innerHeight * 0.12, 0,
        window.innerWidth * 0.16, window.innerHeight * 0.12, window.innerWidth * 0.52,
      );
      g.addColorStop(0, 'rgba(0,168,204,0.06)');
      g.addColorStop(1, 'rgba(0,168,204,0)');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }

    function drawGrid() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const horizon = h * 0.68;
      const sp = Math.max(42, Math.min(78, w / 18));
      ctx!.save();
      ctx!.globalAlpha = 0.12;
      ctx!.strokeStyle = 'rgba(20,184,212,0.55)';
      ctx!.lineWidth = 1;
      for (let y = horizon; y < h + sp; y += sp) {
        const p = (y - horizon) / Math.max(1, h - horizon);
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(w, y + p * 18); ctx!.stroke();
      }
      for (let x = -w; x <= w * 2; x += sp) {
        ctx!.beginPath(); ctx!.moveTo(w / 2, horizon); ctx!.lineTo(x, h); ctx!.stroke();
      }
      ctx!.globalAlpha = 0.06;
      ctx!.strokeStyle = 'rgba(124,92,255,0.7)';
      for (let y = 18; y < h; y += 82) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(w, y); ctx!.stroke();
      }
      ctx!.restore();
    }

    function drawParticle(p: Particle) {
      ctx!.save();
      ctx!.globalAlpha = p.alpha;
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rotation);
      if (p.type === 'key') {
        ctx!.fillStyle = 'rgba(255,255,255,0.26)';
        ctx!.strokeStyle = p.color;
        ctx!.lineWidth = 1;
        roundRect(ctx!, -p.size, -p.size * 0.7, p.size * 2, p.size * 1.4, 6);
        ctx!.fill(); ctx!.stroke();
        ctx!.fillStyle = p.color;
        ctx!.font = `700 ${Math.max(11, p.size * 0.72)}px Quicksand, sans-serif`;
        ctx!.textAlign = 'center';
        ctx!.textBaseline = 'middle';
        ctx!.fillText(p.symbol, 0, 1);
      } else if (p.type === 'bamboo') {
        ctx!.strokeStyle = 'rgba(40,168,107,0.18)';
        ctx!.lineWidth = 2;
        ctx!.beginPath(); ctx!.moveTo(0, -p.size); ctx!.lineTo(0, p.size); ctx!.stroke();
        for (let y = -p.size * 0.6; y <= p.size * 0.6; y += p.size * 0.45) {
          ctx!.beginPath(); ctx!.moveTo(-5, y); ctx!.lineTo(5, y - 2); ctx!.stroke();
        }
      } else if (p.type === 'panda') {
        ctx!.fillStyle = 'rgba(11,57,84,0.07)';
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size * 0.72, 0, Math.PI * 2);
        ctx!.arc(-p.size * 0.55, -p.size * 0.58, p.size * 0.34, 0, Math.PI * 2);
        ctx!.arc(p.size * 0.55, -p.size * 0.58, p.size * 0.34, 0, Math.PI * 2);
        ctx!.fill();
      } else {
        ctx!.fillStyle = p.color;
        ctx!.beginPath();
        ctx!.arc(0, 0, p.size * 0.16, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function loop() {
      if (!ctx || paused) { animFrame = null; return; }
      animFrame = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      drawGradient();
      drawGrid();
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.rotation += 0.0018;
        if (p.y < -40) { p.y = window.innerHeight + 40; p.x = Math.random() * window.innerWidth; }
        if (p.x < -40) p.x = window.innerWidth + 40;
        if (p.x > window.innerWidth + 40) p.x = -40;
        drawParticle(p);
      }
    }

    function start() {
      if (animFrame || paused) return;
      loop();
    }

    function stop() {
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    }

    function handleVisibility() {
      paused = document.hidden;
      if (paused) {
        stop();
      } else {
        start();
      }
    }

    function handleResize() {
      resize();
      particles = createParticles(getDensity());
    }

    resize();
    particles = createParticles(density ?? getDensity());
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    start();

    return () => {
      stop();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [animationsEnabled, density, reducedEffects]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
