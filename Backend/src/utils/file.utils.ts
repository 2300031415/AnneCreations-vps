import * as fs from 'fs';
import * as path from 'path';
import { BadRequestException } from '@nestjs/common';

/**
 * Validates and saves a base64 or buffer to disk
 */
export async function saveFile(
  file: any, // Express.Multer.File
  subDir: string = 'product',
  fileName: string = ''
): Promise<string> {
  const catalogPath = path.join(process.cwd(), 'catalog');
  const targetDir = path.join(catalogPath, subDir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const finalFileName = fileName || `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
  const filePath = path.join(targetDir, finalFileName);

  try {
    fs.writeFileSync(filePath, file.buffer);
    return `catalog/${subDir.replace(/\\/g, '/')}/${finalFileName}`;
  } catch (err) {
    console.error('File save error:', err);
    throw new BadRequestException(`Failed to save file: ${err.message}`);
  }
}

/**
 * Deletes a file given its public path e.g. /catalog/product/abc.jpg
 */
export function deleteFile(publicPath: string): boolean {
  if (!publicPath || !publicPath.startsWith('/catalog/')) {
    return false;
  }

  const relativePath = publicPath.replace(/^\/catalog\//, '');
  const catalogPath = path.join(process.cwd(), 'catalog');
  const fullPath = path.join(catalogPath, relativePath);

  try {
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`File delete error for ${fullPath}:`, err);
    return false;
  }
}

export const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/gif',
  'image/webp',
];

export const allowedZipTypes = [
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream', // Often zips appear as this
];
