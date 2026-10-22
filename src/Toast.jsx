import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export function Toast({ mensagem, onClose }) {
  if (!mensagem) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 shadow-xl transition-all">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-500/10 text-rose-500">
        <AlertCircle size={18} />
      </span>
      <p className="text-xs font-medium text-ink">{mensagem}</p>
      <button
        onClick={onClose}
        className="ml-2 text-mute hover:text-ink focus:outline-none"
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
}