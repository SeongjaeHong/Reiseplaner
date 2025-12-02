import { useReducer, useRef } from 'react';
import useOutsideClick from '@/utils/useOutsideClick';
import { isDefaultImage } from '@/apis/supabase/buckets';

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

  const StyleMenuItem = 'w-full px-2 py-1 hover:bg-zinc-700';

  return (
    <div className='relative w-1/2 h-full mr-2'>
      {image && (
        <div className='w-full h-full'>
          {showImageMenu && (
            <ul
              ref={outsideclick(toggleShowImageMenu, [refImg])}
              onClick={(e) => e.preventDefault()}
              className={`absolute left-0 top-0 text-center divide-y divide-zinc-600 bg-zinc-500`}
            >
              <li onClick={handlerInputClick} className={StyleMenuItem}>
                <span>Bearbeiten</span>
              </li>
              <li
                onClick={handlerDeleteClick}
                className={`${StyleMenuItem} ${
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
            src={URL.createObjectURL(image)}
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
          이미지 추가
        </div>
      )}

      <input
        type='file'
        ref={(e) => {
          refInput.current = e;
        }}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null;
          onChange(file);
        }}
        className='hidden'
      />
    </div>
  );
}
