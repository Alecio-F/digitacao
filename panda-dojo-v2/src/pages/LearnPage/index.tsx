import { PageShell } from '@/components/layout/PageShell';
import { FingerMap } from './components/FingerMap';
import { LearnFinalCta } from './components/LearnFinalCta';
import { LearnHero } from './components/LearnHero';
import { LearningPathCards } from './components/LearningPathCards';
import { LessonModuleCard } from './components/LessonModuleCard';
import { MasterTipPanel } from './components/MasterTipPanel';
import { PostureChecklist } from './components/PostureChecklist';
import styles from './LearnPage.module.css';

const BENEFITS = [
  { title: 'Velocidade', text: 'Conclua tarefas em menos tempo.' },
  { title: 'Precisão', text: 'Reduza erros e retrabalho.' },
  { title: 'Foco', text: 'Digite sem olhar toda hora para o teclado.' },
  { title: 'Conforto', text: 'Treine melhor sem forçar o corpo.' },
];

export function LearnPage() {
  return (
    <PageShell title="Aprenda" className={styles.learnPage}>
      <div className={styles.container}>
        <LearnHero />
        <LearningPathCards />

        <section id="fundamentos" className={styles.learningLayout} aria-label="Módulos de fundamentos">
          <div className={styles.modulesColumn}>
            <LessonModuleCard
              id="modulo-01"
              tag="Módulo 01 · Fundamento"
              title="Por que subir de nível na digitação?"
              text="Digitar bem não é apenas ser rápido. É combinar velocidade, precisão e conforto para usar o computador com mais controle em estudos, trabalho, programação, jogos e tarefas do dia a dia."
              benefits={BENEFITS}
            />

            <LessonModuleCard
              id="modulo-02"
              tag="Módulo 02 · Postura"
              title="Postura de jogador do dojo."
              text="Antes de buscar velocidade, configure sua posição. Uma boa postura ajuda a manter ritmo, evitar tensão e treinar por mais tempo com conforto."
            >
              <PostureChecklist />
            </LessonModuleCard>

            <LessonModuleCard
              id="modulo-03"
              tag="Módulo 03 · Teclas base"
              title="Posição inicial dos dedos."
              text="A base da digitação é voltar sempre para as teclas guia. Elas funcionam como o ponto de respawn dos seus dedos durante o treino."
            >
              <FingerMap />
            </LessonModuleCard>
          </div>

          <MasterTipPanel />
        </section>

        <LearnFinalCta />
      </div>
    </PageShell>
  );
}
