export default function NewPlanPopupBox() {
  return (
    <div className='fixed top-50 left-1/2 -translate-x-1/2 py-2 px-3 w-70 bg-zinc-100 border-2 border-reiseorange rounded-md'>
      <div>
        <span className='text-reiseorange text-sm'>Create a new plan</span>
      </div>
      <input
        className='w-full text-xl border-1 border-zinc-300 rounded-sm text-zinc-500'
        type='text'
        placeholder='Titel'
      />
      <div className='flex justify-center pt-3 w-full'>
        <button className='py-1 px-5 rounded-lg bg-reisered'>OK</button>
      </div>
    </div>
  );
}
