'use client';

import React, { useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { FaWallet, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import { useWalletStore } from '@/Store/walletStore';
import { useAuthStore } from '@/Store/authStore';
import { Alert } from '@mui/material';

const WalletTab = () => {
    const { user, accessToken, setLoginPopupOpen } = useAuthStore();
    const { balance, transactions, fetchWallet, createAddMoneyOrder, verifyAddMoney, isLoading, error } = useWalletStore();
    const [openAddMoney, setOpenAddMoney] = React.useState(false);
    const [amount, setAmount] = React.useState('');

    useEffect(() => {
        if (!accessToken) {
            return;
        }

        fetchWallet().catch((err) => {
            console.error('Wallet fetch failed:', err);
        });
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

    const handleAddMoney = async () => {
        if (!accessToken) {
            setLoginPopupOpen(true);
            alert('Please login before adding money to your wallet.');
            return;
        }

        if (!amount || isNaN(amount) || amount <= 0) return;

        try {
            // 1. Create order on backend
            const orderData = await createAddMoneyOrder(amount);
            if (!orderData) throw new Error("Failed to initialize payment");

            // 2. Load script
            const loaded = await loadRazorpayScript();
            if (!loaded) throw new Error("Razorpay SDK failed to load");

            // 3. Open Razorpay
            const options = {
                key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Anne Creations',
                description: 'Wallet Refill',
                order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        await verifyAddMoney({
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            amount: amount
                        });
                        alert(`₹${amount} added to your wallet successfully!`);
                        setOpenAddMoney(false);
                        setAmount('');
                    } catch (err) {
                        alert('Payment verification failed: ' + err.message);
                    }
                },
                prefill: {
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`,
                    email: user?.email || '',
                    contact: user?.mobile || '',
                },
                theme: { color: '#ccd88f' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            alert('Failed to initiate payment: ' + (err.message || 'Unknown error'));
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h5" fontWeight="bold">My Wallet</Typography>
                <Button
                    variant="contained"
                    startIcon={<FaPlus />}
                    onClick={() => setOpenAddMoney(true)}
                    disabled={!accessToken}
                    sx={{
                        bgcolor: 'var(--primary)',
                        '&:hover': { bgcolor: 'var(--secondary)' },
                        borderRadius: '8px',
                        textTransform: 'none'
                    }}
                >
                    Add Money
                </Button>
            </Box>

            <Grid container spacing={4}>
                {/* Balance Card */}
                <Grid item xs={12}>
                    <Paper elevation={0} sx={{
                        p: 6,
                        borderRadius: 6,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        textAlign: 'center'
                    }}>
                        <FaWallet size={160} style={{
                            position: 'absolute',
                            right: -20,
                            bottom: -20,
                            opacity: 0.1,
                            transform: 'rotate(-15deg)'
                        }} />
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>Available Balance</Typography>
                        <Typography variant="h2" fontWeight="bold">₹{balance.toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                            Your wallet balance is ready to use for instant checkouts.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Transaction History */}
                <Grid item xs={12}>
                    {!accessToken && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Please login to use wallet top-up and wallet payments.
                        </Alert>
                    )}
                    {accessToken && error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, mt: 2 }}>Recent Transactions</Typography>
                    <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #eee', overflow: 'hidden' }}>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        ) : transactions.length === 0 ? (
                            <Box sx={{ p: 6, textAlign: 'center' }}>
                                <Typography color="text.secondary">No transactions yet.</Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {transactions.map((tx, index) => (
                                    <React.Fragment key={tx._id || index}>
                                        <ListItem sx={{ py: 2, px: 3 }}>
                                            <Box sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                bgcolor: tx.type === 'CREDIT' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mr: 2,
                                                color: tx.type === 'CREDIT' ? '#4caf50' : '#f44336'
                                            }}>
                                                {tx.type === 'CREDIT' ? <FaArrowUp /> : <FaArrowDown />}
                                            </Box>
                                            <ListItemText
                                                primary={tx.description}
                                                secondary={new Date(tx.createdAt).toLocaleDateString()}
                                                primaryTypographyProps={{ fontWeight: 600 }}
                                            />
                                            <Typography
                                                fontWeight="bold"
                                                sx={{ color: tx.type === 'CREDIT' ? '#4caf50' : '#f44336' }}
                                            >
                                                {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount}
                                            </Typography>
                                        </ListItem>
                                        {index < transactions.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Add Money Dialog */}
            <Dialog open={openAddMoney} onClose={() => setOpenAddMoney(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Add Balance</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Enter the amount you wish to add to your wallet.
                    </Typography>
                    <TextField
                        autoFocus
                        label="Amount (₹)"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        variant="outlined"
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenAddMoney(false)} color="inherit">Cancel</Button>
                    <Button
                        onClick={handleAddMoney}
                        variant="contained"
                        disabled={!amount || isNaN(amount) || amount <= 0}
                        sx={{ bgcolor: 'var(--primary)', '&:hover': { bgcolor: 'var(--secondary)' } }}
                    >
                        Proceed to Pay
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default WalletTab;

