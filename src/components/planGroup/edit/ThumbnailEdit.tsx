import { useEffect, useReducer, useRef, useState } from 'react';
import useOutsideClick from '@/utils/useOutsideClick';
import { isDefaultImage } from '@/apis/supabase/buckets';
import SimplePopupbox from '@/components/common/popupBoxes/SimplePopupbox';

type ThumbnailParams = {
  image: File | null;
  onChange: (e: File | null) => void;
};

export default function ThumbnailEdit({ image, onChange }: ThumbnailParams) {
  const outsideclick = useOutsideClick();
  const refImg = useRef<HTMLImageElement | null>(null);
  const [showImageMenu, toggleShowImageMenu] = useReducer(
    (prev) => !prev,
    false
  );
  const [showPopupMsg, toggleShowPopupMsg] = useReducer((prev) => !prev, false);

  const refInput = useRef<HTMLInputElement | null>(null);
  const handlerInputClick = () => {
    if (refInput.current) {
      refInput.current.click();
    }
    toggleShowImageMenu();
  };

  const handlerDeleteClick = () => {
    if (image && isDefaultImage(image.name)) {
      return;
    }
    onChange(null);
    toggleShowImageMenu();
  };

  const previewUrl = useImagePreview(image);

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (isImageFile(file)) {
      onChange(file);
    } else {
      toggleShowPopupMsg();
    }
  };

  return (
    <div className='relative w-1/2 h-full mr-2'>
      {image && previewUrl && (
        <div className='w-full h-full'>
          {showImageMenu && (
            <ul
              ref={outsideclick(toggleShowImageMenu, [refImg])}
              onClick={(e) => e.preventDefault()}
              className={`absolute left-0 top-0 text-center divide-y divide-zinc-600 bg-zinc-500`}
            >
              <li
                onClick={handlerInputClick}
                className={'w-full px-2 py-1 hover:bg-zinc-700'}
              >
                <span>Bearbeiten</span>
              </li>
              <li
                onClick={handlerDeleteClick}
                className={`w-full px-2 py-1 hover:bg-zinc-700 ${
                  isDefaultImage(image.name)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <span>Löschen</span>
              </li>
            </ul>
          )}
          <img
            ref={refImg}
            src={previewUrl}
            onClick={toggleShowImageMenu}
            className='w-full h-full object-cover hover:cursor-pointer'
          />
        </div>
      )}

      {!image && (
        <div
          onClick={() => refInput.current?.click()}
          className='w-full h-full flex justify-center items-center bg-zinc-300 hover:cursor-pointer'
        >
          Add an image
        </div>
      )}

      <input
        type='file'
        accept='image/*'
        ref={refInput}
        onChange={handleFileChange}
        className='hidden'
      />
      {showPopupMsg && (
        <SimplePopupbox
          text='You can upload only an image file.'
          onAccept={toggleShowPopupMsg}
        />
      )}
    </div>
  );
}

const isImageFile = (file: File | null): file is File => 
  !!file && file.type.startsWith('image/');

function useImagePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const newUrl = URL.createObjectURL(file);
    setUrl(newUrl);

    return () => URL.revokeObjectURL(newUrl);
  }, [file]);

  return url;
}
