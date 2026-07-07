import { useToasts } from '../context/ToastContext';

export function ToastViewport() {
  const { toasts, dismiss } = useToasts();
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          role="status"
          aria-live="polite"
          className="max-w-[min(90vw,420px)] text-center px-6 py-3 rounded-xl text-sm shadow-lg transition-opacity"
          style={{
            background: t.palette.bg,
            color: t.palette.text,
            border: `1px solid ${t.palette.border}`,
            fontFamily: 'var(--font-vazir, Vazirmatn, sans-serif)',
            lineHeight: 1.5,
          }}
        >
          {t.message}
        </button>
      ))}
    </div>
  );
}
