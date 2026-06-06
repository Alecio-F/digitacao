import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';
import styles from './SmoothTypingCursor.module.css';

type SmoothTypingCursorVariant = 'block' | 'line';

interface SmoothTypingCursorProps {
  activeCharRef: RefObject<HTMLElement | null>;
  containerRef: RefObject<HTMLElement | null>;
  scrollRef: RefObject<HTMLElement | null>;
  variant: SmoothTypingCursorVariant;
  visible: boolean;
  updateKey: string;
}

interface CursorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
}

function isClose(a: number, b: number) {
  return Math.abs(a - b) < 0.5;
}

function getVisualBox(position: CursorPosition, variant: SmoothTypingCursorVariant) {
  // A altura é baseada no tamanho REAL da fonte do caractere — e não na altura
  // cheia da linha/realce (line-height). Assim o cursor cobre o caractere de
  // forma proporcional e elegante, sem ficar gigante como o fundo de seleção.
  const fontSize = position.fontSize > 0 ? position.fontSize : position.height;

  if (variant === 'line') {
    // Panda Linha: underline real abaixo do caractere ou da âncora pós-extra.
    const height = 3;
    const width = Math.round(Math.max(12, Math.min(fontSize * 0.55, 24)));
    const x = position.x + position.width / 2 - width / 2;
    const y = position.y + position.height + 3;
    return {
      x,
      y,
      width,
      height,
    };
  }

  // Bloco/haste: acompanha a largura do caractere, com altura proporcional à
  // fonte (≈1.15x) e centralizada verticalmente — não ocupa a linha inteira.
  const height = Math.min(position.height, fontSize * 1.15);
  const y = position.y + (position.height - height) / 2;
  const width = 2;
  const hasteOffsetX = width + 2;
  return {
    x: position.x - hasteOffsetX,
    y,
    width,
    height,
  };
}

export function SmoothTypingCursor({
  activeCharRef,
  containerRef,
  scrollRef,
  variant,
  visible,
  updateKey,
}: SmoothTypingCursorProps) {
  const frameRef = useRef<number | null>(null);
  const [position, setPosition] = useState<CursorPosition | null>(null);

  const measure = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (!visible) {
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        setPosition(null);
      });
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;

      const activeChar = activeCharRef.current;
      const container = containerRef.current;
      if (!activeChar || !container) {
        setPosition(null);
        return;
      }

      const charRect = activeChar.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const measuredFontSize = Number.parseFloat(
        window.getComputedStyle(activeChar).fontSize,
      );
      const nextPosition: CursorPosition = {
        x: charRect.left - containerRect.left,
        y: charRect.top - containerRect.top,
        width: charRect.width,
        height: charRect.height,
        fontSize:
          Number.isFinite(measuredFontSize) && measuredFontSize > 0
            ? measuredFontSize
            : charRect.height,
      };

      const isValidPosition =
        charRect.width > 0 &&
        charRect.height > 0 &&
        containerRect.width > 0 &&
        Number.isFinite(nextPosition.x) &&
        Number.isFinite(nextPosition.y) &&
        Number.isFinite(nextPosition.width) &&
        Number.isFinite(nextPosition.height);

      if (!isValidPosition) {
        setPosition(null);
        return;
      }

      setPosition((previous) => {
        if (
          previous &&
          isClose(previous.x, nextPosition.x) &&
          isClose(previous.y, nextPosition.y) &&
          isClose(previous.width, nextPosition.width) &&
          isClose(previous.height, nextPosition.height)
        ) {
          return previous;
        }

        return nextPosition;
      });
    });
  }, [activeCharRef, containerRef, visible]);

  useLayoutEffect(() => {
    measure();

    if (!visible) {
      return () => {
        if (frameRef.current !== null) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      };
    }

    const scrollElement = scrollRef.current;
    const activeChar = activeCharRef.current;
    const container = containerRef.current;
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measure)
      : null;

    window.addEventListener('resize', measure);
    scrollElement?.addEventListener('scroll', measure, { passive: true });
    if (container) resizeObserver?.observe(container);
    if (activeChar) resizeObserver?.observe(activeChar);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      window.removeEventListener('resize', measure);
      scrollElement?.removeEventListener('scroll', measure);
      resizeObserver?.disconnect();
    };
  }, [activeCharRef, containerRef, measure, scrollRef, updateKey, variant, visible]);

  if (!visible || !position) return null;

  const visualBox = getVisualBox(position, variant);
  const className = [
    styles.cursor,
    variant === 'line' ? styles.line : styles.block,
  ]
    .filter(Boolean)
    .join(' ');
  const style: CSSProperties = {
    transform: `translate3d(${visualBox.x}px, ${visualBox.y}px, 0)`,
    width: `${visualBox.width}px`,
    height: `${visualBox.height}px`,
  };

  return <span className={className} style={style} aria-hidden="true" />;
}
