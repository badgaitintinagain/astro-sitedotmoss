import { v2 as cloudinary } from 'cloudinary';

// ใช้ import.meta.env สำหรับ Astro เพื่อโหลดค่าจาก .env.local อย่างถูกต้อง
cloudinary.config({ 
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME || 'ddiv7qbkc', 
  api_key: import.meta.env.CLOUDINARY_API_KEY || '453924282784974', 
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary;
