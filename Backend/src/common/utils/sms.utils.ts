import axios from 'axios';

const apiKey = process.env.FAST2SMS_API_KEY || '';
const baseUrl = process.env.FAST2SMS_API_URL || 'https://www.fast2sms.com/dev/bulkV2';

export const sendOTP = async (mobile: string, otp: string) => {
  if (!apiKey) return { success: false, message: 'SMS service not configured' };

  try {
    const payload = {
      route: 'otp',
      variables_values: otp,
      numbers: mobile,
    };

    const response = await axios.post(baseUrl, payload, {
      headers: { authorization: apiKey, 'Content-Type': 'application/json' }
    });

    return { success: response.data.return, message: response.data.message };
  } catch (error) {
    return { success: false, message: 'Failed to send OTP' };
  }
};

export const sendSMS = async (mobile: string, message: string) => {
  if (!apiKey) return { success: false, message: 'SMS service not configured' };

  try {
    const payload = {
      route: 'v3',
      sender_id: 'TXTIND',
      message: message,
      language: 'english',
      route_name: 'v3',
      numbers: mobile,
    };

    const response = await axios.post(baseUrl, payload, {
      headers: { authorization: apiKey, 'Content-Type': 'application/json' }
    });

    return { success: response.data.return, message: response.data.message };
  } catch (error) {
    return { success: false, message: 'Failed to send SMS' };
  }
};
