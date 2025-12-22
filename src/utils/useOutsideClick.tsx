import { useEffect, useRef } from 'react';

type callbackType = () => void;
type exceptionRefsType = React.RefObject<HTMLElement | null>[];

export default function useClickOutside() {
  const handlersRef = useRef(
    new Map<
      HTMLElement,
      {
        callback: callbackType;
        exceptions?: exceptionRefsType;
      }
    >()
  );

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;

      handlersRef.current.forEach(({ callback, exceptions }, element) => {
        const isException = exceptions?.some((ref) => ref.current?.contains(target));

        if (element?.contains(target) || isException) return;

        callback();
      });
    };

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (callback: callbackType, exceptionRefs: exceptionRefsType = []) => {
    return (element: HTMLElement | null) => {
      if (!element) return;

      handlersRef.current.set(element, {
        callback: callback,
        exceptions: exceptionRefs,
      });

      return () => {
        handlersRef.current.delete(element);
      };
    };
  };
}
