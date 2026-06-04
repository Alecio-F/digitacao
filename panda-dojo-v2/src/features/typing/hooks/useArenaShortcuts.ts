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

function isBlockingDialogOpen(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

function isArenaTypingInput(target: EventTarget | null, insideArena: boolean): boolean {
  return (
    insideArena &&
    target instanceof HTMLInputElement &&
    target.getAttribute('aria-label') === 'Entrada de digitação'
  );
}

function isSystemModifierCombination(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey;
}

export function useArenaShortcuts(options: UseArenaShortcutsOptions): void {
  const optionsRef = useRef(options);
  const tabChordActiveRef = useRef(false);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    function isInsideArena(target: EventTarget | null): boolean {
      const root = optionsRef.current.arenaRootRef?.current;
      return Boolean(root && target instanceof Node && root.contains(target));
    }

    function resetChord() {
      tabChordActiveRef.current = false;
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

    function shouldIgnoreTarget(target: EventTarget | null, insideArena: boolean): boolean {
      return isEditableTarget(target) && !isArenaTypingInput(target, insideArena);
    }

    function getShortcutAction(event: KeyboardEvent): (() => void) | null {
      const current = optionsRef.current;
      const key = event.key.toLowerCase();

      if (key === 'r') return current.onRestart;
      if (key === 'p' && !current.isResultVisible) return current.onPauseToggle;
      if (event.key === 'Enter') return current.onNextAction;
      if (key === 'm') return current.onGoToMap;
      if (key === 'a') return current.onFocusArena;

      return null;
    }

    function runAction(event: KeyboardEvent, action: () => void) {
      event.preventDefault();
      event.stopPropagation();
      resetChord();
      action();
    }

    function handleKeyDown(event: KeyboardEvent) {
      const current = optionsRef.current;
      if (!current.enabled) return;
      if (isSystemModifierCombination(event)) return;

      const target = event.target;
      const insideArena = isInsideArena(target);
      if (shouldIgnoreTarget(target, insideArena) || isBlockingDialogOpen()) {
        resetChord();
        return;
      }

      if (event.key === 'Escape') {
        resetChord();
        return;
      }

      const activeArenaContext = hasActiveArenaContext(insideArena);
      const isAltShortcut = event.altKey && !event.shiftKey;

      if (isAltShortcut) {
        if (!activeArenaContext) return;

        const action = getShortcutAction(event);
        if (!action) return;

        runAction(event, action);
        return;
      }

      if (event.key === 'Tab') {
        if (event.shiftKey || event.altKey || !activeArenaContext) {
          resetChord();
          return;
        }

        tabChordActiveRef.current = true;
        event.preventDefault();
        return;
      }

      if (!tabChordActiveRef.current || event.repeat) return;

      const action = getShortcutAction(event);

      if (!action) {
        if (activeArenaContext) {
          event.preventDefault();
          event.stopPropagation();
          resetChord();
        }
        return;
      }

      runAction(event, action);
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Tab') resetChord();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') resetChord();
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', resetChord);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', resetChord);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}
