import { uploadPlanGroupThumbnail } from '@/apis/supabase/buckets';
import {
  insertPlanContents,
  type Content,
  type ImageContent,
} from '@/apis/supabase/planContents';

type UseAddImage = {
  planId: number;
  planContents: Content[] | null;
  setPlanContents: React.Dispatch<React.SetStateAction<Content[] | null>>;
};
export function useAddImage({
  planId,
  planContents,
  setPlanContents,
}: UseAddImage) {
  return async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      return null;
    }

    const { fullPath: filePath } = await uploadPlanGroupThumbnail(file);

    if (!filePath) {
      return null;
    }

    const dataURL = await readFileAsDataURL(file);
    const { width, height } = await getImageDimensions(dataURL);
    const newContent: ImageContent = {
      id: planContents ? planContents.length + 1 : 1,
      type: 'file',
      data: filePath,
      width,
      height,
    };
    setPlanContents((prev) => (prev ? [...prev, newContent] : [newContent]));
    const newContents = planContents
      ? [...planContents, newContent]
      : [newContent];
    await insertPlanContents(planId, newContents);
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
