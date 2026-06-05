import { useEffect, useRef, type RefObject } from 'react';

interface UseArenaShortcutsOptions {
  enabled: boolean;
  isArenaFocused: boolean;
  isResultVisible: boolean;
  arenaRootRef?: RefObject<HTMLElement | null>;
  onRestart: () => void;
  onPauseToggle: () => void;
  onNextAction: () => void;
  onGoToMap: () => void;
  onFocusArena: () => void;
}

const TAB_CHORD_TIMEOUT_MS = 1200;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null ||
    target.closest('form') !== null
  );
}

function isArenaShortcutTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('[data-arena-root], [data-typing-area], [data-type-arena]') !== null
  );
}

function isBlockingDialogOpen(): boolean {
  return (
    document.querySelector(
      '[data-settings-drawer="open"], [role="dialog"][aria-modal="true"]:not([aria-hidden="true"])',
    ) !== null
  );
}

function isSystemModifierCombination(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

function isArenaRoute(): boolean {
  return window.location.pathname.includes('/arena');
}

export function useArenaShortcuts(options: UseArenaShortcutsOptions): void {
  const optionsRef = useRef(options);
  const altDownRef = useRef(false);
  const tabChordActiveRef = useRef(false);
  const tabChordStartedAtRef = useRef<number | null>(null);
  const tabChordTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    function isInsideArena(target: EventTarget | null): boolean {
      const root = optionsRef.current.arenaRootRef?.current;
      return Boolean(root && target instanceof Node && root.contains(target));
    }

    function clearTabChordTimeout() {
      if (tabChordTimeoutRef.current === null) return;
      window.clearTimeout(tabChordTimeoutRef.current);
      tabChordTimeoutRef.current = null;
    }

    function resetTabChord() {
      clearTabChordTimeout();
      tabChordActiveRef.current = false;
      tabChordStartedAtRef.current = null;
    }

    function resetShortcuts() {
      resetTabChord();
      altDownRef.current = false;
    }

    function hasActiveArenaContext(insideArena: boolean): boolean {
      const activeElementInsideArena = isInsideArena(document.activeElement);
      const current = optionsRef.current;

      return (
        current.isArenaFocused ||
        current.isResultVisible ||
        insideArena ||
        activeElementInsideArena
      );
    }

    function shouldIgnoreShortcut(target: EventTarget | null, insideArena: boolean): boolean {
      return isEditableTarget(target) && !insideArena && !isArenaShortcutTarget(target);
    }

    function getShortcutAction(event: KeyboardEvent): (() => void) | null {
      const current = optionsRef.current;

      if (event.code === 'KeyR') return current.onRestart;
      if (event.code === 'KeyP' && !current.isResultVisible) return current.onPauseToggle;
      if (event.code === 'Enter') return current.onNextAction;
      if (event.code === 'KeyM') return current.onGoToMap;
      if (event.code === 'KeyA') return current.onFocusArena;

      return null;
    }

    function runAction(event: KeyboardEvent, action: () => void) {
      event.preventDefault();
      event.stopPropagation();
      resetTabChord();
      action();
    }

    function startTabChord(event: KeyboardEvent) {
      event.preventDefault();
      event.stopPropagation();

      clearTabChordTimeout();
      tabChordActiveRef.current = true;
      tabChordStartedAtRef.current = Date.now();
      tabChordTimeoutRef.current = window.setTimeout(resetTabChord, TAB_CHORD_TIMEOUT_MS);
    }

    function handleKeyDown(event: KeyboardEvent) {
      const current = optionsRef.current;
      if (!current.enabled) return;

      const target = event.target;
      const insideArena = isInsideArena(target);

      if (shouldIgnoreShortcut(target, insideArena) || isBlockingDialogOpen()) {
        resetShortcuts();
        return;
      }

      if (event.code === 'Escape') {
        resetShortcuts();
        return;
      }

      if (event.code === 'AltLeft' || event.code === 'AltRight') {
        altDownRef.current = true;
        if (isArenaRoute()) {
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      if (isSystemModifierCombination(event)) return;

      const activeArenaContext = hasActiveArenaContext(insideArena);
      const isAltShortcut = (event.altKey || altDownRef.current) && !event.shiftKey;

      if (isAltShortcut) {
        if (!isArenaRoute()) return;

        const action = getShortcutAction(event);
        if (!action) return;

        runAction(event, action);
        return;
      }

      if (event.code === 'Tab') {
        if (event.shiftKey || event.altKey || !activeArenaContext) {
          resetTabChord();
          return;
        }

        startTabChord(event);
        return;
      }

      if (!tabChordActiveRef.current || event.repeat) return;

      event.preventDefault();
      event.stopPropagation();

      const action = getShortcutAction(event);
      if (!action) {
        resetTabChord();
        return;
      }

      runAction(event, action);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.code === 'AltLeft' || event.code === 'AltRight') {
        altDownRef.current = false;
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') resetShortcuts();
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', resetShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', resetShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resetShortcuts();
    };
  }, []);
}
