import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

const createStorage = (folder: string) =>
  new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: `autoapp/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    }),
  });

export const uploadAvatar = multer({ storage: createStorage('avatars') }).single('avatar');
export const uploadCarPhotos = multer({ storage: createStorage('cars') }).array('photos', 5);
export const uploadPostImages = multer({ storage: createStorage('posts') }).array('images', 4);
export const uploadListingImages = multer({ storage: createStorage('listings') }).array('images', 6);
