import { useEffect, useState } from 'react';
import { toast, type ToastItem } from './toast';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toast._subscribe((newToast) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3000);
    });
  }, []);

  return (
    <div className='fixed top-20 left-1/2 z-99 -translate-x-1/2'>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex min-h-14 min-w-80 items-center rounded-sm p-2 ${t.type === 'SUCCESS' ? 'bg-green-500' : 'bg-red-500'}`}
        >
          <span className='mx-2 text-lg'>
            {t.type === 'SUCCESS' && <FaCircleCheck />}
            {t.type === 'ERROR' && <FaCircleXmark />}
          </span>
          <span className='text-white'>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
