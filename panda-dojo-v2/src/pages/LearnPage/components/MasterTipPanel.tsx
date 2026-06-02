import { Link } from 'react-router';
import { Badge, Panel } from '@/components/ui';
import styles from '../LearnPage.module.css';

const CHECKLIST = [
  'Entender objetivo',
  'Ajustar postura',
  'Memorizar teclas base',
  'Ir para prática',
];

export function MasterTipPanel() {
  return (
    <Panel as="aside" title="Dica do Mestre" className={styles.masterTipPanel}>
      <p className={styles.masterTipText}>
        Treine devagar primeiro. Precisão cria confiança. Velocidade vem como
        consequência quando os dedos começam a memorizar o caminho.
      </p>
      <div className={styles.masterChecklist}>
        {CHECKLIST.map((item, index) => (
          <div key={item} className={styles.masterChecklistItem}>
            <Badge variant={index < 3 ? 'success' : 'info'}>
              {index < 3 ? 'OK' : 'Next'}
            </Badge>
            <span>{item}</span>
          </div>
        ))}
      </div>
      <Link className={styles.secondaryLink} to="/mapa">
        Abrir Mapa
      </Link>
    </Panel>
  );
}
