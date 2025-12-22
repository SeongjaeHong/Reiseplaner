import { v4 as uuid } from 'uuid';

type ToastType = 'SUCCESS' | 'ERROR';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastCallback: (toast: ToastItem) => void;

export const toast = {
  success: (message: string) => {
    toastCallback?.({ id: uuid(), message, type: 'SUCCESS' });
  },
  error: (message: string) => {
    toastCallback?.({ id: uuid(), message, type: 'ERROR' });
  },

  _subscribe: (callback: (toast: ToastItem) => void) => {
    toastCallback = callback;
  },
};
