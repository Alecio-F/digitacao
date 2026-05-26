import { Providers } from '@/app/providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageShell } from '@/components/layout/PageShell';
import { PandaMascot } from '@/components/mascot/PandaMascot';
import { DevPage } from '@/pages/DevPage';

function App() {
  return (
    <Providers>
      <AppLayout activePage="Início">
        <PageShell title="Design System">
          <PandaMascot size={64} />
          <DevPage />
        </PageShell>
      </AppLayout>
    </Providers>
  );
}

export default App;
