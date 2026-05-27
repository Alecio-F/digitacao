import { Button } from '@/components/ui';
import { useNavigate } from 'react-router';
import styles from './LearnCta.module.css';

export function LearnCta() {
  const navigate = useNavigate();

  return (
    <article className={`dojo-section ${styles.cta}`}>
      <span className={styles.eyebrow}>Missão concluída</span>
      <h2 className={styles.heading}>Pronto para testar o que aprendeu?</h2>
      <p className={styles.sub}>
        Agora que você conhece os fundamentos, entre na arena e transforme postura, ritmo e precisão em resultado real.
      </p>
      <div className={styles.actions}>
        <Button variant="primary" size="lg" onClick={() => navigate('/arena')}>
          Ir para Arena
        </Button>
        <Button variant="secondary" onClick={() => navigate('/mapa')}>
          Abrir Mapa do Dojo
        </Button>
      </div>
    </article>
  );
}
