"use client";

import { useT } from "@/i18n/LanguageContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  const siteT = useT();
  const finalConfirm = confirmLabel || siteT("Eliminar");
  const finalCancel = cancelLabel || siteT("Cancelar");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl border border-[var(--border)] shadow-elevated p-6 animate-scaleIn">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0" style={{border: '1px solid #fecaca'}}>
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{color: 'var(--text-primary)'}}>{title}</h3>
            <p className="text-xs mt-0.5" style={{color: 'var(--text-muted)'}}>{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150"
            style={{color: 'var(--text-secondary)'}}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {finalCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-150 disabled:opacity-50 active:scale-[0.97]"
            style={{backgroundColor: 'var(--danger)'}}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#b91c1c'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--danger)'; }}
          >
            {loading ? siteT("Eliminando...") : finalConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
