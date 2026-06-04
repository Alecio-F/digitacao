import { useNavigate } from 'react-router';
import { Badge, Button, Chip } from '@/components/ui';
import { selectPracticeText } from '@/repositories/trainingSelectionRepository';
import type { PracticeText } from '@/features/practiceTexts/types';
import styles from '../DojoMapPage.module.css';

interface PracticeTextCardProps {
  text: PracticeText;
}

const DIFFICULTY_VARIANT: Record<PracticeText['difficulty'], 'success' | 'warning' | 'danger'> = {
  Fácil: 'success',
  Médio: 'warning',
  Difícil: 'danger',
};

export function PracticeTextCard({ text }: PracticeTextCardProps) {
  const navigate = useNavigate();

  function handleStart() {
    selectPracticeText({ id: text.id, title: text.title, text: text.text });
    navigate('/arena');
  }

  return (
    <article className={styles.practiceTextCard}>
      <div className={styles.practiceTextTop}>
        <Chip variant="purple">{text.category}</Chip>
        <Badge variant={DIFFICULTY_VARIANT[text.difficulty]}>{text.difficulty}</Badge>
      </div>

      <h3>{text.title}</h3>
      <p>{text.description}</p>

      <div className={styles.practiceTextMeta}>
        <span>{text.estimatedMinutes} min</span>
        <span>{text.text.length} caracteres</span>
      </div>

      <div className={styles.practiceTextPreview}>
        {text.text}
      </div>

      <div className={styles.practiceTextActions}>
        <Button variant="primary" size="sm" onClick={handleStart}>
          Praticar texto
        </Button>
      </div>
    </article>
  );
}
