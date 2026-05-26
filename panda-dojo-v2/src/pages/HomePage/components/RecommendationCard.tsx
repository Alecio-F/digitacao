import { Button } from '@/components/ui';
import type { TrainingRecommendation } from '@/features/recommendations/types';
import { useNavigate } from 'react-router';
import styles from './Panels.module.css';

interface Props {
  recommendation: TrainingRecommendation;
}

export function RecommendationCard({ recommendation: rec }: Props) {
  const navigate = useNavigate();

  return (
    <section className={styles.panel} aria-label="Recomendação de treino">
      <h2 className={styles.panelTitle}>Próximo treino recomendado</h2>
      <article className={styles.recCard}>
        <strong className={styles.recTitle}>{rec.title}</strong>
        <p className={styles.recMessage}>{rec.message}</p>
        {rec.targetPage && (
          <Button variant="primary" size="sm" onClick={() => navigate(rec.targetPage!)}>
            Abrir treino
          </Button>
        )}
      </article>
    </section>
  );
}
