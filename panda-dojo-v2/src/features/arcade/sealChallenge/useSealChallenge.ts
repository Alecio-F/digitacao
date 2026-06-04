import { useCallback, useState } from 'react';
import { syncArcadeScoreToSupabase } from '@/features/backend-sync/syncLocalProgressService';
import {
  getSealBestScore,
  saveSealBestScore,
} from '@/repositories/arcadeScoreRepository';

const SEAL_WORDS = ['foco', 'calma', 'ritmo', 'tecla', 'panda', 'dojo', 'arena', 'precisão', 'treino'];
const SEQUENCE_SIZE = 5;
const TOTAL_SEQUENCES = 3;

type SealPhase = 'idle' | 'playing' | 'finished';

interface SealState {
  phase: SealPhase;
  sequence: string[];
  wordIndex: number;
  sequenceIndex: number;
  combo: number;
  score: number;
  best: number;
  status: { text: string; tone: 'neutral' | 'success' | 'danger' };
  currentInput: string;
}

function buildSequence(): string[] {
  return [...SEAL_WORDS].sort(() => Math.random() - 0.5).slice(0, SEQUENCE_SIZE);
}

function getBestScore(): number {
  return getSealBestScore();
}

export function useSealChallenge() {
  const [state, setState] = useState<SealState>({
    phase: 'idle',
    sequence: SEAL_WORDS.slice(0, SEQUENCE_SIZE),
    wordIndex: 0,
    sequenceIndex: 1,
    combo: 0,
    score: 0,
    best: getBestScore(),
    status: { text: 'Clique em Jogar para iniciar.', tone: 'neutral' },
    currentInput: '',
  });

  const start = useCallback(() => {
    const sequence = buildSequence();
    setState({
      phase: 'playing',
      sequence,
      wordIndex: 0,
      sequenceIndex: 1,
      combo: 0,
      score: 0,
      best: getBestScore(),
      status: { text: `Sequência 1/${TOTAL_SEQUENCES}. Ative todos os selos.`, tone: 'neutral' },
      currentInput: '',
    });
  }, []);

  const handleInput = useCallback((value: string) => {
    setState((prev) => {
      if (prev.phase !== 'playing') return prev;

      const currentWord = prev.sequence[prev.wordIndex];
      const trimmed = value.trim().toLowerCase();

      if (!currentWord.startsWith(trimmed)) {
        return {
          ...prev,
          combo: 0,
          currentInput: value,
          status: { text: 'Erro quebrou o selo. Corrija e continue.', tone: 'danger' },
        };
      }

      if (trimmed !== currentWord) {
        return { ...prev, currentInput: value };
      }

      // Word completed
      const newCombo = prev.combo + 1;
      const newScore = prev.score + 100 + newCombo * 15;
      const newWordIndex = prev.wordIndex + 1;

      if (newWordIndex >= prev.sequence.length) {
        const newSeqIndex = prev.sequenceIndex + 1;

        if (newSeqIndex > TOTAL_SEQUENCES) {
          // Finished!
          const best = getBestScore();
          const newBest = newScore > best;
          if (newBest) {
            saveSealBestScore(newScore);
            void syncArcadeScoreToSupabase('seal', newScore);
          }

          return {
            ...prev,
            phase: 'finished',
            score: newScore,
            combo: newCombo,
            wordIndex: newWordIndex,
            best: newBest ? newScore : best,
            status: {
              text: newBest
                ? `Novo recorde dos Selos: ${newScore} pontos.`
                : `Desafio concluído: ${newScore} pontos.`,
              tone: 'success',
            },
            currentInput: '',
          };
        }

        // Start next sequence
        const newSequence = buildSequence();
        return {
          ...prev,
          sequence: newSequence,
          sequenceIndex: newSeqIndex,
          wordIndex: 0,
          combo: newCombo,
          score: newScore,
          currentInput: '',
          status: { text: `Sequência ${newSeqIndex}/${TOTAL_SEQUENCES}. Ative todos os selos.`, tone: 'neutral' },
        };
      }

      return {
        ...prev,
        wordIndex: newWordIndex,
        combo: newCombo,
        score: newScore,
        currentInput: '',
        status: { text: 'Selo ativado. Próxima palavra.', tone: 'success' },
      };
    });
  }, []);

  return { state, start, handleInput };
}
