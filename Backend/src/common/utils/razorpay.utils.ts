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

export const createRazorpayOrder = async (amount: number, currency: string = 'INR', receipt?: string) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) throw new Error('Razorpay not configured');

  const options = {
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
  };

  return await razorpay.orders.create(options);
};

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) return false;
  const text = `${orderId}|${paymentId}`;
  return generateSignature(text, keySecret) === signature;
};

export const getPaymentDetails = async (paymentId: string) => {
  const razorpay = getRazorpayClient();
  if (!razorpay) throw new Error('Razorpay not configured');
  return await razorpay.payments.fetch(paymentId);
};
