import { useState, type ReactNode } from 'react';
import { BackgroundCanvas } from './BackgroundCanvas';
import { HeaderHud } from './HeaderHud';
import { MobileBottomNav } from './MobileBottomNav';
import { SettingsDrawer } from './SettingsDrawer';
import styles from './AppLayout.module.css';

interface Props {
  children: ReactNode;
  activePage?: string;
}

export function AppLayout({ children, activePage }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.root}>
      <BackgroundCanvas />
      <div className={styles.content}>
        <HeaderHud onSettingsOpen={() => setDrawerOpen(true)} />
        {children}
        <MobileBottomNav activePage={activePage} />
      </div>
      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
