import { useState } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { Chip } from '@/components/ui';
import { PandaKeysGame } from './components/PandaKeysGame';
import { SealChallenge } from './components/SealChallenge';
import styles from './ArcadePage.module.css';

type SelectedGame = 'panda-keys' | 'seals' | null;

const MINIGAMES = [
  {
    id: 'panda-keys',
    title: 'Panda Keys',
    status: 'Principal',
    difficulty: 'Reflexo',
    description: 'Acerte as teclas quando os blocos chegarem à zona de impacto.',
    action: 'Jogar',
    enabled: true,
  },
  {
    id: 'seals',
    title: 'Selos do Teclado',
    status: 'Protótipo',
    difficulty: 'Precisão',
    description: 'Ative selos digitando sequências curtas com precisão.',
    action: 'Ver protótipo',
    enabled: true,
  },
  {
    id: 'rhythm',
    title: 'Ritmo das Teclas',
    status: 'Em breve',
    difficulty: 'Ritmo',
    description: 'Treine sequência e ritmo em desafios curtos.',
    action: 'Em breve',
    enabled: false,
  },
  {
    id: 'guardian',
    title: 'Desafio do Guardião',
    status: 'Em breve',
    difficulty: 'Misto',
    description: 'Um desafio final misturando velocidade e precisão.',
    action: 'Em breve',
    enabled: false,
  },
] as const;

export function ArcadePage() {
  const [selectedGame, setSelectedGame] = useState<SelectedGame>(null);

  const selectedTitle =
    selectedGame === 'panda-keys'
      ? 'Panda Keys'
      : selectedGame === 'seals'
      ? 'Selos do Teclado'
      : null;

  return (
    <PageShell title="Arcade do Panda" className={styles.arcadeShell}>
      <section className={`dojo-section ${styles.hero}`}>
        <span className={styles.eyebrow}>Arcade do Panda</span>
        <h1 className={styles.heading}>Escolha seu desafio</h1>
        <p className={styles.sub}>
          Minigames locais para treinar reflexo, precisão e sequência no ritmo do Dojo.
          Selecione um jogo para entrar no modo foco.
        </p>
      </section>

      <section className={`dojo-section ${styles.selectorSection}`} aria-labelledby="minigames-title">
        <header className={styles.sideHeader}>
          <span className={styles.eyebrow}>Minigames</span>
          <h2 id="minigames-title" className={styles.subHeading}>
            Seleção do Arcade
          </h2>
        </header>

        <div className={styles.minigameGrid}>
          {MINIGAMES.map((game) => (
            <article
              key={game.id}
              className={[
                styles.minigameCard,
                selectedGame === game.id ? styles.minigameCardActive : '',
                !game.enabled ? styles.minigameCardDisabled : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className={styles.minigameTop}>
                <Chip variant={game.status === 'Principal' ? 'green' : game.enabled ? 'purple' : 'muted'}>
                  {game.status}
                </Chip>
                <span>{game.difficulty}</span>
              </div>
              <h3>{game.title}</h3>
              <p>{game.description}</p>
              <button
                type="button"
                className={styles.minigameAction}
                disabled={!game.enabled}
                onClick={() => setSelectedGame(game.id as SelectedGame)}
              >
                {game.action}
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedGame && (
        <section className={`dojo-section ${styles.gameFocus}`} aria-labelledby="selected-game-title">
          <div className={styles.gameFocusHeader}>
            <div>
              <span className={styles.eyebrow}>Modo foco</span>
              <h2 id="selected-game-title" className={styles.subHeading}>
                {selectedTitle}
              </h2>
            </div>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => setSelectedGame(null)}
            >
              Voltar aos minigames
            </button>
          </div>

          <div className={styles.gameFocusBody}>
            {selectedGame === 'panda-keys' ? <PandaKeysGame /> : <SealChallenge />}
          </div>
        </section>
      )}
    </PageShell>
  );
}
