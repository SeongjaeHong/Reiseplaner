import useClickOutside from '@/utils/useClickOutside';

type PopupboxParams = {
  text: string;
  onAccept: () => void;
  onCancel: () => void;
};

export default function Popupbox({ text, onAccept, onCancel }: PopupboxParams) {
  const outsideclick = useClickOutside();

  return (
    <div
      ref={outsideclick(onCancel)}
      className='border-reiseorange fixed top-50 left-1/2 z-1 w-70 -translate-x-1/2 rounded-md border-2 bg-zinc-100 px-3 py-2'
    >
      <div>
        <span className='text-reiseorange text-sm font-bold'>{text}</span>
      </div>
      <div className='flex w-full justify-center pt-3'>
        <button className='bg-reisered mx-3 rounded-lg px-5 py-1' onClick={() => void onAccept()}>
          OK
        </button>
        <button className='bg-reisered rounded-lg px-5 py-1' onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
