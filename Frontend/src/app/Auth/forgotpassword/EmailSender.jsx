// app/forgotpassword/page.tsx
'use client';
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import BreadCrum from '@/components/BreadCrum/BreadCrum';
import { useAuthStore } from '@/Store/authStore';
import { useRouter } from 'next/navigation';



const MobileSender = () => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');
  const { forgotPassword } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const commonStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'var(--primary)',
        borderWidth: '2px',
        borderRadius: '8px',
      },
      '&:hover fieldset': {
        borderColor: 'var(--primary)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--primary)',
      },
    },
    '& .MuiInputBase-input': {
      paddingTop: '10px',
      paddingBottom: '10px',
    },
  };

  const handleSend = async () => {
    if (!mobile.trim() || mobile.trim().length !== 10) {
      setError(true);
      setApiError('Valid 10-digit mobile number is required');
      setSent(false);
      return;
    }

    setLoading(true);
    setError(false);
    setApiError('');
    setSent(false);

    try {
      const response = await forgotPassword(mobile.trim());
      setSent(true);
      setError(false);
      setApiError('');
    } catch (err) {
      setSent(true);
      setError(false);
      setApiError('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BreadCrum
        crumbs={[
          { label: 'Login', href: '/Auth/Login' },
          { label: 'Forgot Password', href: '/Auth/forgotpassword' },
        ]}
      />

      <Container maxWidth="sm" className="my-20">
        <Card
          sx={{
            boxShadow: '0px 0px 10px 0px #00000040',
            borderRadius: '12px',
            py: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h1"
              fontSize="24px"
              className="text-center text-(--secondary) font-semibold mb-4"
            >
              Reset Password
            </Typography>

            <Typography className="text-center text-(--secondary) my-5 font-semibold">
              Enter your mobile number to receive a password reset link via mail.
            </Typography>

            <Box className="px-8 md:px-20 my-10">
              <Typography
                component="label"
                htmlFor="mobile"
                sx={{ fontWeight: 600, fontSize: '14px', mb: 1, display: 'block' }}
              >
                Mobile Number <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                id="mobile"
                placeholder="Enter 10-digit number"
                variant="outlined"
                fullWidth
                value={mobile}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== '' && !/^\d+$/.test(val)) return;
                  setMobile(val);
                  setError(false);
                  setSent(false);
                  setApiError('');
                }}
                error={error}
                helperText={error ? apiError : ''}
                sx={commonStyles}
                InputLabelProps={{ shrink: false }}
                disabled={loading}
                inputProps={{ maxLength: 10 }}
              />
            </Box>

            <Box className="flex justify-center">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: 'var(--primary)',
                  borderRadius: '8px',
                  border: '1px solid var(--primary)',
                  px: 4,
                  color: 'var(--secondary)',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: 'white', color: 'var(--secondary)' },
                }}
                disabled={loading}
                onClick={handleSend}
              >
                {loading ? 'Sending...' : 'Send Mail Link'}
              </Button>
            </Box>

            {sent && (
              <Typography sx={{ color: 'green', fontSize: '14px' }} className="text-center mt-4">
                Mail sent successfully! Please check your mail.
              </Typography>
            )}

            {apiError && error && (
              <Typography sx={{ color: 'red', fontSize: '14px' }} className="text-center mt-2">
                {apiError}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default MobileSender;

