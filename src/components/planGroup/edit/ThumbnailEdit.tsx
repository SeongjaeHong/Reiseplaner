import { useEffect, useReducer, useRef, useState } from 'react';
import useOutsideClick from '@/utils/useClickOutside';
import { isDefaultImage } from '@/apis/supabase/buckets';
import SimplePopupbox from '@/components/common/popupBoxes/SimplePopupbox';
import { FaCameraRotate } from 'react-icons/fa6';

type ThumbnailParams = {
  image: File | null;
  onChange: (e: File | null) => void;
};

export default function ThumbnailEdit({ image, onChange }: ThumbnailParams) {
  const outsideclick = useOutsideClick();
  const refImg = useRef<HTMLImageElement | null>(null);
  const [showImageMenu, toggleShowImageMenu] = useReducer((prev) => !prev, false);
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
  const isValidImage = !!(image && previewUrl && !isDefaultImage(image.name));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (isImageFile(file)) {
      onChange(file);
    } else {
      toggleShowPopupMsg();
    }

    e.target.value = '';
  };

  return (
    <div className='h-full'>
      {isValidImage && (
        <div className='group relative h-full'>
          <img src={previewUrl} className='h-full w-full object-cover' />
          <div
            ref={refImg}
            onClick={toggleShowImageMenu}
            className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer'
          >
            <FaCameraRotate className='text-3xl text-white' />
          </div>
          {showImageMenu && (
            <ul
              ref={outsideclick(toggleShowImageMenu, [refImg])}
              onClick={(e) => e.preventDefault()}
              className={`absolute top-2 left-2 divide-y divide-zinc-600 overflow-hidden rounded-md bg-zinc-500 text-center`}
            >
              <li onClick={handlerInputClick} className={'px-2 py-1 hover:bg-zinc-700'}>
                <span>Bearbeiten</span>
              </li>
              <li
                onClick={handlerDeleteClick}
                className={`px-2 py-1 hover:bg-zinc-700 ${
                  isDefaultImage(image.name) ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <span>Löschen</span>
              </li>
            </ul>
          )}
        </div>
      )}

      {!isValidImage && (
        <div
          onClick={() => refInput.current?.click()}
          className='flex h-full w-full items-center justify-center bg-zinc-300 hover:cursor-pointer'
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
        <SimplePopupbox text='You can upload only an image file.' onAccept={toggleShowPopupMsg} />
      )}
    </div>
  );
}

const isImageFile = (file: File | null): file is File => !!file && file.type.startsWith('image/');

function useImagePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  const activeUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const currentUrls = activeUrlsRef.current;
    const newUrl = URL.createObjectURL(file);
    currentUrls.add(newUrl);
    setUrl(newUrl);

    return () => {
      setTimeout(() => {
        // Prevent duplicated url revoking
        if (currentUrls.has(newUrl)) {
          URL.revokeObjectURL(newUrl);
          currentUrls.delete(newUrl);
        }
      }, 0); // Prevent Not-found error on <img> tag
    };
  }, [file]);

  useEffect(() => {
    const currentUrls = activeUrlsRef.current;

    return () => {
      currentUrls.forEach((u) => URL.revokeObjectURL(u));
      currentUrls.clear();
    };
  }, []);

  return url;
}
