import cloudinary from '../config/cloudinary';

export const uploadImage = async (filePath: string, folder: string): Promise<{ url: string; publicId: string }> => {
  const result = await cloudinary.uploader.upload(filePath, { folder });
  return { url: result.secure_url, publicId: result.public_id };
};

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
