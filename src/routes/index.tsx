import { createFileRoute } from '@tanstack/react-router';
import { IoIosAddCircleOutline } from 'react-icons/io';
import NewPlanPopupBox from '../components/NewPlanPopupBox';
import { useReducer } from 'react';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  const [showCreatePlanBox, toggleShowCreatePlanBox] = useReducer(
    (prev) => !prev,
    false
  );

  const handleCreatePlan = () => {
    toggleShowCreatePlanBox();
  };

  return (
    <>
      <div className='relative p-2 min-h-100 bg-reiseyellow'>
        <button
          className='absolute right-5 bottom-5'
          onClick={handleCreatePlan}
        >
          <IoIosAddCircleOutline className='text-3xl' />
        </button>
      </div>
      {showCreatePlanBox && <NewPlanPopupBox />}
    </>
  );
}
