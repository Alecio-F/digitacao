import { Button, Chip } from '@/components/ui';
import type { Lesson } from '@/features/lessons/types';
import styles from '../DojoMapPage.module.css';

interface Props {
  recommendedLesson: Lesson | null;
  onStart: (lesson: Lesson) => void;
  onArena: () => void;
}

export function DojoMapHero({ recommendedLesson, onStart, onArena }: Props) {
  return (
    <section className={styles.dojoMapHero} aria-labelledby="map-title">
      <div>
        <span className={styles.eyebrow}>Mapa do Dojo</span>
        <h1 id="map-title">Escolha sua próxima fase de treino.</h1>
        <p>
          Avance por trilhas de precisão, velocidade e controle para evoluir sua digitação.
        </p>
        <div className={styles.heroActions}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => (recommendedLesson ? onStart(recommendedLesson) : onArena())}
          >
            Continuar fase recomendada
          </Button>
          <Button variant="ghost" size="lg" onClick={onArena}>
            Ir para Arena
          </Button>
        </div>
      </div>
      <aside className={styles.heroBadgePanel} aria-label="Resumo da trilha">
        <Chip variant="purple">8 fases</Chip>
        <strong>Trilha de domínio</strong>
        <span>{recommendedLesson?.title ?? 'Todas as fases principais concluídas'}</span>
      </aside>
    </section>
  );
}
