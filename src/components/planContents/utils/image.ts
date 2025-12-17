import { v4 as uuid } from 'uuid';
import type { LocalContent, LocalImageContent } from './contents';

type UseAddImage = {
  updateLocalContents: (content: LocalContent) => void;
};
export function useAddImage({ updateLocalContents }: UseAddImage) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      return null;
    }

    const dataURL = await readFileAsDataURL(file);
    const { width, height } = await getImageDimensions(dataURL);
    const newContent: LocalImageContent = {
      id: uuid(),
      type: 'file',
      data: file,
      width,
      height,
      fileDelete: false,
    };
    updateLocalContents(newContent);
  };
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Fail to read a file as a Data URL.'));
      }
    };
    reader.onerror = (e) => reject(new Error(e.target?.error?.message));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = (event) => {
      let errorMessage: string;
      if (typeof event === 'string') {
        errorMessage = event;
      } else {
        errorMessage = 'Fail to load an image.';
      }
      reject(new Error(errorMessage));
    };
    img.src = src;
  });
}
