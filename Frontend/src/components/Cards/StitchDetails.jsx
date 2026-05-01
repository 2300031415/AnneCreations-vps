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
        if (backStitchCount > 0 || handStitchCount > 0) {
            return { backs: [backStitchCount], hands: [handStitchCount] };
        }

        const stitchesStr = String(stitches || '');
        const backMatch = stitchesStr.match(/Back\s*([\d,\s]+)/i);
        const handMatch = stitchesStr.match(/Hand\s*([\d,\s]+)/i);

        const getNumbers = (match) => {
            if (!match) return [];
            const numbers = match[1].match(/\d+/g);
            return numbers ? numbers.map(n => parseInt(n, 10)) : [];
        };

        const backNumbers = getNumbers(backMatch);
        const handNumbers = getNumbers(handMatch);

        return {
            backs: backNumbers.length > 0 ? backNumbers : [0],
            hands: handNumbers.length > 0 ? handNumbers : [0]
        };
    }, [backStitchCount, handStitchCount, stitches]);

    const [selectedHandIndex, setSelectedHandIndex] = useState(0);

    const totalBack = extractedData.backs.reduce((a, b) => a + b, 0);
    const effectiveHand = extractedData.hands[selectedHandIndex] || 0;

    const timeInMinutes = useMemo(() => {
        if (speed <= 0) return 0;

        // Corrected Formula: (totalBack + selectedHand * 2) / speed
        const calculatedMinutes = (totalBack + (effectiveHand * 2)) / speed;
        return calculatedMinutes / efficiencyFactor;
    }, [totalBack, effectiveHand, speed, efficiencyFactor]);

    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);

    const handleSliderChange = (event, newValue) => setSpeed(newValue);
    const handleHandSelection = (event, val) => val !== null && setSelectedHandIndex(val);

    return (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2, mt: 4 }}>
            {/* Stitches Breakdown */}
            <Box mb={3} display="flex" justifyContent="space-between" sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 1.5 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Back Stitches</Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {extractedData.backs.map(b => b.toLocaleString()).join(', ')}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Hand Stitches</Typography>
                    <Typography variant="body1" fontWeight="bold">
                        {extractedData.hands.map(h => h.toLocaleString()).join(', ')}
                    </Typography>
                </Box>
            </Box>

            {/* Hand Selection Toggle */}
            <Box mb={3}>
                <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    Select Execution Mode (Hand Stitches)
                </Typography>
                <ToggleButtonGroup
                    value={selectedHandIndex}
                    exclusive
                    onChange={handleHandSelection}
                    size="small"
                    fullWidth
                    color="primary"
                >
                    {extractedData.hands.map((val, idx) => (
                        <ToggleButton key={idx} value={idx} sx={{ textTransform: 'none', fontWeight: 600 }}>
                            {val.toLocaleString()}
                        </ToggleButton>
                    ))}
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
        </Paper>
    );
};


export default StitchDetails;

