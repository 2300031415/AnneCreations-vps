import * as path from 'path';
import * as fs from 'fs';
import { Attachment } from 'nodemailer/lib/mailer';
import { sendEmail } from '../../common/utils/email.utils';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTotalValue(order: any, code: 'subtotal' | 'couponDiscount' | 'total') {
  return order.totals?.find((item: any) => item.code === code)?.value ?? 0;
}

export function buildDownloadManifest(order: any) {
  const downloads: Array<{
    productId: string;
    optionId: string;
    productName: string;
    optionName: string;
    fileName: string;
  }> = [];

  for (const productItem of order.products || []) {
    const productId = String(productItem.product?._id || productItem.product || '');
    const productName = productItem.product?.productModel || 'Product';

    for (const optionItem of productItem.options || []) {
      const optionId = String(optionItem.option?._id || optionItem.option || '');
      if (!productId || !optionId) {
        continue;
      }

      const productModel = productItem.product?.productModel || 'Product';
      const sanitizedModel = productModel.replace(/[^a-z0-9]/gi, '_');

      downloads.push({
        productId,
        optionId,
        productName,
        optionName: optionItem.option?.name || 'File',
        fileName: `${sanitizedModel}.zip`,
      });
    }
  }

  return downloads;
}

export function buildReceiptPayload(order: any) {
  const subtotal = getTotalValue(order, 'subtotal') || order.orderTotal || 0;
  const discount = getTotalValue(order, 'couponDiscount');
  const total = getTotalValue(order, 'total') || order.orderTotal || 0;
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
  const customerName = `${order.paymentFirstName || ''} ${order.paymentLastName || ''}`.trim() || 'Customer';
  const rows = (order.products || [])
    .flatMap((productItem: any) =>
      (productItem.options || []).map((optionItem: any) => ({
        productName: productItem.product?.productModel || 'Product',
        optionName: optionItem.option?.name || 'File',
        price: Number(optionItem.price || 0),
      })),
    )
    .map(
      (item: { productName: string; optionName: string; price: number }) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.optionName)}</td>
          <td style="text-align:right;">Rs.${item.price.toFixed(2)}</td>
        </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${escapeHtml(order.orderNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
      h1, h2, p { margin: 0 0 12px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 14px; }
      th { background: #f3f4f6; text-align: left; }
      .summary { margin-top: 16px; width: 320px; margin-left: auto; }
      .summary td { border: none; padding: 4px 0; }
      .summary td:last-child { text-align: right; }
    </style>
  </head>
  <body>
    <h1>Anne Creations Receipt</h1>
    <p><strong>Order Number:</strong> ${escapeHtml(order.orderNumber)}</p>
    <p><strong>Order Date:</strong> ${escapeHtml(orderDate)}</p>
    <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
    <p><strong>Payment Method:</strong> ${escapeHtml(order.paymentMethod || order.paymentCode || 'Paid')}</p>
    <p><strong>Status:</strong> ${escapeHtml(order.orderStatus || 'paid')}</p>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th>Machine / Option</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <table class="summary">
      <tr><td>Subtotal</td><td>Rs.${subtotal.toFixed(2)}</td></tr>
      <tr><td>Discount</td><td>Rs.${discount.toFixed(2)}</td></tr>
      <tr><td><strong>Total</strong></td><td><strong>Rs.${total.toFixed(2)}</strong></td></tr>
    </table>
  </body>
</html>`;

  return {
    fileName: `receipt-${order.orderNumber}.html`,
    contentType: 'text/html',
    html,
  };
}

export function buildEmailAttachments(order: any): Attachment[] {
  const attachments: Attachment[] = [];
  const receipt = buildReceiptPayload(order);

  attachments.push({
    filename: receipt.fileName,
    content: receipt.html,
    contentType: receipt.contentType,
  });

  for (const productItem of order.products || []) {
    for (const optionItem of productItem.options || []) {
      if (!optionItem?.uploadedFilePath) {
        continue;
      }

      const fullPath = path.join(process.cwd(), optionItem.uploadedFilePath);
      if (!fs.existsSync(fullPath)) {
        continue;
      }

      const productModel = (productItem.product as any)?.productModel || 'Product';
      const optionName = (optionItem.option as any)?.name || 'file';
      const sanitizedModel = productModel.replace(/[^a-z0-9]/gi, '_');
      const sanitizedOption = optionName.replace(/[^a-z0-9]/gi, '_');
      const filename = `${sanitizedModel}.zip`;

      attachments.push({
        filename: filename,
        path: fullPath,
        contentType: optionItem.mimeType || 'application/octet-stream',
      });
    }
  }

  return attachments;
}

export async function sendOrderFulfillmentEmail(order: any) {
  const customerEmail = order.customer?.email;
  if (!customerEmail) {
    return false;
  }

  const customerName =
    `${order.paymentFirstName || order.customer?.firstName || ''} ${order.paymentLastName || order.customer?.lastName || ''}`.trim() ||
    'Customer';

  // Build the receipt HTML to use as email body (NOT as an attachment)
  const receipt = buildReceiptPayload(order);

  // Only attach the ZIP download files — NOT the HTML receipt
  const zipAttachments = buildEmailAttachments(order).filter(
    (a: any) => !String(a.filename || '').endsWith('.html')
  );

  await sendEmail({
    to: customerEmail,
    subject: `Anne Creations Receipt - Order ${order.orderNumber}`,
    template: receipt.html, // Use the receipt HTML directly as the email body
    data: {},               // Already fully built, no template vars needed
    attachments: zipAttachments,
  });

  return true;
}
