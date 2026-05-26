import { BrowserRouter, Route, Routes } from 'react-router';
import { Providers } from './providers';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { LearnPage } from '@/pages/LearnPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Providers>
        <AppLayout>
          <Routes>
            <Route path="/"        element={<HomePage />} />
            <Route path="/aprenda" element={<LearnPage />} />
            <Route path="*"        element={<HomePage />} />
          </Routes>
        </AppLayout>
      </Providers>
    </BrowserRouter>
  );
}
