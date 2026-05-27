import { useNavigate } from 'react-router';
import { usePlayerProgress } from '@/features/gamification/hooks/usePlayerProgress';
import { useDailyMissions } from '@/features/missions/hooks/useDailyMissions';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { PageShell } from '@/components/layout/PageShell';
import { Chip } from '@/components/ui';
import { Badge } from '@/components/ui';
import { RankingPanel } from './components/RankingPanel';
import { RecommendationCard } from './components/RecommendationCard';
import styles from './HomePage.module.css';

const QUICK_CARDS = [
  { num: '01', title: 'Teste Rápido', desc: 'Entre direto em um treino cronometrado com estatísticas de desempenho.', to: '/arena', cta: 'Treinar agora' },
  { num: '02', title: 'Lições Guiadas', desc: 'Avance por fases visuais de postura, letras base, acentuação e frases.', to: '/mapa', cta: 'Abrir mapa' },
  { num: '03', title: 'Panda Keys', desc: 'Treine reflexo e precisão no minigame em ritmo de arcade.', to: '/arcade', cta: 'Jogar' },
];

const TRAILS = [
  { step: 1, title: 'Fundamentos', desc: 'Postura, linha base e familiaridade com o teclado.', chip: 'Desbloqueada', chipVariant: 'success' as const },
  { step: 2, title: 'Velocidade', desc: 'Ritmo constante, leitura antecipada e menos pausas.', chip: 'Treino leve', chipVariant: 'muted' as const },
  { step: 3, title: 'Precisão', desc: 'Controle de erros, acentos e palavras mais longas.', chip: 'Foco', chipVariant: 'special' as const },
  { step: 4, title: 'Pontuação e números', desc: 'Prática com sinais, números e alternância de mãos.', chip: 'Em preparo', chipVariant: 'muted' as const },
  { step: 5, title: 'Desafio avançado', desc: 'Textos longos, consistência e metas de alto PPM.', chip: 'Em preparo', chipVariant: 'muted' as const },
];

export function HomePage() {
  const profile = usePlayerProgress();
  const missions = useDailyMissions();
  const recommendations = useRecommendations();
  const navigate = useNavigate();
  const hasHistory = profile.history.length > 0;

  return (
    <PageShell title="Início">

      {/* ── Hero ── */}
      <section className={`dojo-section ${styles.heroSection}`}>
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <span className={styles.kicker}>Panda Dojo Arcade</span>
            <h1 className={styles.heroTitle}>Entre no Dojo da Digitação.</h1>
            <p className={styles.heroSub}>Treine velocidade, precisão e foco com desafios progressivos.</p>
            <div className={styles.heroCta}>
              <button className={styles.btnPrimary} onClick={() => navigate('/arena')}>Iniciar teste rápido</button>
              <button className={styles.btnSecondary} onClick={() => navigate('/arcade')}>Explorar minigames</button>
            </div>
          </div>

          <div className={styles.mentorCard} aria-label="Panda mentor do treino">
            <div className={styles.mentorPanel}>
              <strong>Mentor Panda</strong>
              <span>Comece pela linha base, mantenha o ritmo e evolua a cada rodada.</span>
            </div>
            <img src="/panda-banner.png" alt="Panda mentor segurando o treino de digitação" className={styles.mentorImg} />
            <div className={styles.keyboardRgb} aria-hidden="true">
              {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Acesso rápido ── */}
      <section className="dojo-section">
        <h2 className={styles.sectionTitle}>Acesso rápido</h2>
        <div className={styles.quickGrid}>
          {QUICK_CARDS.map((c) => (
            <article key={c.num} className={styles.quickCard}>
              <div>
                <span className={styles.quickNum}>{c.num}</span>
                <h3 className={styles.quickTitle}>{c.title}</h3>
                <p className={styles.quickDesc}>{c.desc}</p>
              </div>
              <button className={styles.quickBtn} onClick={() => navigate(c.to)}>{c.cta}</button>
            </article>
          ))}
        </div>
      </section>

      {/* ── Progresso + Ranking ── */}
      <section id="progresso" className="dojo-section">
        <div className={styles.progressLayout}>

          <article className={styles.progressPanel}>
            <span className={styles.kicker}>Seu Progresso</span>
            <h2 className={styles.panelTitle}>Evolução do Dojo</h2>

            <div className={styles.statsGrid}>
              {[
                { label: 'Melhor PPM', value: hasHistory ? String(profile.bestPpm) : '--' },
                { label: 'Última precisão', value: hasHistory ? profile.lastPrecision : '--' },
                { label: 'Nível', value: `Nível ${profile.level}` },
                { label: 'Sequência', value: `${profile.dailyStreak} dia(s)` },
              ].map(({ label, value }) => (
                <div key={label} className={styles.statBox}>
                  <span className={styles.statLabel}>{label}</span>
                  <strong className={styles.statValue}>{value}</strong>
                </div>
              ))}
            </div>

            <div className={styles.progressBar}>
              <span className={styles.progressFill} style={{ width: `${profile.progressPercent}%` }} />
            </div>
            <p className={styles.progressCaption}>
              {hasHistory
                ? `${profile.currentLevelXp}/${profile.requiredForLevel} XP para ${profile.nextTitle}`
                : 'Faça seu primeiro treino para começar sua jornada.'}
            </p>

            <div className={styles.chipRow}>
              <Chip variant="special">{profile.title}</Chip>
              <Chip variant="success">{profile.xp} XP</Chip>
            </div>

            {hasHistory && (
              <>
                <h3 className={styles.subHeading}>Últimos resultados</h3>
                <ul className={styles.historyList}>
                  {profile.history.slice(0, 5).map((h, i) => (
                    <li key={i} className={styles.historyItem}>
                      <strong>{h.ppm} PPM</strong>
                      <span>{h.precisao} de precisão</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {profile.lastMistakes.length > 0 && (
              <>
                <h3 className={styles.subHeading}>Teclas mais erradas</h3>
                <div className={styles.chipRow}>
                  {profile.lastMistakes.slice(0, 6).map(([k]) => (
                    <Chip key={k} variant="danger">{k || 'espaço'}</Chip>
                  ))}
                </div>
              </>
            )}

            {profile.achievementDetails.length > 0 && (
              <>
                <h3 className={styles.subHeading}>Conquistas</h3>
                <div className={styles.chipRow}>
                  {profile.achievementDetails.slice(0, 4).map((a) => (
                    <Badge key={a.id} variant="warning">{a.title}</Badge>
                  ))}
                </div>
              </>
            )}
          </article>

          <aside className={styles.rightCol}>
            <RankingPanel bestPpm={profile.bestPpm} />

            <div className={styles.sidePanel}>
              <span className={styles.kicker}>Missões de hoje</span>
              <div className={styles.missionGrid}>
                {missions.map((m) => (
                  <div key={m.id} className={`${styles.missionItem} ${m.completed ? styles.missionDone : ''}`}>
                    <strong>{m.title}</strong>
                    <span>{m.description}</span>
                  </div>
                ))}
              </div>
            </div>

            {recommendations[0] && <RecommendationCard recommendation={recommendations[0]} />}
          </aside>
        </div>
      </section>

      {/* ── Trilhas de treino ── */}
      <section className="dojo-section">
        <h2 className={styles.sectionTitle}>Trilhas de treino</h2>
        <div className={styles.trailGrid}>
          {TRAILS.map((t) => (
            <article key={t.step} className={`${styles.trailCard} ${t.step > 3 ? styles.trailLocked : ''}`}>
              <span className={styles.trailStep}>{t.step}</span>
              <h3 className={styles.trailTitle}>{t.title}</h3>
              <p className={styles.trailDesc}>{t.desc}</p>
              <Chip variant={t.chipVariant}>{t.chip}</Chip>
            </article>
          ))}
        </div>
      </section>

    </PageShell>
  );
}
