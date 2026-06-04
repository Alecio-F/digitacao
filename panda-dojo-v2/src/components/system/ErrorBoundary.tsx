import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro capturado pela interface:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          style={{
            width: 'min(720px, calc(100% - 32px))',
            margin: '40px auto',
            padding: '24px',
            border: '1px solid var(--dojo-border)',
            borderRadius: '16px',
            background: 'var(--dojo-card-bg)',
            color: 'var(--dojo-text)',
            boxShadow: 'var(--dojo-shadow-card)',
          }}
        >
          <h1
            style={{
              color: 'var(--dojo-text-strong)',
              fontFamily: 'var(--font-title)',
              fontSize: '1.35rem',
              fontWeight: 900,
              marginBottom: '8px',
            }}
          >
            A interface encontrou um erro.
          </h1>
          <p style={{ color: 'var(--dojo-text-muted)', lineHeight: 1.5 }}>
            Recarregue a página para continuar. Seus dados locais permanecem salvos no navegador.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '18px',
              minHeight: '40px',
              padding: '0 18px',
              border: '1px solid var(--dojo-border)',
              borderRadius: '10px',
              background: 'var(--dojo-text-strong)',
              color: '#fff',
              cursor: 'pointer',
              fontFamily: 'var(--font-title)',
              fontWeight: 900,
            }}
          >
            Recarregar
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
