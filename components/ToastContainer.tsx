'use client';

import Toast from './Toast';
import { Toast as ToastType } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-full max-w-md space-y-3 px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}
