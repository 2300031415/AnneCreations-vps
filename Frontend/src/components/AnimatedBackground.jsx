'use client';
import React from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

const AnimatedBackground = ({ children }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #FFEFD5 0%, #FFFFFF 50%, #FFE4B5 100%)',
                '@keyframes slowRotate': {
                    from: { transform: 'rotate(0deg)' },
                    to: { transform: 'rotate(360deg)' }
                }
            }}
        >
            {/* Dynamic Colorful Background Accents */}
            <Box sx={{ position: 'absolute', top: '-10%', left: '10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(255,183,41,0.3) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', bottom: '5%', right: '5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(233,177,96,0.3) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(60px)', zIndex: 0 }} />
            <Box sx={{ position: 'absolute', top: '40%', right: '30%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(49,24,7,0.1) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(40px)', zIndex: 0 }} />

            {/* Decorative Mandalas */}
            <Box sx={{ position: 'absolute', top: -100, left: -100, opacity: 0.6, pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(1.8) contrast(1.1)', animation: 'slowRotate 60s linear infinite' }}>
                <Image src="/assets/decor/custom-decor-1.png" alt="decor" width={450} height={450} priority />
            </Box>
            <Box sx={{ position: 'absolute', top: '10%', right: -150, opacity: 0.5, pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(1.5)', animation: 'slowRotate 80s linear infinite reverse' }}>
                <Image src="/assets/decor/custom-decor-2.png" alt="decor" width={550} height={550} />
            </Box>
            <Box sx={{ position: 'absolute', bottom: '20%', left: -150, opacity: 0.45, pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(1.4)', animation: 'slowRotate 100s linear infinite' }}>
                <Image src="/assets/decor/custom-decor-3.png" alt="decor" width={500} height={500} />
            </Box>
            <Box sx={{ position: 'absolute', bottom: -50, right: -50, opacity: 0.65, pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(2) brightness(1.1)', animation: 'slowRotate 70s linear infinite reverse' }}>
                <Image src="/assets/decor/custom-decor-1.png" alt="decor" width={400} height={400} />
            </Box>

            {/* Extra Patterns to fill space */}
            <Box sx={{ position: 'absolute', top: '40%', left: '80%', opacity: 0.35, transform: 'scale(0.8) rotate(30deg)', pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(1.5)' }}>
                <Image src="/assets/decor/custom-decor-2.png" alt="decor" width={300} height={300} />
            </Box>
            <Box sx={{ position: 'absolute', top: '70%', left: '5%', opacity: 0.3, transform: 'scale(0.7) rotate(-45deg)', pointerEvents: 'none', mixBlendMode: 'multiply', filter: 'saturate(1.6)' }}>
                <Image src="/assets/decor/custom-decor-3.png" alt="decor" width={300} height={300} />
            </Box>
            <Box sx={{ position: 'absolute', top: '5%', left: '40%', opacity: 0.2, transform: 'scale(0.5) rotate(90deg)', pointerEvents: 'none', mixBlendMode: 'multiply' }}>
                <Image src="/assets/decor/custom-decor-1.png" alt="decor" width={200} height={200} />
            </Box>
            <Box sx={{ position: 'absolute', top: '25%', left: '15%', opacity: 0.3, transform: 'scale(0.6) rotate(-30deg)', pointerEvents: 'none', mixBlendMode: 'multiply' }}>
                <Image src="/assets/decor/custom-decor-2.png" alt="decor" width={250} height={250} />
            </Box>
            <Box sx={{ position: 'absolute', top: '35%', left: '0%', opacity: 0.2, transform: 'scale(0.8) rotate(75deg)', pointerEvents: 'none', mixBlendMode: 'multiply' }}>
                <Image src="/assets/decor/custom-decor-3.png" alt="decor" width={350} height={350} />
            </Box>

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                {children}
            </Box>
        </Box>
    );
};

export default AnimatedBackground;

