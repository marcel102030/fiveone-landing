import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  scope?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const scope = this.props.scope ?? "app";
    console.error(`[ErrorBoundary:${scope}]`, error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return <DefaultFallback error={error} onReset={this.reset} scope={this.props.scope} />;
  }
}

function DefaultFallback({
  error,
  onReset,
  scope,
}: {
  error: Error;
  onReset: () => void;
  scope?: string;
}) {
  const isDev = import.meta.env.DEV;
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full bg-navy-light border border-slate/10 rounded-2xl p-8 shadow-card animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-mint-dim flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-mint" aria-hidden="true">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-slate-white text-lg font-semibold">Algo deu errado por aqui</h2>
            <p className="text-slate text-sm mt-1">
              Tivemos um erro inesperado ao carregar esta tela. Você pode tentar de novo, voltar ao início ou recarregar a página.
            </p>
            {isDev && (
              <pre className="mt-4 text-xs text-slate bg-navy p-3 rounded-lg overflow-x-auto max-h-40">
                {scope ? `[${scope}] ` : ""}
                {error.message}
              </pre>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mint text-navy text-sm font-semibold hover:shadow-mint transition"
              >
                Tentar novamente
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate/20 text-slate-light text-sm hover:border-mint hover:text-mint transition"
              >
                Voltar ao início
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate/20 text-slate-light text-sm hover:border-mint hover:text-mint transition"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
