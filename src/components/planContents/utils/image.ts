import { $insertNodes, type LexicalEditor } from 'lexical';
import { ImageNode } from '../components/Editor/ImageNode';
import { editorContentSchema } from '../components/Editor/editor.types';
import { deleteImage } from '@/apis/supabase/buckets';

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
        reject(new Error('Fehler beim Lesen der Datei als Data-URL'));
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
        errorMessage = 'Fehler beim Laden des Bildes.';
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

export const deleteEditorImagesFromDB = async (prev: string, curr?: string) => {
  const prevImageSrcs = extractImageSrcs(prev);

  let deletedImages: string[];
  if (curr) {
    // delete images only removed from the editor.
    const currentImageSrcs = extractImageSrcs(curr);
    deletedImages = [...prevImageSrcs].filter((src) => !currentImageSrcs.has(src));
  } else {
    // delete all images in the editor.
    deletedImages = [...prevImageSrcs];
  }

  if (deletedImages.length > 0) {
    await deleteImage(deletedImages);
  }
};

// Extract all image sources from contents.
const extractImageSrcs = (data: string): Set<string> => {
  const srcs = new Set<string>();

  const res = editorContentSchema.safeParse(JSON.parse(data));

  if (!res.success) {
    return srcs;
  }

  res.data.root.children.forEach((block) => {
    block.children?.forEach((child) => {
      if (child.type === 'file' && typeof child.src === 'string') {
        if (!isBase64DataUrl(child.src)) {
          srcs.add(child.src);
        }
      }
    });
  });

  return srcs;
};
