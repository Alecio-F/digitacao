import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettingsContext } from '@/app/settingsContext';
import { Button } from '@/components/ui';
import { KEYS } from '@/constants';
import { createAudioManager } from '@/features/arcade/pandaKeys/audio';
import { createInputManager } from '@/features/arcade/pandaKeys/input';
import { createGameLoop } from '@/features/arcade/pandaKeys/loop';
import { getRenderScale, viewHeight, viewWidth } from '@/features/arcade/pandaKeys/renderer';
import {
  GAME_STAGES,
  KEYBOARD_ROWS,
  createGameState,
  getSelectedStage,
  keyLabel,
  pauseGame,
  resetRun,
  resumeGame,
  setStage,
  startCountdown,
} from '@/features/arcade/pandaKeys/state';
import type { GameState } from '@/features/arcade/pandaKeys/types';
import { getStorage, setStorage } from '@/services/storage/storageService';
import styles from './PandaKeysGame.module.css';

interface Hud {
  score: number;
  combo: number;
  maxCombo: number;
  lives: number;
  level: number;
  best: number;
}

type PhaseUI = 'idle' | 'playing' | 'paused' | 'over' | 'countdown';

export function PandaKeysGame() {
  const { settings } = useSettingsContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keyCatcherRef = useRef<HTMLInputElement>(null);
  const touchControlsRef = useRef<HTMLDivElement>(null);
  const floatingLayerRef = useRef<HTMLDivElement>(null);
  const gameStateRef = useRef<GameState>(createGameState());
  const loopRef = useRef<ReturnType<typeof createGameLoop> | null>(null);
  const inputRef = useRef<{ focus: () => void } | null>(null);
  const audioRef = useRef<ReturnType<typeof createAudioManager> | null>(null);

  const [hud, setHud] = useState<Hud>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    level: 1,
    best: 0,
  });
  const [phase, setPhase] = useState<PhaseUI>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [stageId, setStageId] = useState(GAME_STAGES[0].id);
  const [description, setDescription] = useState(GAME_STAGES[0].description);

  const updateHud = useCallback(() => {
    const s = gameStateRef.current;
    setHud((prev) => {
      if (
        prev.score === s.score &&
        prev.combo === s.combo &&
        prev.maxCombo === s.maxCombo &&
        prev.lives === s.lives &&
        prev.level === s.level
      ) return prev;
      return {
        score: s.score,
        combo: s.combo,
        maxCombo: s.maxCombo,
        lives: s.lives,
        level: s.level,
        best: prev.best,
      };
    });
  }, []);

  function showFloating(text: string, x: number, y: number) {
    const canvas = canvasRef.current;
    const layer = floatingLayerRef.current;
    if (!canvas || !layer) return;
    const el = document.createElement('span');
    el.className = 'float-score';
    el.textContent = text;
    el.style.left = `${(x / viewWidth(canvas)) * 100}%`;
    el.style.top = `${(y / viewHeight(canvas)) * 100}%`;
    layer.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
    // Fallback de remoção: com prefers-reduced-motion a animação pode não
    // disparar 'animationend', evitando acúmulo de nós no DOM.
    window.setTimeout(() => el.remove(), 1000);
  }

  function renderTouchControls() {
    const touchControls = touchControlsRef.current;
    if (!touchControls) return;
    const state = gameStateRef.current;
    const stage = getSelectedStage(state);
    touchControls.replaceChildren();

    if (stage.layout === 'lanes') {
      for (const key of stage.keys) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset['key'] = key;
        btn.setAttribute('aria-label', `Tecla ${keyLabel(key)}`);
        btn.textContent = keyLabel(key);
        touchControls.appendChild(btn);
      }
      return;
    }

    for (const row of KEYBOARD_ROWS) {
      const rowEl = document.createElement('div');
      rowEl.style.display = 'flex';
      rowEl.style.gap = '4px';
      rowEl.style.justifyContent = 'center';
      for (const key of row) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset['key'] = key;
        btn.setAttribute('aria-label', `Tecla ${keyLabel(key)}`);
        btn.textContent = keyLabel(key);
        if (!stage.keys.includes(key)) btn.disabled = true;
        rowEl.appendChild(btn);
      }
      touchControls.appendChild(rowEl);
    }
  }

  // Boot the canvas + game engine once
  useEffect(() => {
    const canvas = canvasRef.current;
    const keyCatcher = keyCatcherRef.current;
    const touchControls = touchControlsRef.current;
    if (!canvas || !keyCatcher || !touchControls) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bestScore = Number(getStorage<string>(KEYS.gameBestScore, '0')) || 0;
    setHud((prev) => ({ ...prev, best: bestScore }));

    const audio = createAudioManager(settings.soundsEnabled);
    audioRef.current = audio;
    const state = gameStateRef.current;

    function resize() {
      const c = canvasRef.current;
      if (!c || !ctx) return;
      const rect = c.getBoundingClientRect();
      const scale = getRenderScale();
      // Backing store em pixels de dispositivo; o contexto é escalado para que
      // a lógica do jogo continue em pixels lógicos (CSS) — canvas nítido em HiDPI.
      c.width = Math.round(rect.width * scale);
      c.height = Math.round(rect.height * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      loopRef.current?.renderOnce();
    }

    const loop = createGameLoop({
      state,
      canvas,
      ctx,
      audio,
      onHudChange: updateHud,
      onCountdown: (val) => setCountdown(val),
      onGameOver() {
        loop.stop();
        const currentBest = Number(getStorage<string>(KEYS.gameBestScore, '0')) || 0;
        if (state.score > currentBest) {
          setStorage(KEYS.gameBestScore, String(state.score));
          setHud((prev) => ({ ...prev, best: state.score }));
        }
        setPhase('over');
        updateHud();
      },
      onMiss(tile, result) {
        showFloating(`-${result.penalty} MISS`, tile.x + tile.width / 2, canvas.height * 0.74);
      },
    });
    loopRef.current = loop;

    const input = createInputManager({
      state,
      canvas,
      keyCatcher,
      touchControls,
      audio,
      onResult(result) {
        showFloating(result.text, result.x, result.y);
        updateHud();
      },
      onVirtualPress() {},
    });
    inputRef.current = input;

    window.addEventListener('resize', resize);
    resize();
    renderTouchControls();
    loop.renderOnce();

    return () => {
      loop.stop();
      window.removeEventListener('resize', resize);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mantém o áudio em sincronia com a preferência de sons do SettingsDrawer.
  useEffect(() => {
    audioRef.current?.setEnabled(settings.soundsEnabled);
  }, [settings.soundsEnabled]);

  function beginRun() {
    const state = gameStateRef.current;
    resetRun(state);
    startCountdown(state);
    setPhase('countdown');
    updateHud();
    loopRef.current?.start();
    inputRef.current?.focus();
  }

  function togglePause() {
    const state = gameStateRef.current;
    if (state.status === 'PLAYING') {
      pauseGame(state);
      loopRef.current?.stop();
      setPhase('paused');
      loopRef.current?.renderOnce();
    } else if (state.status === 'PAUSED') {
      resumeGame(state);
      setPhase('playing');
      loopRef.current?.start();
      inputRef.current?.focus();
    }
  }

  function handleStageChange(id: string) {
    const state = gameStateRef.current;
    if (state.status === 'PLAYING' || state.status === 'COUNTDOWN') return;
    setStage(state, id);
    setStageId(id);
    setDescription(GAME_STAGES.find((s) => s.id === id)?.description ?? '');
    setPhase('idle');
    updateHud();
    renderTouchControls();
    loopRef.current?.renderOnce();
  }

  const stage = GAME_STAGES.find((s) => s.id === stageId) ?? GAME_STAGES[0];

  const showStatus = phase === 'idle' || phase === 'paused' || phase === 'over';

  return (
    <div className={styles.shell}>
      <div className={styles.topbar}>
        <div className={styles.titleBlock}>
          <h2 className={styles.cardTitle}>Panda Keys</h2>
          <p className={styles.cardDesc}>{description}</p>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" size="sm" onClick={beginRun}
            disabled={phase === 'playing' || phase === 'countdown'}>
            Iniciar
          </Button>
          <Button variant="secondary" size="sm" onClick={togglePause}
            disabled={phase === 'idle' || phase === 'over'}>
            {phase === 'paused' ? 'Continuar' : 'Pausar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => {
            loopRef.current?.stop();
            resetRun(gameStateRef.current);
            handleStageChange(stageId);
          }}>
            Reiniciar
          </Button>
        </div>
      </div>

      <div className={styles.stageGrid}>
        {GAME_STAGES.map((s) => (
          <button
            key={s.id}
            className={styles.stageBtn}
            aria-pressed={s.id === stageId ? 'true' : 'false'}
            onClick={() => handleStageChange(s.id)}
          >
            {s.shortTitle}
          </button>
        ))}
      </div>

      <div className={styles.frame}>
        <canvas ref={canvasRef} className={styles.canvas} aria-label="Pista do Panda Keys" />
        <input ref={keyCatcherRef} className={styles.keyCatcher} readOnly aria-hidden="true" />

        <div className={styles.hud} aria-hidden="true">
          {[
            { label: 'Pontos', value: hud.score },
            { label: 'Combo', value: `${hud.combo}x` },
            { label: 'Vidas', value: hud.lives },
            { label: 'Nível', value: hud.level },
            { label: 'Recorde', value: hud.best },
          ].map(({ label, value }) => (
            <div key={label} className={styles.hudItem}>
              <span className={styles.hudValue}>{value}</span>
              <span className={styles.hudLabel}>{label}</span>
            </div>
          ))}
        </div>

        {countdown !== null && phase === 'countdown' && (
          <div className={styles.countdown}>{countdown}</div>
        )}

        {showStatus && (
          <div className={styles.statusPanel}>
            <div className={styles.statusCard}>
              <h3 className={styles.statusTitle}>
                {phase === 'over' ? 'Fim de jogo' : phase === 'paused' ? 'Pausado' : stage.title}
              </h3>
              <p className={styles.statusText}>
                {phase === 'over'
                  ? `Pontuação final: ${hud.score}. Maior combo: ${hud.maxCombo}.`
                  : phase === 'paused'
                  ? 'Clique em Continuar para voltar ao ritmo.'
                  : `${stage.description} As três primeiras perdas de tile não tiram vida.`}
              </p>
              {(phase === 'idle' || phase === 'over') && (
                <Button variant="primary" onClick={beginRun}>Jogar</Button>
              )}
            </div>
          </div>
        )}

        <div ref={floatingLayerRef} className={styles.floatingLayer} />
      </div>

      <div ref={touchControlsRef} className={styles.touchControls} aria-label="Controles de toque" />
    </div>
  );
}
