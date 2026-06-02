import { Card } from '@/components/ui';
import styles from '../LearnPage.module.css';

const PATH_ITEMS = [
  {
    step: '01',
    icon: 'flag',
    title: 'Entenda o objetivo',
    text: 'Veja por que digitar melhor aumenta velocidade, controle e produtividade.',
  },
  {
    step: '02',
    icon: 'self_improvement',
    title: 'Ajuste a postura',
    text: 'Prepare corpo, pulso e visão para treinar sem desconforto.',
  },
  {
    step: '03',
    icon: 'keyboard',
    title: 'Domine as bases',
    text: 'Aprenda ASDF e JKLÇ como ponto de retorno dos dedos.',
  },
];

export function LearningPathCards() {
  return (
    <section className={styles.section} aria-labelledby="learning-path-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Caminho rápido</span>
        <h2 id="learning-path-title">Rota inicial do aprendiz</h2>
      </div>
      <div className={styles.learningPathGrid}>
        {PATH_ITEMS.map((item) => (
          <Card key={item.step} as="article" variant="interactive" className={styles.pathCard}>
            <div className={styles.pathTop}>
              <span className={styles.pathStep}>{item.step}</span>
              <span className="material-symbols-outlined" aria-hidden="true">
                {item.icon}
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
