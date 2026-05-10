'use client'
import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button,
  useMediaQuery
} from "@mui/material";
import { useSnackbar } from "notistack";
import CartItemRow from "../Cart/CartItemRow";
import { fieldStyles } from "../Auth/Login/LoginForm";

const OrderSummary = ({
  CheckoutData,
  applyCoupon,
  loading,
  coupon,
  applyCouponError,
  checkoutMessage,
  orderId,
  autoCouponData,
  autoApplyCoupon,
  manualCouponApplied,
  removeCoupon,
  couponDetails,
  coupons // ✅ Receive the list of all active coupons
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [couponCode, setCouponCode] = useState("");
  const [autoCouponMessage, setAutoCouponMessage] = useState("");

  const products = CheckoutData?.products || [];
  const totalAmount = CheckoutData?.totalAmount || 0;
  const isMobile = useMediaQuery('(max-width:640px)');

  // ✅ Get the applied coupon code directly from store for consistent UI
  const currentAppliedCode = couponDetails?.code || couponDetails?.coupon?.code;
  const hasCoupon = !!currentAppliedCode;

  // ✅ Handle auto coupon data and messages
  useEffect(() => {
    if (autoCouponData) {
      // Check if auto coupon was successfully applied
      if (autoCouponData.applied) {
        const message = autoCouponData.coupon?.reason || `Coupon "${autoCouponData.coupon?.code}" applied! You saved ₹${autoCouponData.calculation?.discountAmount}`;
        setAutoCouponMessage(message);
      } else if (autoCouponData.reason) {
        // Coupon not applied, show reason (e.g., "Add ₹30.00 more...")
        setAutoCouponMessage(autoCouponData.reason);
      }
    } else {
      setAutoCouponMessage("");
    }
  }, [autoCouponData, manualCouponApplied]);

  // ✅ Use totals directly from CheckoutData if available, otherwise calculate
  const displayTotals = CheckoutData?.subtotal !== undefined
    ? {
      subtotal: CheckoutData.subtotal,
      discount: CheckoutData.discount || 0,
      total: CheckoutData.orderTotal || CheckoutData.total || totalAmount,
    }
    : (() => {
      // Fallback calculation logic for backward compatibility
      const autoDiscount =
        autoCouponData?.calculation?.discountAmount && !manualCouponApplied
          ? autoCouponData.calculation.discountAmount
          : 0;

      return couponApplied && coupon
        ? {
          subtotal: coupon.originalAmount || coupon.originalTotal || totalAmount,
          discount: coupon.discountAmount || 0,
          total: coupon.finalAmount || coupon.finalTotal || totalAmount,
        }
        : {
          subtotal: totalAmount,
          discount: autoDiscount,
          total: totalAmount - autoDiscount,
        };
    })();

  const [autoApplyAttempted, setAutoApplyAttempted] = useState(false);

  // ✅ Auto apply coupon once when component mounts and orderId is available
  useEffect(() => {
    // Only attempt if order is ready, no manual coupon set, and we haven't tried yet
    if (orderId && !hasCoupon && coupons && coupons.length > 0 && !manualCouponApplied && !autoApplyAttempted) {
      // Find first eligible coupon based on subtotal
      const eligibleCoupon = coupons.find(c => displayTotals.subtotal >= c.minAmount);
      if (eligibleCoupon) {
        setAutoApplyAttempted(true);
        handleApplyCoupon(eligibleCoupon.code);
      }
    }
  }, [orderId, hasCoupon, coupons, displayTotals.subtotal, manualCouponApplied, autoApplyAttempted]);

  const handleApplyCoupon = async (forcedCode = null) => {
    const code = (forcedCode || couponCode).trim();
    if (!code) return;

    const isAlreadyApplied = currentAppliedCode && 
      String(currentAppliedCode).toUpperCase() === String(code).toUpperCase();
    
    // ✅ If clicking the SAME coupon that's already applied, remove it (Toggle off)
    if (forcedCode && isAlreadyApplied) {
      await handleRemoveCoupon();
      return;
    }

    try {
      // ✅ Always attempt to remove any existing coupon to be 100% sure backend is clear
      await removeCoupon(orderId);
      
      // Small delay to allow DB to settle (reduced from 500ms)
      await new Promise(resolve => setTimeout(resolve, 200));

      const response = await applyCoupon({ orderId, couponCode: code });

      if (response?.coupon) {
        setCouponCode("");
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || applyCouponError || "Failed to apply coupon";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponCode("");
    await removeCoupon(orderId);
  };

  // ✅ Auto remove coupon after 30 minutes
  useEffect(() => {
    if (hasCoupon) {
      const timer = setTimeout(() => handleRemoveCoupon(), 30 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCoupon]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 1. TOP BOX: Products Table (Moved Up) */}
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#311807', fontFamily: 'Poppins', ml: 1 }}>
          Items in your Order
        </Typography>
        {!isMobile ? (
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              border: "1px solid rgba(0,0,0,0.08)",
              maxWidth: "100%",
              bgcolor: "#fff",
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  {["Design Image", "Design Code", "Price"].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: "#311807",
                        fontWeight: "800",
                        fontSize: 14,
                        py: 2,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      Your cart is empty.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((item, idx) => (
                    <CartItemRow key={item.product?._id || idx} item={item} checkout />
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box className="flex flex-col gap-4">
            {products.length === 0 ? (
              <Typography textAlign="center" py={6} sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #eee' }}>
                Your cart is empty.
              </Typography>
            ) : (
              products.map((item, idx) => (
                <CartItemRow key={item.product?._id || idx} item={item} checkout />
              ))
            )}
          </Box>
        )}
      </Box>

      {/* 2. BOTTOM BOX: Checkout Summary & Coupon (Moved Down) */}
      <Box sx={{
        p: { xs: 2.5, sm: 4 },
        border: '2px solid var(--primary)',
        borderRadius: 4,
        bgcolor: '#fff',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        width: '100%'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Totals Section */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2.5, color: '#311807', fontFamily: 'Poppins' }}>
              Checkout Summary
            </Typography>
            <ul className="space-y-3">
              <li className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>₹{displayTotals.subtotal}</span>
              </li>
              <li className="flex justify-between text-green-600 font-bold">
                <span>Total Savings</span>
                <span>-₹{displayTotals.discount}</span>
              </li>
              <li className="flex justify-between border-t-2 pt-4 border-(--primary) mt-4 font-black text-2xl">
                <span className="text-[#311807]">Payable Amount</span>
                <span className="text-[#311807]">₹{displayTotals.total}</span>
              </li>
            </ul>
          </Box>

          {/* Coupon Section */}
          <Box sx={{ flex: 1 }}>
            <Typography
              component="label"
              htmlFor="couponCode"
              sx={{
                fontSize: 15,
                mb: 2,
                display: "block",
                color: "var(--secondary)",
                fontWeight: 700,
                fontFamily: 'Poppins'
              }}
            >
              Have a Coupon? Apply here
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'start' }}>
              <TextField
                id="couponCode"
                name="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                sx={{
                  ...fieldStyles,
                  flexGrow: 1,
                  '& .MuiInputBase-root': { height: '48px', borderRadius: '10px' }
                }}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={() => handleApplyCoupon()}
                disabled={loading}
                sx={{
                  backgroundColor: 'var(--primary)',
                  color: '#311807',
                  fontWeight: 800,
                  px: 3,
                  height: '48px',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '15px',
                  boxShadow: 'none',
                  '&:hover': { backgroundColor: 'var(--secondary)', color: 'white' },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? "..." : "Apply"}
              </Button>
            </Box>

            {/* ✅ Available Coupons List */}
            {coupons && coupons.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 800, color: '#311807', fontFamily: 'Poppins', opacity: 0.8 }}>
                  Available Offers
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {coupons.map((c) => {
                    const isApplied = currentAppliedCode && 
                      String(currentAppliedCode).toUpperCase() === String(c.code).toUpperCase();
                    const isEligible = displayTotals.subtotal >= c.minAmount;

                    return (
                      <Box
                        key={c._id}
                        onClick={() => handleApplyCoupon(c.code)}
                        sx={{
                          p: 2,
                          border: `1.5px solid ${isApplied ? 'var(--primary)' : '#e0e0e0'}`,
                          borderRadius: '16px',
                          bgcolor: isApplied ? 'rgba(204, 216, 143, 0.05)' : '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          '&:hover': {
                            borderColor: 'var(--primary)',
                            bgcolor: isApplied ? 'rgba(204, 216, 143, 0.08)' : '#fafafa'
                          }
                        }}
                      >
                        {/* Radio-style Circle */}
                        <Box sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          border: `2px solid ${isApplied ? 'var(--primary)' : '#ccc'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isApplied && (
                            <Box sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: 'var(--primary)'
                            }} />
                          )}
                        </Box>

                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 800, color: 'var(--secondary)', fontSize: '14px', letterSpacing: '0.5px' }}>
                              {c.code}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#311807' }}>
                            Get {c.discount}{c.type === 'P' ? '%' : '₹'} OFF
                          </Typography>
                          <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
                            Min order: ₹{c.minAmount}
                          </Typography>
                        </Box>

                        {!isEligible && (
                          <Box sx={{ textAlign: 'right' }}>
                             <Typography sx={{ fontSize: '10px', color: '#ed6c02', fontWeight: 'bold' }}>
                              Add ₹{c.minAmount - displayTotals.subtotal}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {/* Messages */}
            {(couponDetails?.coupon?.reason || checkoutMessage || autoCouponMessage) && (
              <Box sx={{ mt: 1.5 }}>
                {couponDetails?.coupon?.reason && (
                  <Typography sx={{ fontSize: 13, color: "#d32f2f", fontWeight: 600 }}>
                    {couponDetails.coupon.reason}
                  </Typography>
                )}
                {checkoutMessage && (
                  <Typography sx={{ fontSize: 13, color: checkoutMessage.includes("saved") ? "#2e7d32" : "#ed6c02", fontWeight: "bold" }}>
                    {checkoutMessage}
                  </Typography>
                )}
                {autoCouponMessage && !checkoutMessage && (
                  <Typography sx={{ fontSize: 13, color: autoCouponMessage.includes("saved") ? "#2e7d32" : "#ed6c02", fontWeight: "bold" }}>
                    {autoCouponMessage}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default OrderSummary;

