'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import PropTypes from 'prop-types';
import { useAuthStore } from '@/Store/authStore';
import { useRouter } from 'next/navigation';

export const fieldStyles = {
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
    paddingTop: 1,
    paddingBottom: 1,
    height: 'auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  '& input::placeholder': {
    color: '#999',
    opacity: 1,
  },
};

const LoginForm = ({ redirectOnSuccess = false, onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({ mobile: '', password: '' });
  const [errors, setErrors] = useState({ mobile: false, password: false });
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  // Load saved credentials on mount
  useEffect(() => {
    const savedMobile = localStorage.getItem('rememberedMobile');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const isRemembered = localStorage.getItem('rememberMe') === 'true';

    if (isRemembered) {
      setRememberMe(true);
      if (savedMobile) setFormData((prev) => ({ ...prev, mobile: savedMobile }));
      if (savedPassword) {
        try {
          // Decode password (simple base64 decoding for ease of use)
          setFormData((prev) => ({ ...prev, password: atob(savedPassword) }));
        } catch (e) {
          console.error('Failed to decode password');
        }
      }
    }
    return () => clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && value !== '' && !/^\d+$/.test(value)) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
    clearError();
    setSuccessMessage('');
  };

  const validateForm = () => {
    const mobileEmpty = formData.mobile.trim() === '';
    const mobileInvalid = formData.mobile.trim().length > 0 && formData.mobile.trim().length !== 10;
    const passwordEmpty = formData.password.trim() === '';
    const passwordTooShort = formData.password.trim().length > 0 && formData.password.trim().length < 6;

    setErrors({
      mobile: mobileEmpty || mobileInvalid,
      password: passwordEmpty || passwordTooShort
    });
    return !(mobileEmpty || mobileInvalid || passwordEmpty || passwordTooShort);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await login(formData.mobile.trim(), formData.password.trim());

    if (result.success) {
      // Save or remove credentials based on "Remember me"
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberedMobile', formData.mobile.trim());
        // Simple base64 encoding for the password to avoid plain text storage
        localStorage.setItem('rememberedPassword', btoa(formData.password.trim()));
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedMobile');
        localStorage.removeItem('rememberedPassword');
      }

      setSuccessMessage('Login successful!');
      setFormData({ mobile: '', password: '' });
      setErrors({ mobile: false, password: false });

      if (redirectOnSuccess) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectPath = searchParams.get('redirect') || '/';
        router.push(redirectPath);
      } else {
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccessMessage(''), 0);
      }
    } else {
      const errMsg = String(result.error || '').toLowerCase();
      setErrors({
        mobile: errMsg.includes('mobile') || errMsg.includes('credentials'),
        password: errMsg.includes('password') || errMsg.includes('credentials'),
      });
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', maxWidth: '330px', mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ width: '100%', maxWidth: '330px', mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Box sx={{ width: '100%', maxWidth: '330px', mb: 3 }}>
        <Typography
          component="label"
          htmlFor="mobile"
          sx={{
            fontWeight: 900,
            fontSize: '14px',
            mb: 1,
            display: 'block',
            color: 'var(--secondary)',
          }}
        >
          Mobile Number <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          id="mobile"
          name="mobile"
          placeholder="Enter your mobile number"
          value={formData.mobile}
          onChange={handleChange}
          error={errors.mobile}
          helperText={errors.mobile ? (formData.mobile.trim().length > 0 ? 'Enter valid 10-digit number' : 'Mobile number is required') : ''}
          sx={fieldStyles}
          fullWidth
          inputProps={{ maxLength: 10 }}
        />
      </Box>

      <Box sx={{ width: '100%', maxWidth: '330px', mb: 2 }}>
        <Typography
          component="label"
          htmlFor="password"
          sx={{
            fontWeight: 900,
            fontSize: '14px',
            mb: 1,
            display: 'block',
            color: 'var(--secondary)',
          }}
        >
          Password <span style={{ color: 'red' }}>*</span>
        </Typography>
        <TextField
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          helperText={errors.password ? (formData.password.trim().length > 0 && formData.password.trim().length < 6 ? 'Password must be at least 6 characters' : 'Password is required') : ''}
          sx={fieldStyles}
          fullWidth
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '330px', mb: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              sx={{ color: 'var(--primary)', '&.Mui-checked': { color: 'var(--primary)' } }}
            />
          }
          label={<Typography sx={{ fontSize: '14px', color: 'var(--secondary)' }}>Remember me</Typography>}
        />
        <Link href="/Auth/forgotpassword" sx={{ fontSize: '14px' }}>
          <span className="gradient-text">Forgot password?</span>
        </Link>
      </Box>

      <Button
        type="submit"
        disabled={isLoading}
        sx={{
          backgroundColor: 'var(--primary)',
          borderRadius: '8px',
          border: '2px solid var(--primary)',
          px: { xs: 4, sm: 6 },
          mt: 2,
          width: '40%',
          color: 'var(--secondary)',
          fontWeight: 600,
          fontSize: { xs: '14px', sm: '16px' },
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#ffffff',
            color: 'var(--secondary)',
          },
        }}
      >
        {isLoading ? <CircularProgress size={20} sx={{ color: 'var(--secondary)' }} /> : 'Login'}
      </Button>

      <Typography sx={{ textAlign: 'center', fontSize: { xs: '14px', sm: '15px' }, mt: 2 }}>
        Don&apos;t have an account?{' '}
        <Link href="/Auth/Register" underline="hover" color="var(--primary)">
          Register
        </Link>
      </Typography>
    </Box>
  );
};
LoginForm.propTypes = {
  redirectOnSuccess: PropTypes.bool,
};
export default LoginForm;

