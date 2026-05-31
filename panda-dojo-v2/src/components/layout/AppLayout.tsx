import { useState, type ReactNode } from 'react';
import { BackgroundCanvas } from './BackgroundCanvas';
import { BambooLeaves } from './BambooLeaves';
import { HeaderHud } from './HeaderHud';
import { MobileBottomNav } from './MobileBottomNav';
import { SettingsDrawer } from './SettingsDrawer';
import styles from './AppLayout.module.css';

interface Props {
  children: ReactNode;
}

export function AppLayout({ children }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.root}>
      <BackgroundCanvas />
      <BambooLeaves />
      <div className={styles.content}>
        <HeaderHud onSettingsOpen={() => setDrawerOpen(true)} />
        {children}
        <footer>© 2025 PandaDigitações.</footer>
        <MobileBottomNav />
      </div>
      <SettingsDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
