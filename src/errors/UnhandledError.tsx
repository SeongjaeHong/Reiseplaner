import { useNavigate } from '@tanstack/react-router';
import { useReducer } from 'react';
import { FaArrowLeft, FaArrowsRotate, FaShieldCat, FaTerminal } from 'react-icons/fa6';

export const UnhandledError = ({ error }: { error: Error }) => {
  const navigate = useNavigate();
  const handleNavigateHome = () => void navigate({ to: '/' });
  const [showError, toggleShowError] = useReducer((prev) => !prev, false);

  return (
    <div className='animate-in fade-in flex min-h-[80vh] flex-col items-center justify-center px-6 duration-500'>
      <div className='relative mb-12'>
        <div className='absolute inset-0 scale-150 animate-pulse rounded-full bg-red-100 opacity-30 blur-3xl'></div>
        <div className='relative flex h-64 w-64 items-center justify-center'>
          <div className='relative'>
            <FaShieldCat
              size={120}
              strokeWidth={1}
              className='text-primary absolute -top-4 -left-4 animate-bounce opacity-20'
            />
            <div className='relative flex h-40 w-48 items-center justify-center rounded-[32px] bg-slate-800 shadow-2xl'>
              <div className='absolute -top-6 left-1/2 h-10 w-20 -translate-x-1/2 rounded-t-2xl border-4 border-slate-800'></div>
              <div className='flex gap-2'>
                <div className='h-3 w-3 animate-ping rounded-full bg-red-500'></div>
                <div className='h-3 w-3 animate-ping rounded-full bg-amber-500 [animation-delay:0.2s]'></div>
                <div className='h-3 w-3 animate-ping rounded-full bg-emerald-500 [animation-delay:0.4s]'></div>
              </div>
            </div>
            <div className='absolute -right-4 -bottom-4 rounded-3xl border border-slate-100 bg-white p-4 shadow-2xl'>
              <FaArrowsRotate className='animate-spin-slow text-indigo-600' size={32} />
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-lg text-center'>
        <h2 className='mb-4 text-4xl font-black text-slate-900'>Ups! Der Reisekoffer klemmt.</h2>
        <p className='mb-10 text-lg font-medium text-slate-500'>
          Ein unerwarteter Systemfehler ist aufgetreten, daher konnten die Informationen nicht
          geladen werden.
          <br />
          Bitte versuchen Sie es in Kürze erneut oder kehren Sie zur Startseite zurück.
        </p>

        <div className='flex justify-center'>
          <button
            onClick={handleNavigateHome}
            className='group hover:bg-primary flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white shadow-2xl transition-all hover:shadow-indigo-200 active:scale-95'
          >
            <FaArrowLeft size={20} className='transition-transform group-hover:-translate-x-1' />
            Zurück zur Startseite
          </button>
        </div>

        <div className='mt-12'>
          <button
            onClick={toggleShowError}
            className='mx-auto flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-indigo-600'
          >
            <FaTerminal size={16} />
            {showError ? 'Fehlerprotokoll anzeigen' : 'Fehlerprotokoll ausblenden'}
          </button>

          {showError && (
            <div className='animate-in slide-in-from-top-4 mt-4 rounded-3xl bg-slate-900 p-6 text-left duration-300'>
              <code className='font-mono text-xs leading-relaxed break-all text-slate-300'>
                {error.name}
                <br />
                {error.message}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
