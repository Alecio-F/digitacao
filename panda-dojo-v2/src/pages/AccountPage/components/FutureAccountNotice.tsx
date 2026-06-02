import { Card } from '@/components/ui';
import styles from '../AccountPage.module.css';

const FUTURE_FEATURES = [
  'Login real',
  'Progresso em nuvem',
  'Ranking global',
  'Perfil público',
  'Conquistas sincronizadas',
];

export function FutureAccountNotice() {
  return (
    <Card as="section" className={styles.noticePanel} aria-labelledby="future-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Em breve</span>
        <h2 id="future-title" className={styles.panelTitle}>Conta online em breve</h2>
      </header>

      <p className={styles.noticeText}>
        No momento, seu progresso fica salvo apenas neste navegador. Em uma versão futura, você
        poderá criar conta, sincronizar progresso, participar de ranking global e acessar seus
        dados em outros dispositivos.
      </p>

      <ul className={styles.futureList}>
        {FUTURE_FEATURES.map((feature) => (
          <li key={feature}>
            <span className={styles.futureDot} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}
