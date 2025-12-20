import { v4 as uuid } from 'uuid';
import supabase from '@/supabaseClient';
import { imageSchema } from './buckets.types';

const EMPTY_IMAGE_URL = 'empty-image.png' as const;
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
  filePath = filePath.split('/').at(-1) as string;
  if (filePath === EMPTY_IMAGE_URL) {
    return Promise.resolve(null);
  }

  const { error } = await supabase.storage.from('images').remove([filePath]);

  if (error) {
    throw error;
  }

  return null;
};

export const downloadImage = async (filePath: string | null) => {
  if (!filePath) {
    filePath = EMPTY_IMAGE_URL;
  }

  filePath = filePath.split('/').at(-1) as string;

  const { data, error } = await supabase.storage
    .from('images')
    .download(filePath);

  if (error) {
    throw error;
  }

  const name = filePath.split('/').at(-1) as string;
  const imageFile = new File([data], name, { type: data.type });

  return imageFile;
};
