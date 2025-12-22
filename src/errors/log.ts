import type { ErrorInfo } from 'react';

export const logError = (error: Error, info: ErrorInfo) => {
  console.error('Caught by ErrorBoundary:', error);

  if (info.componentStack) {
    console.error(info.componentStack);
  }
};
