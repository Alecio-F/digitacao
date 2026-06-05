import { Link } from 'react-router';
import type { RankingScope } from '@/features/ranking/rankingTypes';
import styles from '../RankingPage.module.css';

interface Props {
  isPreparedOnly: boolean;
  categoryTitle: string;
  scope: RankingScope;
  isLoading?: boolean;
  error?: string | null;
}

export function RankingEmptyState({ isPreparedOnly, categoryTitle, scope, isLoading = false, error = null }: Props) {
  const isOnline = scope === 'online';
  const title = isLoading
    ? 'Carregando o mural online...'
    : error
      ? 'O Dojo não conseguiu carregar este ranking agora.'
      : isPreparedOnly
        ? `${categoryTitle} está aquecendo no bastidor.`
        : isOnline
          ? 'O mural online ainda não tem resultados elegíveis.'
          : 'Nenhum mestre no mural ainda.';
  const text = isLoading
    ? 'O Mestre Panda está conferindo os resultados elegíveis no Supabase. Ele parece muito sério, o que é raro.'
    : error
      ? error
      : isPreparedOnly
        ? 'Esta categoria já tem espaço reservado no Hall da Fama, mas os dados completos entram na próxima etapa.'
        : isOnline
          ? 'Assim que houver treinos válidos sincronizados, o Hall da Fama mostra os melhores pandas por aqui.'
          : 'Faça um treino elegível na Type Arena para aparecer no Ranking do Dojo.';

  return (
    <section className={styles.emptyState} aria-labelledby="ranking-empty-title">
      <div className={styles.emptyMark} aria-hidden="true" />
      <span className={styles.eyebrow}>Estado do mural</span>
      <h2 id="ranking-empty-title">{title}</h2>
      <p>{text}</p>
      {!isLoading && (
        <Link className={styles.ctaPrimary} to="/arena">
          Ir para Type Arena
        </Link>
      )}
    </section>
  );
}
