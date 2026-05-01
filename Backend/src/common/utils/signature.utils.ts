import * as crypto from 'crypto';

export const createPayload = (data: Record<string, unknown>): string => {
  const sortedKeys = Object.keys(data).sort();
  const parts = sortedKeys.map(key => `${key}=${data[key]}`);
  return parts.join('&');
};

export const generateSignature = (payload: string, secretKey: string): string => {
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
};

export const generateOTPSignature = (data: Record<string, unknown>, secretKey: string): string => {
  const payload = createPayload(data);
  return generateSignature(payload, secretKey);
};
