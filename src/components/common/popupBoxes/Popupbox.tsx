type PopupboxParams = {
  text: string;
  onAccept: () => void;
  onCancel: () => void;
};

export default function Popupbox({ text, onAccept, onCancel }: PopupboxParams) {
  return (
    <div className='fixed inset-0 z-1 flex justify-center pt-50'>
      <div onClick={onCancel} className='fixed inset-0' />
      <div className='z-1 h-fit w-70 rounded-md bg-white px-3 py-2'>
        <div className='mb-2'>
          <span className='text-sm font-bold text-slate-800'>{text}</span>
        </div>
        <div className='flex w-full justify-center pt-3'>
          <button
            className='bg-primary hover:bg-primary-strong rounded-lg px-5 py-1'
            onClick={onCancel}
          >
            Abbrechen
          </button>
          <button
            className='bg-primary hover:bg-primary-strong mx-3 rounded-lg px-5 py-1'
            onClick={onAccept}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
