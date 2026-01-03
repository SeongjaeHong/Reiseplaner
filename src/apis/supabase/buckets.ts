import { v4 as uuid } from 'uuid';
import supabase from '@/supabaseClient';
import { imageSchema } from './buckets.types';
import { ApiError } from '@/errors/ApiError';
import { _guestGuard } from './users';

const EMPTY_IMAGE_NAME = 'empty-image.webp' as const;

const getFileName = (path: string) => path.split('/').pop() ?? '';
export const isDefaultImage = (name: string) => name === EMPTY_IMAGE_NAME;

export const uploadImage = async (file: File) => {
  _guestGuard('CREATE', "Guest can't upload an image.");

  let ext = file.name.split('.').pop() ?? '';
  let processedFile = file;
  if (file.type !== 'image/webp') {
    processedFile = await convertToWebP(file).catch(() => file);
    ext = processedFile.type === 'image/webp' ? 'webp' : ext;
  }

  const name = uuid();
  const filePath = `${name}.${ext}`;

  const { data, error } = await supabase.storage.from('images').upload(filePath, processedFile);

  if (error) {
    throw new ApiError('DATABASE', {
      message: `Failed to upload an image: ${file.name}`,
      cause: error,
    });
  }

  const res = imageSchema.safeParse(data);
  if (!res.success) {
    throw new ApiError('SERVER_RESPONSE', { cause: res.error });
  }

  return res.data;
};

export const deleteImage = async (filePath: string | string[]) => {
  _guestGuard('DELETE', "Guest can't delete an image.");

  let paths: string[];
  if (typeof filePath === 'string') {
    paths = [filePath];
  } else {
    paths = filePath;
  }

  const fileNames = paths
    .map((path) => {
      const name = getFileName(path);
      if (isDefaultImage(name)) {
        return null;
      }
      return name;
    })
    .filter((name) => name !== null);

  if (fileNames.length) {
    const { error } = await supabase.storage.from('images').remove(fileNames);

    if (error) {
      throw new ApiError('DATABASE', {
        message: 'Failed to delete an image from the server.',
        cause: error,
      });
    }
  }

  return null;
};

export const downloadImage = async (filePath: string | null) => {
  const fileName = getFileName(filePath ?? EMPTY_IMAGE_NAME);

  const { data, error } = await supabase.storage.from('images').download(fileName);

  if (error) {
    throw new ApiError('DATABASE', {
      message: 'Failed to download an image.',
      cause: error,
    });
  }

  return new File([data], fileName, { type: data.type });
};

export const getImageURL = (url: string) => {
  const projectId = import.meta.env.VITE_PROJECT_ID as string;
  return `https://${projectId}.supabase.co/storage/v1/object/public/${url}`;
};

const convertToWebP = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== 'string') {
        return reject(new Error('Fehler beim Lesen der Datei als Data-URL.'));
      }

      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const context = canvas.getContext('2d');
        if (!context) {
          return reject(new Error('Canvas-Kontext kann nicht erzeugt werden.'));
        }
        context.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
              const webpFile = new File([blob], newFileName, {
                type: 'image/webp',
                lastModified: Date.now(),
              });

              resolve(webpFile);
            } else {
              reject(new Error('WebP-Konvertierungsfehler.'));
            }
          },
          'image/webp',
          0.8
        );
      };
    };
    reader.onerror = reject;
  });
};
