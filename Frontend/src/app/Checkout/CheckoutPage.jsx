'use client';
import { useAuthStore } from '@/Store/authStore';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { keyframes } from '@mui/system';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BreadCrum from '@/components/BreadCrum/BreadCrum';
import { useCheckoutStore } from '@/Store/checkoutStore';
import OrderSummary from './OrderSummary';
import { usePaymentStore } from '@/Store/PaymentStore';
import useCartStore from '@/Store/cartStore';
import axiosClient from '@/lib/axiosClient';
import useActiveCoupon from '@/hook/useActiveCoupon';
import { useWalletStore } from '@/Store/walletStore';
import { FaWallet } from 'react-icons/fa';
import { Alert } from '@mui/material';

// 🌟 Glow animation keyframes
const glowPulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(150, 211, 88, 0.6); /* soft green glow */
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 25px rgba(150, 211, 88, 0.9); /* brighter glow */
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 10px rgba(150, 211, 88, 0.6);
  }
`;


const Page = () => {
  const { accessToken } = useAuthStore();
  const {
    fetchCheckoutStatus,
    applyCoupon,
    loading,
    coupon,
    applyCouponError,
    checkoutStatus,
    checkoutMessage,
    orderId,
    cancelCheckout,
    autoCouponData,
    autoApplyCoupon,
    manualCouponApplied,
    removeCoupon,
    couponDetails,
    clearCheckout,
    resetLoading
  } = useCheckoutStore();

  const { balance, payWithWallet, fetchWallet } = useWalletStore();

  const { createPaymentInfo, verifyPayment } = usePaymentStore();
  const { clearCartState } = useCartStore();
  const { coupons } = useActiveCoupon();
  const router = useRouter();

  const [openDialog, setOpenDialog] = useState(false);
  const [paymentInfoState, setPaymentInfoState] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'wallet'

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Cart', href: '/Cart' },
    { label: 'Checkout', href: '/Checkout' },
  ];

  useEffect(() => {
    if (loading && orderId && checkoutStatus) {
      resetLoading();
    }
  }, [loading, orderId, checkoutStatus]);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (orderId && !checkoutStatus) {
      fetchCheckoutStatus(orderId).catch((error) => {
        console.error('Failed to fetch checkout status:', error);
        clearCheckout();
        router.push('/Cart');
      });
    } else if (!orderId && !isSuccess) {
      router.push('/Cart');
    }
  }, [orderId, checkoutStatus, isSuccess]);

  useEffect(() => {
    if (accessToken) {
      fetchWallet();
    }
  }, [accessToken, fetchWallet]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const triggerDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const downloadPurchasedFiles = async (downloads = []) => {
    for (const item of downloads) {
      if (!item?.productId || !item?.optionId) {
        continue;
      }

      const response = await axiosClient.get(
        `/api/downloads/${item.productId}/${item.optionId}`,
        { responseType: 'blob' },
      );

      triggerDownload(
        new Blob([response.data], { type: response.data?.type || 'application/octet-stream' }),
        item.fileName || `${item.productName || 'product'}_${item.optionName || 'file'}.zip`,
      );
    }
  };

  const handlePaymentSuccess = async (result) => {
    setIsSuccess(true);
    await downloadPurchasedFiles(result?.downloads || []);
    clearCartState();
    clearCheckout();
    router.push('/Profile?tab=downloads');
  };

  const handleDialogAgree = async () => {
    setOpenDialog(false);
    if (!orderId) return;

    let paymentData;
    try {
      paymentData = await createPaymentInfo(orderId);
      if (!paymentData) {
        alert('Could not initialize payment details. Please try again or contact support.');
        return;
      }
      setPaymentInfoState(paymentData);
    } catch (err) {
      console.error('Payment creation failed:', err);
      alert('Unable to initiate payment: ' + (err.response?.data?.message || err.message));
      return;
    }

    // Check if payment is required
    if (paymentData?.paymentRequired === false) {
      try {
        if (!paymentData?.completed || !paymentData?.postPaymentData) {
          throw new Error('Order completed but receipt data is missing');
        }

        await handlePaymentSuccess(paymentData.postPaymentData);
      } catch (err) {
        console.error('Failed to complete order:', err);
        alert('Failed to complete order. Please try again.');
      }
      return;
    }

    // Payment is required - initialize Razorpay and continue as normal
    const res = await loadRazorpayScript();
    if (!res || !window.Razorpay) return alert('Razorpay SDK failed to load.');

    const options = {
      key: paymentData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
      amount: paymentData.amount,
      currency: paymentData.currency || 'INR',
      name: 'Anne Creations',
      notes: { merchant_order_id: paymentData.orderNumber },
      description: 'Computer Embroidery Designs',
      order_id: paymentData.razorpayOrderId,
      theme: {
        color: '#ccd88f',
      },
      handler: async (response) => {
        setVerifying(true);
        const payload = {
          orderId,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        };
        try {
          const result = await verifyPayment(payload);
          if (!result?.success) {
            throw new Error('Payment verification failed');
          }

          await handlePaymentSuccess(result);
        } catch (err) {
          console.error('Payment Verification Failed:', err);
          alert(err.response?.data?.message || err.message || 'Payment verification failed.');
        } finally {
          setVerifying(false);
        }
      },
      prefill: {
        name: paymentData.customerName || '',
        email: paymentData.customerEmail || '',
        contact: paymentData.customerContact || '',
      },
      theme: { color: '#ccd88f' },
    };

    new window.Razorpay(options).open();
  };

  const handleDialogCancel = () => setOpenDialog(false);
  
  const handleContinue = () => {
    if (paymentMethod === 'wallet') {
      if (balance < (checkoutStatus?.totalAmount || 0)) {
        alert('Insufficient wallet balance. Please add money or choose online payment.');
        return;
      }
      handleWalletPayment();
    } else {
      setOpenDialog(true);
    }
  };

  const handleWalletPayment = async () => {
    if (!orderId) return;
    setVerifying(true);
    try {
      const result = await payWithWallet(orderId);
      await handlePaymentSuccess(result);
    } catch (err) {
      console.error('Wallet payment failed:', err);
      alert(err.message || 'Wallet payment failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelCheckout = async () => {
    try {
      if (orderId) {
        await cancelCheckout(orderId);
      }
      clearCheckout();
      router.push('/Cart');
    } catch (error) {
      console.error('Failed to cancel checkout:', error);
      clearCheckout();
      router.push('/Cart');
    }
  };

  if (verifying) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress size={60} sx={{ color: '#ccd88f' }} />
        <Typography variant="h6" sx={{ mt: 2, color: '#311807' }}>
          Verifying Payment, Please wait...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <BreadCrum crumbs={crumbs} />


      <Container sx={{ py: { xs: 3, sm: 5 } }}>
        <Typography
          variant="h1"
          fontSize={{ xs: '24px', sm: '28px', md: '32px' }}
          sx={{
            mb: { xs: 4, sm: 6 },
            fontWeight: 'bold',
            fontFamily: 'Poppins',
            color: '#311807',
            textAlign: 'center',
          }}
        >
          Checkout
        </Typography>

        {!accessToken ? (
          <Box className="text-center text-base sm:text-lg text-gray-600 py-10">
            Please login to checkout.
          </Box>
        ) : !orderId ? (
          <Box className="text-center text-base sm:text-lg text-gray-600 py-10">
            No active order found.
          </Box>
        ) : (
          checkoutStatus && (
            <>
              <OrderSummary
                CheckoutData={checkoutStatus}
                applyCoupon={applyCoupon}
                loading={loading}
                applyCouponError={applyCouponError}
                coupon={coupon}
                checkoutMessage={checkoutMessage}
                orderId={orderId}
                autoApplyCoupon={autoApplyCoupon}
                autoCouponData={autoCouponData}
                manualCouponApplied={manualCouponApplied}
                removeCoupon={removeCoupon}
                couponDetails={couponDetails}
                coupons={coupons}
              />

              <Box sx={{ mt: 6 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, color: '#311807', fontFamily: 'Poppins' }}>
                  Select Payment Method
                </Typography>
                <Stack spacing={2}>
                  {/* Online Payment Option */}
                  <Box
                    onClick={() => setPaymentMethod('online')}
                    sx={{
                      p: 3,
                      border: `2px solid ${paymentMethod === 'online' ? 'var(--primary)' : '#eee'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: paymentMethod === 'online' ? 'rgba(204, 216, 143, 0.05)' : '#fff',
                      transition: 'all 0.3s ease',
                      '&:hover': { borderColor: 'var(--primary)', transform: 'translateY(-2px)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '12px', 
                          bgcolor: 'var(--primary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--secondary)'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        </Box>
                        <Box>
                          <Typography fontWeight="bold">Online Payment</Typography>
                          <Typography variant="body2" color="text.secondary">Razorpay (Cards, UPI, NetBanking)</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        border: '2px solid',
                        borderColor: paymentMethod === 'online' ? 'var(--primary)' : '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {paymentMethod === 'online' && <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'var(--primary)' }} />}
                      </Box>
                    </Box>
                  </Box>

                  {/* Wallet Payment Option */}
                  <Box
                    onClick={() => setPaymentMethod('wallet')}
                    sx={{
                      p: 3,
                      border: `2px solid ${paymentMethod === 'wallet' ? 'var(--primary)' : '#eee'}`,
                      borderRadius: '16px',
                      cursor: 'pointer',
                      bgcolor: paymentMethod === 'wallet' ? 'rgba(204, 216, 143, 0.05)' : '#fff',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': { borderColor: 'var(--primary)', transform: 'translateY(-2px)' }
                    }}
                  >
                    {balance >= (checkoutStatus?.totalAmount || 0) && (
                       <Box sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 60, 
                        bgcolor: '#4caf50', 
                        color: 'white', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: '20px', 
                        fontSize: '11px',
                        fontWeight: 'bold',
                        animation: `${glowPulse} 2s infinite`
                      }}>
                        Recommended
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                          width: 48, 
                          height: 48, 
                          borderRadius: '12px', 
                          bgcolor: 'var(--primary)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--secondary)'
                        }}>
                          <FaWallet size={20} />
                        </Box>
                        <Box>
                          <Typography fontWeight="bold">Anne Wallet</Typography>
                          <Typography variant="body2" color={balance < (checkoutStatus?.totalAmount || 0) ? "error" : "text.secondary"}>
                            Balance: ₹{balance} {balance < (checkoutStatus?.totalAmount || 0) && "(Insufficient)"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        border: '2px solid',
                        borderColor: paymentMethod === 'wallet' ? 'var(--primary)' : '#ccc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {paymentMethod === 'wallet' && <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'var(--primary)' }} />}
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={2}
                justifyContent="space-between"
                sx={{ mt: 6, alignItems: { xs: 'stretch', sm: 'center' } }}
              >
                <Button
                  variant="outlined"
                  onClick={handleCancelCheckout}
                  disabled={loading}
                  sx={{
                    borderColor: '#ccc',
                    color: 'var(--secondary)',
                    fontWeight: 600,
                    px: { xs: 2, sm: 4 },
                    py: 1.8,
                    borderRadius: '12px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#f5f5f5', borderColor: '#999' },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {loading ? 'Cancelling...' : 'Cancel Checkout'}
                </Button>

                <Button
                  onClick={handleContinue}
                  disabled={loading || (paymentMethod === 'wallet' && balance < (checkoutStatus?.totalAmount || 0))}
                  variant="contained"
                  sx={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--secondary)',
                    fontWeight: 700,
                    fontSize: '16px',
                    px: { xs: 2, sm: 6 },
                    py: 2,
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: '0 10px 20px rgba(204, 216, 143, 0.3)',
                    '&:hover': { backgroundColor: 'var(--secondary)', color: 'white' },
                    width: { xs: '100%', sm: 'auto' },
                    '&.Mui-disabled': { bgcolor: '#eee', color: '#999' }
                  }}
                >
                  {paymentMethod === 'online' ? 'Pay Online Now' : `Pay ₹${checkoutStatus.totalAmount} via Wallet`}
                </Button>
              </Stack>

              <Dialog open={openDialog} onClose={handleDialogCancel} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontSize: { xs: 18, sm: 20 } }}>Terms & Conditions</DialogTitle>
                <DialogContent>
                  <Typography sx={{ fontSize: { xs: 14, sm: 16 } }}>
                    The purchased products will be available in downloads. If you cannot find them in your downloads, please report the issue via WhatsApp. Do not purchase the same products again. No refunds/exchange will be issued for any digital goods purchased.
                  </Typography>
                  <Typography sx={{ mt: 2, fontSize: { xs: 14, sm: 16 } }}>
                    మీరు కొనుగోలు చేసిన డిజైన్లు మీ డౌన్లోడ్స్ లో ఉంటాయి. మీకు డిజైన్ కనపడకుంటే దయచేసి మళ్లీ కొనవద్దు. వాట్సాప్ లో మమ్మల్ని సంప్రదించండి. కొనుగోలు చేసిన డిజైన్లకు రీఫండ్/మార్పులు చేయబడవు.
                  </Typography>
                  <Box sx={{ mt: 3, p: 2, bgcolor: '#FFF5F5', borderRadius: 1, border: '1px solid #FFCDD2' }}>
                    <Typography sx={{ fontWeight: 'bold', color: '#D32F2F', fontSize: { xs: 13, sm: 15 } }}>
                      Note: The product download link will expire after 90 days from the payment date.
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: 'bold', color: '#D32F2F', fontSize: { xs: 13, sm: 15 } }}>
                      గమనిక: చెల్లింపు తేదీ నుండి 90 రోజుల తర్వాత ఉత్పత్తి డౌన్‌లోడ్ లింక్ గడువు ముగుస్తుంది.
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleDialogCancel} color="error" sx={{ fontSize: { xs: 12, sm: 14 } }}>
                    Cancel
                  </Button>
                  <Button onClick={handleDialogAgree} sx={{ backgroundColor: '#ccd88f', color: '#311807', fontSize: { xs: 12, sm: 14 } }}>
                    Agree
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )
        )}
      </Container>
    </>
  );
};

export default Page;

