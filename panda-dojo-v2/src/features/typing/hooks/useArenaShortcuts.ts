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

function isTypingInEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();
  return (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable ||
    target.closest('[contenteditable="true"]') !== null
  );
}

function isBlockingDialogOpen(): boolean {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null;
}

function isNeutralDocumentTarget(target: EventTarget | null): boolean {
  return target === document.body || target === document.documentElement || target === window;
}

function isModifierCombination(event: KeyboardEvent): boolean {
  return event.ctrlKey || event.metaKey || event.altKey;
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

    function handleKeyDown(event: KeyboardEvent) {
      const current = optionsRef.current;
      if (!current.enabled) return;
      if (isModifierCombination(event)) return;

      const target = event.target;
      const insideArena = isInsideArena(target);
      const editableOutsideArena = isTypingInEditableElement(target) && !insideArena;
      if (editableOutsideArena || isBlockingDialogOpen()) {
        resetChord();
        return;
      }

      if (event.key === 'Tab') {
        const canStartChord =
          current.isArenaFocused ||
          current.isResultVisible ||
          insideArena ||
          isNeutralDocumentTarget(target);

        if (!canStartChord) return;

        tabChordActiveRef.current = true;

        if (current.isArenaFocused && !current.isResultVisible) {
          event.preventDefault();
        }
        return;
      }

      if (!tabChordActiveRef.current || event.repeat) return;

      const key = event.key.toLowerCase();
      const canUseArenaAction = current.isArenaFocused || current.isResultVisible || insideArena;
      const canUseGlobalFocus = key === 'a' && isNeutralDocumentTarget(target);
      if (!canUseArenaAction && !canUseGlobalFocus) return;

      let action: (() => void) | null = null;
      if (key === 'r') action = current.onRestart;
      else if (key === 'p' && !current.isResultVisible) action = current.onPauseToggle;
      else if (event.key === 'Enter' && current.isResultVisible) action = current.onNextAction;
      else if (key === 'm') action = current.onGoToMap;
      else if (key === 'a') action = current.onFocusArena;

      if (!action) {
        if (canUseArenaAction) {
          event.preventDefault();
          event.stopPropagation();
          resetChord();
        }
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      resetChord();
      action();
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'Tab') resetChord();
    }

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    window.addEventListener('blur', resetChord);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
      window.removeEventListener('blur', resetChord);
    };
  }, []);
}
