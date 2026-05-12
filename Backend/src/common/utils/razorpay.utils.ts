import Razorpay from 'razorpay';
import { generateSignature } from './signature.utils';

const getRazorpayConfig = () => ({
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
});

const getRazorpayClient = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt?: string, notes?: any) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) throw new Error('Razorpay not configured');

  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
    notes: notes || {},
  };

  return await razorpay.orders.create(options);
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) return false;
  // Use trim() to prevent accidental whitespace issues
  const text = `${orderId.trim()}|${paymentId.trim()}`;
  return generateSignature(text, keySecret.trim()) === signature.trim();
};

export const getPaymentDetails = async (paymentId: string) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) throw new Error('Razorpay not configured');
  return await razorpay.payments.fetch(paymentId);
};

export const validateWebhookSignature = (body: string, signature: string, secret: string): boolean => {
  return Razorpay.validateWebhookSignature(body, signature, secret);
};
