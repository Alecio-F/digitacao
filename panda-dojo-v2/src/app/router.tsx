import { BrowserRouter, Route, Routes } from 'react-router';
import { Providers } from './providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LearnPage } from '@/pages/LearnPage';
import { DojoMapPage } from '@/pages/DojoMapPage';
import { ArenaPage } from '@/pages/ArenaPage';
import { ArcadePage } from '@/pages/ArcadePage';
import { AccountPage } from '@/pages/AccountPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Providers>
        <AppLayout>
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/aprenda" element={<LearnPage />} />
            <Route path="/mapa"    element={<DojoMapPage />} />
            <Route path="/arena"   element={<ArenaPage />} />
            <Route path="/arcade"  element={<ArcadePage />} />
            <Route path="/conta"   element={<AccountPage />} />
            <Route path="*"        element={<HomePage />} />
          </Routes>
        </AppLayout>
      </Providers>
    </BrowserRouter>
  );
}
