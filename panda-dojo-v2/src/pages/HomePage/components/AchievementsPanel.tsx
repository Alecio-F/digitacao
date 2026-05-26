import { Badge } from '@/components/ui';
import type { Achievement } from '@/features/gamification/types';
import styles from './Panels.module.css';

interface Props {
  achievements: Achievement[];
  mistakes: [string, number][];
}

export function AchievementsPanel({ achievements, mistakes }: Props) {
  return (
    <section className={styles.panel} aria-label="Conquistas e erros">
      <h2 className={styles.panelTitle}>Conquistas</h2>
      <div className={styles.chips}>
        {achievements.length === 0 ? (
          <Badge variant="muted">Primeira conquista bloqueada</Badge>
        ) : (
          achievements.slice(0, 4).map((a) => (
            <Badge key={a.id} variant="warning">{a.title}</Badge>
          ))
        )}
      </div>

      {mistakes.length > 0 && (
        <>
          <h3 className={styles.subTitle}>Teclas mais erradas</h3>
          <div className={styles.chips}>
            {mistakes.map(([key, qty]) => (
              <Badge key={key} variant="danger">{key || 'espaço'} ×{qty}</Badge>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
