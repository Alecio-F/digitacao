import { Button, Chip, Panel } from '@/components/ui';
import type { Lesson } from '@/features/lessons/types';
import styles from '../DojoMapPage.module.css';

interface Props {
  lesson: Lesson | null;
  onStart: (lesson: Lesson) => void;
  onArena: () => void;
}

export function RecommendedLessonPanel({ lesson, onStart, onArena }: Props) {
  if (!lesson) {
    return (
      <Panel as="section" title="Fase recomendada" className={styles.recommendedLessonPanel}>
        <p className={styles.panelText}>
          Todas as fases principais foram concluídas. Continue treinando na Arena.
        </p>
        <Button variant="primary" size="sm" onClick={onArena}>
          Ir para Arena
        </Button>
      </Panel>
    );
  }

  return (
    <Panel
      as="section"
      title="Fase recomendada"
      subtitle="Próximo passo com base no progresso local."
      className={styles.recommendedLessonPanel}
    >
      <article className={styles.recommendedCard}>
        <Chip variant="yellow">Recomendado</Chip>
        <strong>{lesson.title}</strong>
        <p>{lesson.description}</p>
        <div className={styles.recommendedMeta}>
          <Chip>{lesson.difficulty}</Chip>
          <Chip variant="purple">+{lesson.xpReward} XP</Chip>
        </div>
        <Button variant="primary" size="sm" onClick={() => onStart(lesson)}>
          Iniciar fase
        </Button>
      </article>
    </Panel>
  );
}
