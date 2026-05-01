'use client';

import React, { useState } from 'react';
import { Alert, Box, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { useAuthStore } from '@/Store/authStore';
import { useSearchParams, useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const { resetPassword, isLoading } = useAuthStore();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const inputStyle = {
    mt: 1,
    mb: 2,
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.trim().length < 6) {
      setSnackbar({
        open: true,
        message: 'Password must be at least 6 characters long.',
        severity: 'error',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New password and Confirm Password mismatch.',
        severity: 'error',
      });
      return;
    }

    const response = await resetPassword({
      email,
      token,
      password: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (response.success) {
      setSnackbar({
        open: true,
        message: 'Password updated successfully!',
        severity: 'success',
      });
      setTimeout(() => router.push('/Auth/Login'), 1500);
    } else {
      setSnackbar({
        open: true,
        message: response.error || 'Failed to update password.',
        severity: 'error',
      });
    }
  };

  return (
    <Box className="flex items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8">
      <Box className="w-full sm:w-[80%] md:w-[60%] lg:w-[45%] bg-white rounded-xl border-2 border-(--primary) shadow-sm p-6 md:p-10">
        <h6 className="border-b-2 border-(--primary) text-xl md:text-2xl font-bold pb-4 mb-6 text-center text-(--secondary)">
          Reset Password
        </h6>

        {snackbar.open && (
          <Box className="pb-4 flex justify-center">
            <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              variant="outlined"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Box>
        )}

        <form className="w-full" onSubmit={handleSubmit}>
          {/* New Password */}
          <Box>
            <label
              htmlFor="newPassword"
              className="text-sm md:text-base text-(--secondary) font-medium"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            <TextField
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter New password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              sx={inputStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Confirm Password */}
          <Box>
            <label
              htmlFor="confirmPassword"
              className="text-sm md:text-base text-(--secondary) font-medium"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Enter Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              required
              size="small"
              sx={inputStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Button */}
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                borderRadius: '8px',
                px: { xs: 3, md: 5 },
                py: { xs: 1.2, md: 1.5 },
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '13px', md: '14px' },
                '&:hover': {
                  backgroundColor: '#fff',
                  color: 'var(--secondary)',
                  border: '1px solid var(--primary)',
                },
              }}
            >
              {isLoading ? 'Updating...' : 'Reset Password'}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ForgotPassword;

