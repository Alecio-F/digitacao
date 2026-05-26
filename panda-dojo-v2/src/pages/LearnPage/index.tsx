import { PageShell } from '@/components/layout/PageShell';
import { FingerPositionMap } from './components/FingerPositionMap';
import { LearnCta } from './components/LearnCta';
import { MentorHero } from './components/MentorHero';
import { TipCarousel } from './components/TipCarousel';
import styles from './LearnPage.module.css';

const QUICK_PATH = [
  { step: '01', icon: 'bolt',            title: 'Entenda o objetivo', desc: 'Veja por que digitar melhor aumenta velocidade, controle e produtividade.' },
  { step: '02', icon: 'self_improvement',title: 'Ajuste a postura',   desc: 'Prepare corpo, pulso e visão para treinar sem desconforto.' },
  { step: '03', icon: 'keyboard',        title: 'Domine as bases',    desc: 'Aprenda ASDF e JKLÇ como ponto de retorno dos dedos.' },
];

const CHECKLIST = [
  { status: 'ok',   label: 'Entender o objetivo' },
  { status: 'ok',   label: 'Ajustar postura' },
  { status: 'ok',   label: 'Memorizar teclas base' },
  { status: 'next', label: 'Ir para prática' },
];

export function LearnPage() {
  return (
    <PageShell title="Aprenda">
      <MentorHero />

      {/* Quick path */}
      <section className={styles.quickPath} aria-label="Caminho rápido de aprendizado">
        {QUICK_PATH.map((item) => (
          <article key={item.step} className={styles.pathCard}>
            <span className={`material-symbols-outlined ${styles.pathIcon}`} aria-hidden="true">{item.icon}</span>
            <h2 className={styles.pathTitle}>{item.title}</h2>
            <p className={styles.pathDesc}>{item.desc}</p>
          </article>
        ))}
      </section>

      {/* Modules + sidebar */}
      <div className={styles.layout}>
        <div className={styles.modules}>

          <article id="modulo-01" className={styles.lessonCard}>
            <div className={styles.lessonTop}>
              <span className={styles.lessonTag}>Módulo 01 · Fundamento</span>
              <span className={styles.reward}>+15 XP</span>
            </div>
            <h2 className={styles.lessonTitle}>Por que subir de nível na digitação?</h2>
            <p className={styles.lessonText}>Digitar bem não é apenas ser rápido. É combinar velocidade, precisão e conforto para usar o computador com mais controle em estudos, trabalho, programação, jogos e tarefas do dia a dia.</p>
            <div className={styles.benefitGrid}>
              {[
                { title: 'Velocidade', desc: 'Conclua tarefas em menos tempo.' },
                { title: 'Precisão',  desc: 'Reduza erros e retrabalho.' },
                { title: 'Foco',      desc: 'Digite sem olhar toda hora para o teclado.' },
                { title: 'Conforto',  desc: 'Treine melhor sem forçar o corpo.' },
              ].map((b) => (
                <div key={b.title} className={styles.benefit}>
                  <strong>{b.title}</strong>
                  <span>{b.desc}</span>
                </div>
              ))}
            </div>
          </article>

          <article id="modulo-02" className={styles.lessonCard}>
            <div className={styles.lessonTop}>
              <span className={styles.lessonTag}>Módulo 02 · Postura</span>
              <span className={styles.reward}>+20 XP</span>
            </div>
            <h2 className={styles.lessonTitle}>Postura de jogador do dojo.</h2>
            <p className={styles.lessonText}>Antes de buscar velocidade, configure sua posição. Uma boa postura ajuda a manter ritmo, evitar tensão e treinar por mais tempo com conforto.</p>
            <ul className={styles.checklist}>
              {[
                'Mantenha as costas retas e os ombros relaxados.',
                'Apoie os pés no chão e evite ficar curvado sobre a mesa.',
                'Deixe os pulsos leves, sem pressionar demais o teclado.',
                'Mantenha a tela em uma altura confortável para os olhos.',
              ].map((item) => (
                <li key={item} className={styles.checkItem}>
                  <span className={styles.checkMark} aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <aside className={styles.warningPanel}>
              <h3>Erro comum</h3>
              <p>Tentar digitar rápido com postura ruim. Primeiro controle, depois velocidade.</p>
            </aside>
          </article>

          <article id="modulo-03" className={styles.lessonCard}>
            <div className={styles.lessonTop}>
              <span className={styles.lessonTag}>Módulo 03 · Teclas base</span>
              <span className={styles.reward}>+15 XP</span>
            </div>
            <h2 className={styles.lessonTitle}>Posição inicial dos dedos.</h2>
            <p className={styles.lessonText}>A base da digitação é voltar sempre para as teclas guia. Elas funcionam como o ponto de respawn dos seus dedos durante o treino.</p>
            <FingerPositionMap />
          </article>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.sidePanel}>
            <span className={styles.eyebrow}>Checklist do Panda</span>
            <h2 className={styles.sidePanelTitle}>Missão inicial</h2>
            {CHECKLIST.map((item) => (
              <div key={item.label} className={styles.objective}>
                <span className={`${styles.status} ${item.status === 'ok' ? styles.statusOk : styles.statusNext}`}>
                  {item.status.toUpperCase()}
                </span>
                {item.label}
              </div>
            ))}
          </section>

          <section className={styles.sidePanel}>
            <span className={styles.eyebrow}>Dicas do Mestre</span>
            <TipCarousel />
          </section>

          <section className={styles.sidePanel}>
            <span className={styles.eyebrow}>Próxima fase</span>
            <p className={styles.sidePanelText}>Depois desta página, vá para o Mapa e pratique letras base, acentuação, números e frases curtas.</p>
            <a href="/mapa" className={styles.mapLink}>Abrir Mapa</a>
          </section>
        </aside>
      </div>

      <LearnCta />
    </PageShell>
  );
}
