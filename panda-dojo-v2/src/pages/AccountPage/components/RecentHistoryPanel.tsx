import { Link } from 'react-router';
import { Badge, Card } from '@/components/ui';
import { getLessonById } from '@/features/lessons/data/lessons';
import type { HistoryItem } from '@/features/gamification/types';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import styles from '../AccountPage.module.css';

interface Props {
  profile: LocalProfile;
}

function formatDate(value?: string): string {
  // O histórico já grava a data localizada em pt-BR (ex.: "02/06/2026");
  // exibimos como está para não reinterpretar o formato DD/MM/YYYY.
  return value && value.trim() ? value : '—';
}

function modeLabel(item: HistoryItem): string {
  if (!item.lessonId) return 'Treino livre';
  return getLessonById(item.lessonId)?.title ?? 'Treino';
}

export function RecentHistoryPanel({ profile }: Props) {
  const { recentHistory } = profile;

  return (
    <Card as="section" className={styles.panel} aria-labelledby="history-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Histórico</span>
        <h2 id="history-title" className={styles.panelTitle}>Treinos recentes</h2>
      </header>

      {recentHistory.length === 0 ? (
        <div className={styles.historyEmpty}>
          <p className={styles.emptyText}>
            <strong>Você ainda não tem treinos recentes.</strong>
            <span>Faça um treino na Type Arena para começar seu histórico.</span>
          </p>
          <Link className={styles.ctaSecondary} to="/arena">
            Ir para Arena
          </Link>
        </div>
      ) : (
        <ul className={styles.historyList}>
          {recentHistory.map((item, index) => (
            <li key={`${item.data ?? 'item'}-${index}`} className={styles.historyItem}>
              <div className={styles.historyHead}>
                <span className={styles.historyMeta}>
                  <strong>{formatDate(item.data)}</strong>
                  <span aria-hidden="true">·</span>
                  <em>{modeLabel(item)}</em>
                </span>
                {item.novoRecorde && <Badge variant="special">Recorde</Badge>}
              </div>
              <div className={styles.historyMetrics}>
                <span><small>PPM</small><strong>{item.ppm ?? '--'}</strong></span>
                <span><small>CPM</small><strong>{item.cpm ?? '--'}</strong></span>
                <span><small>Precisão</small><strong>{item.precisao ?? '--'}</strong></span>
                <span><small>Erros</small><strong>{item.erros ?? 0}</strong></span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
