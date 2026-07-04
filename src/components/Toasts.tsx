import { Check, Info } from 'lucide-react';

type Toast = { id: string; message: string; type: 'success' | 'info' };

interface Props {
    toasts: Toast[];
}

export default function Toasts({ toasts }: Props) {
    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <div key={t.id} className="toast" style={{ borderLeftColor: t.type === 'success' ? 'var(--color-horror)' : 'var(--primary)' }}>
                    {t.type === 'success' ? <Check size={18} color="var(--color-horror)" /> : <Info size={18} color="var(--primary)" />}
                    <span>{t.message}</span>
                </div>
            ))}
        </div>
    );
}
