type PopupboxParams = {
  text: string;
  onAccept: () => void;
  onCancel: () => void;
};

export default function Popupbox({ text, onAccept, onCancel }: PopupboxParams) {
  return (
    <div className='fixed z-1 top-50 left-1/2 -translate-x-1/2 py-2 px-3 w-70 bg-zinc-100 border-2 border-reiseorange rounded-md'>
      <div>
        <span className='text-reiseorange text-sm font-bold'>{text}</span>
      </div>
      <div className='flex justify-center pt-3 w-full'>
        <button
          className='py-1 px-5 mx-3 rounded-lg bg-reisered'
          onClick={() => void onAccept()}
        >
          OK
        </button>
        <button className='py-1 px-5 rounded-lg bg-reisered' onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
