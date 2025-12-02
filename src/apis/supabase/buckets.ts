import { v4 as uuid } from 'uuid';
import supabase from '@/supabaseClient';

const EMPTY_IMAGE_URL = 'empty-image.png' as const;
export const isDefaultImage = (fileName: string) =>
  fileName === EMPTY_IMAGE_URL ? true : false;

export const uploadPlanGroupThumbnail = async (file: File) => {
  const ext = file.name.split('.').pop();
  const name = uuid();
  const filePath = `${name}.${ext}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file);

  if (error) {
    throw error;
  }

  return data;
};

export const deletePlanGroupThumbnail = async (filePath: string) => {
  if (filePath === EMPTY_IMAGE_URL) {
    return Promise.resolve(null);
  }

  const { data, error } = await supabase.storage
    .from('images')
    .remove([filePath]);

  if (error) {
    throw error;
  }

  return data;
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
