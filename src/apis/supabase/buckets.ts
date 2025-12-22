import { v4 as uuid } from 'uuid';
import supabase from '@/supabaseClient';
import { imageSchema } from './buckets.types';
import { ApiError } from '@/errors/ApiError';

const EMPTY_IMAGE_NAME = 'empty-image.png' as const;

const getFileName = (path: string) => path.split('/').pop() ?? '';
export const isDefaultImage = (name: string) => name === EMPTY_IMAGE_NAME;

export const uploadImage = async (file: File) => {
  const ext = file.name.split('.').pop();
  const name = uuid();
  const filePath = `${name}.${ext}`;

  const { data, error } = await supabase.storage.from('images').upload(filePath, file);

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

export const deleteImage = async (filePath: string) => {
  const fileName = getFileName(filePath);
  if (isDefaultImage(fileName)) {
    return null;
  }

  const { error } = await supabase.storage.from('images').remove([fileName]);

  if (error) {
    throw new ApiError('DATABASE', { message: 'Failed to delete an image.', cause: error });
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
