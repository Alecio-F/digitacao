import { useNavigate } from 'react-router';
import { Badge, Button, Card } from '@/components/ui';
import styles from '../HomePage.module.css';

const QUICK_ACCESS = [
  {
    title: 'Type Arena',
    text: 'Teste velocidade, precisão e foco em tempo real.',
    route: '/arena',
    badge: 'Treino',
  },
  {
    title: 'Mapa do Dojo',
    text: 'Siga fases guiadas para evoluir sua técnica.',
    route: '/mapa',
    badge: 'Fases',
  },
  {
    title: 'Aprenda',
    text: 'Revise fundamentos com o Mestre Panda.',
    route: '/aprenda',
    badge: 'Guia',
  },
  {
    title: 'Arcade',
    text: 'Treine reflexo e ritmo nos minigames.',
    route: '/arcade',
    badge: 'Games',
  },
];

export function QuickAccessGrid() {
  const navigate = useNavigate();

  return (
    <section className={styles.section} aria-labelledby="quick-access-title">
      <div className={styles.sectionHeader}>
        <span className={styles.eyebrow}>Rotas do Dojo</span>
        <h2 id="quick-access-title">Acesso rápido</h2>
      </div>
      <div className={styles.quickAccessGrid}>
        {QUICK_ACCESS.map((item) => (
          <Card key={item.route} as="article" variant="interactive" className={styles.quickCard}>
            <div className={styles.quickCardHeader}>
              <Badge variant="info">{item.badge}</Badge>
              <span aria-hidden="true" className="material-symbols-outlined">
                keyboard_command_key
              </span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <Button variant="ghost" size="sm" onClick={() => navigate(item.route)}>
              Abrir
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
