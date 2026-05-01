'use client';
import React, { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { useCheckoutStore } from '../../Store/checkoutStore';
import useCartStore from '../../Store/cartStore';
import { useAuthStore } from '@/Store/authStore';
import BillingModal from '@/components/Billing/BillingModal';
import { useMediaQuery } from '@mui/material';

const CartActions = ({ onContinue }) => {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const {startCheckout, loading, clearCheckout } = useCheckoutStore();
  const { cartCount } = useCartStore();
  const { accessToken, setLoginPopupOpen } = useAuthStore();
  const [open, setOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width:632px)');
  
  // Disable checkout if cart is empty
  const isDisabled = loading || cartCount === 0;

  const handleCheckout = async () => {
    if (!accessToken) {
      setLoginPopupOpen(true);
      enqueueSnackbar('Please login before starting checkout.', {
        variant: 'warning',
      });
      return;
    }

    try {
      // Clear any existing checkout state before starting new checkout
      clearCheckout();

      await startCheckout();
      router.push('/Checkout');
    } catch (error) {
      console.error('Failed to start checkout:', error);
      if (error?.message?.toLowerCase().includes('not authenticated') || error?.message?.toLowerCase().includes('unauthorized')) {
        setLoginPopupOpen(true);
        enqueueSnackbar('Please login again before starting checkout.', {
          variant: 'warning',
        });
        return;
      }
      enqueueSnackbar(error?.message || 'Failed to start checkout. Please try again.', {
        variant: 'error',
      });
    }
  };

  return (
    <>
      {/* Cart action buttons */}
      <div
        className={`flex gap-4 flex-wrap justify-between ${isMobile ? 'flex-col-reverse' : 'flex-row'}`}
      >
        <button
          onClick={onContinue}
          className="rounded-lg font-[700] text-md px-4 py-2 border-(--primary) hover:bg-(--primary) border-2 cursor-pointer text-(--secondary)"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleCheckout}
          disabled={isDisabled}
          className={`${
            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          } bg-(--primary) border-2 text-md hover:bg-white border-(--primary) font-[700] rounded-lg px-8 py-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} text-(--secondary)`}
        >
          {loading ? 'Processing...' : 'Check out'}
        </button>
      </div>

      {/* Billing Modal */}
      {/* <BillingModal open={open} setOpen={setOpen} /> */}
    </>
  );
};

export default CartActions;

