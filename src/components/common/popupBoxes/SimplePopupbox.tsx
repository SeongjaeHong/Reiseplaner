type SimplePopupbox = {
  text: string;
  onAccept: () => void;
};

export default function SimplePopupbox({ text, onAccept }: SimplePopupbox) {
  return (
    <div className='border-secondary fixed top-50 left-1/2 z-1 w-70 -translate-x-1/2 rounded-md border-2 bg-zinc-100 px-3 py-2'>
      <div>
        <span className='text-secondary text-sm font-bold'>{text}</span>
      </div>
      <div className='flex w-full justify-center pt-3'>
        <button className='bg-accent mx-3 rounded-lg px-5 py-1' onClick={() => void onAccept()}>
          OK
        </button>
      </div>
    </div>
  );
}
