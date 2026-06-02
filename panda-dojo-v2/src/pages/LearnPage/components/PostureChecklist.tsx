import { Badge } from '@/components/ui';
import styles from '../LearnPage.module.css';

const ITEMS = [
  'Costas retas e ombros relaxados.',
  'Pés apoiados no chão.',
  'Pulsos leves, sem pressionar demais o teclado.',
  'Tela em altura confortável para os olhos.',
];

export function PostureChecklist() {
  return (
    <div className={styles.postureChecklist}>
      <ul>
        {ITEMS.map((item) => (
          <li key={item}>
            <span className="material-symbols-outlined" aria-hidden="true">
              check_circle
            </span>
            {item}
          </li>
        ))}
      </ul>

      <aside className={styles.commonMistake}>
        <Badge variant="danger">Erro comum</Badge>
        <strong>Tentar digitar rápido com postura ruim.</strong>
        <p>Primeiro controle, depois velocidade.</p>
      </aside>
    </div>
  );
}
