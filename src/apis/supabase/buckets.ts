import { v4 as uuid } from 'uuid';
import supabase from '@/supabaseClient';
import { imageSchema } from './buckets.types';

const EMPTY_IMAGE_URL = 'empty-image.png' as const;

const getFileName = (path: string) => path.split('/').pop() ?? '';

export const isDefaultImage = (fileName: string) =>
  fileName === EMPTY_IMAGE_URL ? true : false;

export const uploadImage = async (file: File) => {
  const ext = file.name.split('.').pop();
  const name = uuid();
  const filePath = `${name}.${ext}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  return imageSchema.parse(data);
};

export const deleteImage = async (filePath: string) => {
  filePath = getFileName(filePath);
  if (filePath === EMPTY_IMAGE_URL) {
    return null;
  }

  const { error } = await supabase.storage.from('images').remove([filePath]);

  if (error) {
    throw error;
  }

  return null;
};

export const downloadImage = async (filePath: string | null) => {
  const fileName = getFileName(filePath ?? EMPTY_IMAGE_URL);

  const { data, error } = await supabase.storage
    .from('images')
    .download(fileName);

  if (error) {
    throw error;
  }

  return new File([data], fileName, { type: data.type });
};
