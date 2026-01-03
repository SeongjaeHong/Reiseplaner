import { useNavigate } from '@tanstack/react-router';
import { FaArrowLeft, FaRegCompass } from 'react-icons/fa6';
import { IoAlertCircleOutline } from 'react-icons/io5';

export default function PageNotFound() {
  const navigate = useNavigate();
  const handleNavigateHome = () => void navigate({ to: '/' });

  return (
    <div className='animate-in fade-in zoom-in flex min-h-[80vh] flex-col items-center justify-center px-6 duration-300'>
      <div className='relative mb-8'>
        <div className='absolute inset-0 scale-150 rounded-full bg-indigo-100 opacity-50 blur-3xl'></div>
        <div className='relative flex h-64 w-64 items-center justify-center'>
          <svg viewBox='0 0 200 200' className='text-primary h-full w-full fill-current'>
            <path
              d='M40,100 Q40,40 100,40 T160,100 T100,160 T40,100'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeDasharray='5,5'
            />
            <circle cx='100' cy='100' r='15' className='animate-pulse' />
            <FaRegCompass
              size={80}
              strokeWidth={1}
              className='text-primary animate-[spin_7s_linear_infinite]'
            />
          </svg>
          <div className='absolute top-0 right-0 rotate-12 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl'>
            <IoAlertCircleOutline className='text-red-500' size={32} />
          </div>
        </div>
      </div>
      <h2 className='mb-4 text-5xl font-black tracking-tight text-slate-900'>
        Haben Sie sich verirrt?
      </h2>
      <p className='mb-10 max-w-md text-center text-lg leading-relaxed font-medium text-slate-500'>
        Seite nicht gefunden. Aber keine Sorge, eine neue Reise wartet schon auf Sie!
      </p>
      <button
        onClick={handleNavigateHome}
        className='group hover:bg-primary flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white shadow-2xl transition-all hover:shadow-indigo-200 active:scale-95'
      >
        <FaArrowLeft size={20} className='transition-transform group-hover:-translate-x-1' />
        Zurück zur Startseite
      </button>
    </div>
  );
}
