import { $insertNodes, type LexicalEditor } from 'lexical';
import { ImageNode } from '../components/Editor/ImageNode';

export function useAddImage() {
  return async (e: React.ChangeEvent<HTMLInputElement>, editor: LexicalEditor) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      return;
    }

    const dataURL = await readFileAsDataURL(file);
    const { width, height } = await getImageDimensions(dataURL);
    editor.update(() => {
      const imageNode = new ImageNode(dataURL, width, height); // 미리보기용 base64 주입
      $insertNodes([imageNode]);
    });
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

function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
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

export function isBase64DataUrl(src: string) {
  if (typeof src !== 'string') {
    return false;
  }

  return src.startsWith('data:') && src.includes(';base64,');
}
