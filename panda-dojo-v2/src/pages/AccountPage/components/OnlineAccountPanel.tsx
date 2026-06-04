import { useState, type FormEvent } from 'react';
import { Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/features/auth/useAuth';
import type { LocalProfile } from '@/features/profile/hooks/useLocalProfile';
import { LocalProgressImportCard } from './LocalProgressImportCard';
import styles from '../AccountPage.module.css';

interface Props {
  localProfile: LocalProfile;
}

type AuthMode = 'sign-in' | 'sign-up';

export function OnlineAccountPanel({ localProfile }: Props) {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isSupabaseEnabled,
    signIn,
    signOut,
    signUp,
    refreshProfile,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    const result = mode === 'sign-up'
      ? await signUp(email, password, displayName.trim() || undefined)
      : await signIn(email, password);

    setSubmitting(false);

    if (!result.ok) {
      setFeedback(result.error ?? 'Não foi possível concluir a autenticação.');
      return;
    }

    setFeedback(
      mode === 'sign-up'
        ? 'Conta criada. Se a confirmação por e-mail estiver ativa, confirme antes de entrar.'
        : 'Entrada concluída.',
    );
    setPassword('');
  }

  async function handleSignOut() {
    setSubmitting(true);
    setFeedback(null);
    const result = await signOut();
    setSubmitting(false);
    setFeedback(result.ok ? 'Você saiu da conta online.' : result.error);
  }

  if (!isSupabaseEnabled) {
    return (
      <Card as="section" className={styles.authPanel} aria-labelledby="online-account-title">
        <header className={styles.panelHeader}>
          <span className={styles.eyebrow}>Conta online</span>
          <h2 id="online-account-title" className={styles.panelTitle}>Modo local ativo</h2>
        </header>

        <p className={styles.noticeText}>
          Configure o Supabase para usar conta online. Seu progresso local continua disponível
          neste navegador.
        </p>

        <div className={styles.authStatusGrid}>
          <span><strong>Nível local</strong>{localProfile.level}</span>
          <span><strong>XP local</strong>{localProfile.xp}</span>
          <span><strong>Título local</strong>{localProfile.title}</span>
        </div>
      </Card>
    );
  }

  if (isAuthenticated) {
    return (
      <Card as="section" className={styles.authPanel} aria-labelledby="online-account-title">
        <header className={styles.panelHeader}>
          <span className={styles.eyebrow}>Conta online</span>
          <h2 id="online-account-title" className={styles.panelTitle}>Perfil sincronizável</h2>
        </header>

        <div className={styles.remoteProfileBox}>
          <Badge variant="success">Logado</Badge>
          <dl className={styles.dataList}>
            <div className={styles.dataRow}>
              <dt>Nome</dt>
              <dd>{profile?.display_name ?? user?.email?.split('@')[0] ?? 'Conta Panda'}</dd>
            </div>
            <div className={styles.dataRow}>
              <dt>E-mail</dt>
              <dd>{user?.email ?? '--'}</dd>
            </div>
            <div className={styles.dataRow}>
              <dt>Nível</dt>
              <dd>{profile?.level ?? 1}</dd>
            </div>
            <div className={styles.dataRow}>
              <dt>XP</dt>
              <dd>{profile?.xp ?? 0}</dd>
            </div>
            <div className={styles.dataRow}>
              <dt>Título</dt>
              <dd>{profile?.title ?? 'Filhote de Panda'}</dd>
            </div>
          </dl>
        </div>

        {user?.id && (
          <LocalProgressImportCard userId={user.id} onImported={refreshProfile} />
        )}

        {feedback && <p className={styles.authFeedback}>{feedback}</p>}

        <div className={styles.dataButtons}>
          <Button variant="secondary" onClick={handleSignOut} disabled={submitting || loading}>
            Sair
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card as="section" className={styles.authPanel} aria-labelledby="online-account-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Conta online</span>
        <h2 id="online-account-title" className={styles.panelTitle}>
          {mode === 'sign-in' ? 'Entrar no Dojo' : 'Criar conta Panda'}
        </h2>
      </header>

      <p className={styles.noticeText}>
        Entre para preparar a sincronização em nuvem. O progresso local permanece salvo neste
        navegador até a fase de importação.
      </p>

      <form className={styles.authForm} onSubmit={handleSubmit}>
        {mode === 'sign-up' && (
          <label className={styles.authField}>
            <span>Nome de exibição</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              placeholder="Mestre Panda"
            />
          </label>
        )}

        <label className={styles.authField}>
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            placeholder="voce@email.com"
          />
        </label>

        <label className={styles.authField}>
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            placeholder="Mínimo 6 caracteres"
          />
        </label>

        {feedback && <p className={styles.authFeedback}>{feedback}</p>}

        <div className={styles.authActions}>
          <Button type="submit" variant="primary" disabled={submitting || loading}>
            {mode === 'sign-in' ? 'Entrar' : 'Criar conta'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              setFeedback(null);
              setMode((current) => (current === 'sign-in' ? 'sign-up' : 'sign-in'));
            }}
          >
            {mode === 'sign-in' ? 'Criar conta' : 'Já tenho conta'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
