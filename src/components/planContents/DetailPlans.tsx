import { getPlanContentsById } from '@/apis/supabase/planContents';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FaCirclePlus } from 'react-icons/fa6';

type DetailPlans = {
  planId: number;
};
export default function DetailPlans({ planId }: DetailPlans) {
  const { data } = useSuspenseQuery({
    queryKey: ['DetailPlans', planId],
    queryFn: () => getPlanContentsById(planId),
  });

  return (
    <div className='border-1 border-reiseorange bg-zinc-500 flex-1 min-h-30 p-1'>
      <section className='rounded-md bg-reisered py-1 px-2 '>
        <h1 className='mb-2 text-xl font-bold'>NOTE</h1>
        <span>
          Lorem Ipsum ist ein einfacher Demo-Text für die Print- und
          Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der
          Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine
          Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch
          zu erstellen.
        </span>
      </section>
      <div className='my-1 py-1 px-2 border-1 border-reiseyellow rounded-md'>
        <span className=''>
          Lorem Ipsum ist ein einfacher Demo-Text für die Print- und
          Schriftindustrie. Lorem Ipsum ist in der Industrie bereits der
          Standard Demo-Text seit 1500, als ein unbekannter Schriftsteller eine
          Hand voll Wörter nahm und diese durcheinander warf um ein Musterbuch
          zu erstellen.
        </span>
      </div>
      <div className='mt-2'>
        <button>
          <FaCirclePlus className='text-3xl text-reiseorange hover:text-orange-300' />
        </button>
      </div>
    </div>
  );
}
