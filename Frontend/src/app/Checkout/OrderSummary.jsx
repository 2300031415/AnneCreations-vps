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
  couponDetails
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [autoCouponMessage, setAutoCouponMessage] = useState("");

  const products = CheckoutData?.products || [];
  const totalAmount = CheckoutData?.totalAmount || 0;
  const isMobile = useMediaQuery('(max-width:640px)');

  // ✅ Sync local state with store state for manual coupons
  useEffect(() => {
    if (manualCouponApplied && couponDetails?.coupon) {
      setCouponApplied(true);
      setAppliedCoupon(couponDetails.coupon.code);
    } else if (!manualCouponApplied) {
      setCouponApplied(false);
      setAppliedCoupon("");
    }
  }, [manualCouponApplied, couponDetails]);

  // ✅ Auto apply coupon once when component mounts and orderId is available
  // Only call if there's no existing coupon data from checkout status
  useEffect(() => {
    if (orderId && !manualCouponApplied && !couponDetails && !autoCouponData) {
      autoApplyCoupon(orderId);
    }
  }, [orderId, manualCouponApplied, couponDetails, autoCouponData]);

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

  // ✅ Handle manual coupon apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await applyCoupon({ orderId, couponCode });

      // For manual applyCoupon, success response contains coupon and calculation
      if (response?.coupon && response?.calculation) {
        // Success - no snackbar needed, status will show in UI
        setCouponApplied(true);
        setAppliedCoupon(couponCode);
        setCouponCode("");
      }
    } catch (error) {
      // Manual applyCoupon throws error for validation failures
      // Use snackbar for errors so it doesn't override existing warning messages
      const errorMessage = error?.response?.data?.message || applyCouponError || "Failed to apply coupon";
      enqueueSnackbar(errorMessage, { variant: "error" });
      setCouponApplied(false);
      setAppliedCoupon("");
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setAppliedCoupon("");
    setCouponCode("");
    removeCoupon();
  };

  // ✅ Auto remove coupon after 30 minutes
  useEffect(() => {
    if (couponApplied) {
      const timer = setTimeout(() => handleRemoveCoupon(), 30 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [couponApplied]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* 1. TOP BOX: Order Summary & Coupon together */}
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
                onClick={handleApplyCoupon}
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

      {/* 2. BOTTOM BOX: Products Table */}
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
    </Box>
  );
};

export default OrderSummary;

