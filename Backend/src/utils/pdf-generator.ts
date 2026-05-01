import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface ProductForCatalog {
  productModel: string;
  sku?: string;
  stitches?: string;
  dimensions?: string;
  colourNeedles?: string;
  image?: string;
}

export async function generateProductPDF(product: ProductForCatalog): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const margin = 50;
  let yPosition = height - margin;

  // Header
  page.drawText(`Anne Creations - Product Details`, {
    x: margin,
    y: yPosition,
    size: 20,
    font: titleFont,
    color: rgb(0.19, 0.09, 0.03), // Primary color dark
  });
  yPosition -= 40;

  // Design Code
  page.drawText(`Design Code: ${product.productModel}`, {
    x: margin,
    y: yPosition,
    size: 16,
    font: boldFont,
  });
  yPosition -= 30;

  // Image
  if (product.image) {
    try {
      const relativePath = product.image.startsWith('/') ? product.image.substring(1) : product.image;
      const possiblePaths = [
        path.join(process.cwd(), relativePath),
        path.join(process.cwd(), 'catalog', 'product', path.basename(relativePath)),
      ];

      let fullPath = possiblePaths.find(p => fs.existsSync(p));
      
      if (fullPath) {
        const imageBytes = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase();
        let image;
        if (ext === '.png') image = await pdfDoc.embedPng(imageBytes);
        else if (ext === '.jpg' || ext === '.jpeg') image = await pdfDoc.embedJpg(imageBytes);

        if (image) {
          const maxWidth = width - 2 * margin;
          const maxHeight = 350;
          const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
          const iWidth = image.width * scale;
          const iHeight = image.height * scale;

          page.drawImage(image, {
            x: margin + (maxWidth - iWidth) / 2,
            y: yPosition - iHeight,
            width: iWidth,
            height: iHeight,
          });
          yPosition -= iHeight + 30;
        }
      } else {
        console.warn(`PDF Generation: Image not found at ${possiblePaths.join(' OR ')}`);
      }
    } catch (e) {
      console.error('PDF Image error:', e);
    }
  }

  // Info Table
  const drawRow = (label: string, value: string) => {
    if (!value) return;
    page.drawText(label, { x: margin, y: yPosition, size: 12, font: boldFont });
    page.drawText(value, { x: margin + 120, y: yPosition, size: 12, font: regularFont });
    yPosition -= 20;
  };

  drawRow('SKU:', product.sku || 'N/A');
  drawRow('Stitches:', product.stitches || 'N/A');
  drawRow('Dimensions:', product.dimensions || 'N/A');
  drawRow('Colours:', product.colourNeedles || 'N/A');

  // Footer
  page.drawText(`Generated on ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: 50,
    size: 10,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
