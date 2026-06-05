import { Card } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import styles from '../AccountPage.module.css';

const SYNC_FEATURES = [
  { label: 'Login ativo', active: true },
  { label: 'Progresso em nuvem', active: true },
  { label: 'Restauração entre dispositivos', active: true },
  { label: 'Histórico sincronizado', active: true },
  { label: 'Ranking online em breve', active: false },
  { label: 'Perfil público em breve', active: false },
];

export function FutureAccountNotice() {
  const { isAuthenticated, isSupabaseEnabled } = useAuth();
  const isSyncedAccount = isAuthenticated && isSupabaseEnabled;

  return (
    <Card as="section" className={styles.noticePanel} aria-labelledby="future-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Conta online</span>
        <h2 id="future-title" className={styles.panelTitle}>
          {isSyncedAccount ? 'Conta sincronizada' : 'Entre para sincronizar'}
        </h2>
      </header>

      <p className={styles.noticeText}>
        {isSyncedAccount
          ? 'Seu progresso já pode ser salvo na nuvem e restaurado em outros dispositivos.'
          : 'Crie uma conta para salvar seu progresso na nuvem e recuperar seus dados em outros dispositivos.'}
      </p>

      <ul className={styles.futureList}>
        {SYNC_FEATURES.map((feature) => (
          <li key={feature.label}>
            <span
              className={feature.active ? styles.futureDot : styles.futureDotMuted}
              aria-hidden="true"
            />
            {feature.label}
          </li>
        ))}
      </ul>
    </Card>
  );
}
