import { useNavigate } from 'react-router';
import { Button, Chip } from '@/components/ui';
import { selectRandomWords } from '@/repositories/trainingSelectionRepository';
import styles from '../DojoMapPage.module.css';

export function RandomWordsCard() {
  const navigate = useNavigate();

  function handleStart() {
    selectRandomWords();
    navigate('/arena');
  }

  return (
    <article className={styles.randomWordsCard}>
      <div className={styles.randomWordsTop}>
        <Chip variant="cyan" icon={<span className="material-symbols-outlined">shuffle</span>}>
          Palavras Aleatórias
        </Chip>
      </div>

      <h3>Palavras Aleatórias</h3>
      <p>
        Treine palavras soltas com grande variedade, ideal para aquecer ou ganhar velocidade.
      </p>

      <div className={styles.randomWordsActions}>
        <Button variant="primary" size="sm" onClick={handleStart}>
          Treinar palavras
        </Button>
      </div>
    </article>
  );
}
