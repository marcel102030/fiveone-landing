import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./adminToast.css";

export type AdminToastKind = "success" | "error" | "info" | "warning";

export type AdminToastPayload = {
  type?: AdminToastKind;
  title: string;
  description?: string;
  duration?: number;
};

export type AdminToast = AdminToastPayload & { id: number; createdAt: number };

type AdminToastContextValue = {
  notify: (toast: AdminToastPayload) => void;
  dismiss: (id: number) => void;
  clear: () => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
};

export function AdminToastProvider({ children }: ProviderProps) {
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const counter = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const scheduleRemoval = useCallback((id: number, duration?: number) => {
    const timeout = duration ?? 4200;
    if (timeout <= 0) return;
    const existing = timers.current.get(id);
    if (existing) clearTimeout(existing);
    const handle = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      timers.current.delete(id);
    }, timeout);
    timers.current.set(id, handle);
  }, []);

  const notify = useCallback((payload: AdminToastPayload) => {
    const id = ++counter.current;
    const toast: AdminToast = {
      id,
      type: payload.type ?? "info",
      title: payload.title,
      description: payload.description,
      duration: payload.duration,
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev, toast]);
    scheduleRemoval(id, toast.duration);
  }, [scheduleRemoval]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const clear = useCallback(() => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  const value = useMemo(() => ({ notify, dismiss, clear }), [notify, dismiss, clear]);

  return (
    <AdminToastContext.Provider value={value}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`admin-toast admin-toast--${toast.type}`} role="status">
            <div className="admin-toast__body">
              <strong className="admin-toast__title">{toast.title}</strong>
              {toast.description && <span className="admin-toast__description">{toast.description}</span>}
            </div>
            <button className="admin-toast__close" aria-label="Fechar notificação" onClick={() => dismiss(toast.id)}>×</button>
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) throw new Error("useAdminToast deve ser utilizado dentro de AdminToastProvider");
  const { notify, dismiss, clear } = ctx;

  return {
    notify,
    dismiss,
    clear,
    success: (title: string, description?: string, duration?: number) => notify({ type: "success", title, description, duration }),
    error: (title: string, description?: string, duration?: number) => notify({ type: "error", title, description, duration }),
    info: (title: string, description?: string, duration?: number) => notify({ type: "info", title, description, duration }),
    warning: (title: string, description?: string, duration?: number) => notify({ type: "warning", title, description, duration }),
  };
}

