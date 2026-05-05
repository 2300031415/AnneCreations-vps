'use client';
import React, { useState, useMemo } from 'react';
import { Box, Typography, Slider, Paper, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FaThreads } from 'react-icons/fa6';

const parseStitch = (val) => {
    if (typeof val === 'number') return val;
    // Remove commas and spaces before parsing
    return parseInt(String(val || '0').replace(/[^0-9]/g, ''), 10) || 0;
};

const StitchDetails = ({ backStitches = 0, handStitches = 0, stitches = 0 }) => {
    const { t } = useTranslation();
    const [speed, setSpeed] = useState(350); // Default RPM
    const [handsUsed, setHandsUsed] = useState(1); // 1 = Sequential, 2 = Parallel
    const efficiencyFactor = 1.0;

    const backStitchCount = parseStitch(backStitches);
    const handStitchCount = parseStitch(handStitches);

    const extractedData = useMemo(() => {
        const stitchesStr = String(stitches || '');
        const backMatch = stitchesStr.match(/Back\s*([\d,\s]+)/i);
        const handMatch = stitchesStr.match(/Hand\s*([\d,\s]+)/i);

        const getNumbers = (match) => {
            if (!match) return [];
            const numbers = match[1].match(/\d+/g);
            return numbers ? numbers.map(n => parseInt(n, 10)) : [];
        };

        const backArr = getNumbers(backMatch);
        const handArr = getNumbers(handMatch);

        // Fallback for props
        if (backArr.length === 0 && backStitchCount > 0) backArr.push(backStitchCount);
        if (handArr.length === 0 && handStitchCount > 0) handArr.push(handStitchCount);

        return {
            back: backArr.reduce((a, b) => a + b, 0),
            handArray: handArr,
            handSum: handArr.reduce((a, b) => a + b, 0)
        };
    }, [backStitchCount, handStitchCount, stitches]);

    const effectiveBack = Number.isFinite(extractedData.back) ? extractedData.back : 0;
    const effectiveHandArr = Array.isArray(extractedData.handArray) ? extractedData.handArray : [];
    const effectiveHandSum = Number.isFinite(extractedData.handSum) ? extractedData.handSum : 0;

    const timeInMinutes = useMemo(() => {
        if (speed <= 0) return 0;

        let calculatedMinutes = 0;
        if (handsUsed === 1) {
            // 1 Hand Mode: Back + (only one/largest hand part)
            const maxHandPart = effectiveHandArr.length > 0 ? Math.max(...effectiveHandArr) : 0;
            calculatedMinutes = (effectiveBack + maxHandPart) / speed;
        } else {
            // 2 Hands Mode: Back + (all hand parts combined)
            // If only one hand value is provided, multiply it by 2
            let handPortion = 0;
            if (effectiveHandArr.length === 1) {
                handPortion = effectiveHandArr[0] * 2;
            } else {
                handPortion = effectiveHandSum;
            }
            calculatedMinutes = (effectiveBack + handPortion) / speed;
        }

        const totalMin = Number.isFinite(calculatedMinutes) ? calculatedMinutes / efficiencyFactor : 0;
        return Math.max(0, totalMin);
    }, [effectiveBack, effectiveHandArr, effectiveHandSum, speed, handsUsed, efficiencyFactor]);

    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);

    const handleSliderChange = (event, newValue) => setSpeed(newValue);
    const handleHandsChange = (event, val) => val !== null && setHandsUsed(val);

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, mt: 4 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
                <FaThreads size={24} color="#8B4513" />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                    Production Calculator
                </Typography>
            </Box>

            {/* Stitches Breakdown */}
            <Box mb={3} display="flex" justifyContent="space-between" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Back Stitches</Typography>
                    <Typography variant="body1" fontWeight="bold">{(effectiveBack || 0).toLocaleString()}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Hands Stitches</Typography>
                    <Typography variant="body1" fontWeight="bold">{(effectiveHandSum || 0).toLocaleString()}</Typography>
                </Box>
            </Box>

            {/* Mode Selection Toggle */}
            <Box mb={3}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Execution Mode (Select logic)
                </Typography>
                <ToggleButtonGroup
                    value={handsUsed}
                    exclusive
                    onChange={handleHandsChange}
                    size="small"
                    fullWidth
                    color="primary"
                >
                    <ToggleButton value={1} sx={{ textTransform: 'none', fontWeight: 600 }}>1 Hand (Sequential)</ToggleButton>
                    <ToggleButton value={2} sx={{ textTransform: 'none', fontWeight: 600 }}>2 Hands (Parallel)</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                {t('product.embroidery_speed', 'Embroidery Speed')}: <span style={{ color: '#007bff' }}>{speed} RPM</span>
            </Typography>

            <Slider
                value={speed}
                onChange={handleSliderChange}
                min={200}
                max={1000}
                step={50}
                valueLabelDisplay="auto"
                sx={{
                    color: '#007bff',
                    height: 8,
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-thumb': {
                        height: 24, width: 24, backgroundColor: '#007bff', border: '2px solid currentColor',
                        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': { boxShadow: 'inherit' },
                        '&:before': { display: 'none' },
                    },
                }}
            />

            <Box
                sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: '#e3f2fd',
                    borderRadius: 2,
                    textAlign: 'center',
                    border: '1px solid #bbdefb',
                }}
            >
                <Typography variant="h6" color="#0d47a1" fontWeight="bold">
                    Estimated Time: {hours > 0 ? `${hours} H ` : ''}{minutes} M
                </Typography>
            </Box>

            <Typography variant="caption" display="block" textAlign="right" mt={1} color="text.secondary">
                Total Stitches: {((effectiveBack || 0) + (effectiveHandSum || 0)).toLocaleString()}
            </Typography>
        </Paper>
    );
};

export default StitchDetails;
