'use client';
import React, { useState, useMemo } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    IconButton, 
    Box, 
    Typography, 
    Slider, 
    TextField,
    Grid,
    Paper,
    Divider,
    InputAdornment
} from '@mui/material';
import { IoClose } from 'react-icons/io5';
import { FaCalculator } from 'react-icons/fa6';
import { MdSpeed, MdTimer } from 'react-icons/md';

const GlobalCalculatorModal = ({ open, onClose }) => {
    const [speed, setSpeed] = useState(350);
    const [backStitches, setBackStitches] = useState('');
    const [handStitches, setHandStitches] = useState('');

    const timeInMinutes = useMemo(() => {
        if (speed <= 0) return 0;
        const backs = parseInt(backStitches) || 0;
        const hands = parseInt(handStitches) || 0;
        
        // Formula: (totalBack + hand * 2) / speed
        return (backs + (hands * 2)) / speed;
    }, [backStitches, handStitches, speed]);

    const hours = Math.floor(timeInMinutes / 60);
    const minutes = Math.round(timeInMinutes % 60);

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: { 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                }
            }}
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                bgcolor: 'var(--primary)',
                color: 'var(--secondary)'
            }}>
                <Box sx={{ 
                    bgcolor: 'white', 
                    p: 1.5, 
                    borderRadius: 3, 
                    display: 'flex',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}>
                    <FaCalculator size={24} color="var(--primary)" />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                        TIME CALCULATOR
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                        Estimate your embroidery completion time
                    </Typography>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 16, top: 24, color: 'var(--secondary)' }}
                >
                    <IoClose />
                </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 4, pt: 10 }}>
                <Grid container spacing={4} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Back Stitches"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={backStitches}
                            onChange={(e) => setBackStitches(e.target.value)}
                            placeholder="0"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                sx: { borderRadius: 3, fontWeight: 700 },
                                endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight="700">STITCHES</Typography></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Hands Stitches"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={handStitches}
                            onChange={(e) => setHandStitches(e.target.value)}
                            placeholder="0"
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                                sx: { borderRadius: 3, fontWeight: 700 },
                                endAdornment: <InputAdornment position="end"><Typography variant="caption" fontWeight="700">STITCHES</Typography></InputAdornment>
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ px: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body2" fontWeight="800" color="var(--secondary)" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MdSpeed size={20} /> EMBROIDERY SPEED
                                </Typography>
                                <Typography variant="h6" fontWeight="900" color="var(--primary)">
                                    {speed} <span style={{ fontSize: '0.8rem' }}>RPM</span>
                                </Typography>
                            </Box>
                            <Slider
                                value={speed}
                                onChange={(e, val) => setSpeed(val)}
                                min={350}
                                max={1200}
                                step={50}
                                valueLabelDisplay="auto"
                                sx={{ 
                                    color: 'var(--primary)',
                                    height: 10,
                                    '& .MuiSlider-thumb': {
                                        width: 24,
                                        height: 24,
                                        backgroundColor: '#fff',
                                        border: '4px solid currentColor',
                                        '&:hover': { boxShadow: '0 0 0 8px rgba(255, 183, 41, 0.16)' },
                                    }
                                }}
                            />
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 4, 
                                bgcolor: 'rgba(49, 24, 7, 0.05)', 
                                borderRadius: 4, 
                                textAlign: 'center',
                                border: '2px dashed rgba(49, 24, 7, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{ position: 'absolute', top: -10, left: -10, opacity: 0.05 }}>
                                <MdTimer size={100} />
                            </Box>
                            
                            <Typography variant="body2" color="var(--secondary)" fontWeight="800" sx={{ mb: 1, letterSpacing: '1px' }}>
                                ESTIMATED COMPLETION TIME
                            </Typography>
                            <Typography variant="h3" color="var(--secondary)" fontWeight="900">
                                {hours > 0 ? (
                                    <>
                                        {hours}<span style={{ fontSize: '1.2rem', marginLeft: '4px', marginRight: '12px' }}>H</span>
                                    </>
                                ) : ''}
                                {minutes}<span style={{ fontSize: '1.2rem', marginLeft: '4px' }}>M</span>
                            </Typography>
                            
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ bgcolor: 'var(--primary)', color: 'var(--secondary)', px: 1.5, py: 0.5, borderRadius: 10, fontWeight: 800 }}>
                                    PRECISE ESTIMATE
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#fafafa' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    * Calculation based on standard machine industry averages.
                </Typography>
            </Box>
        </Dialog>
    );
};

export default GlobalCalculatorModal;
