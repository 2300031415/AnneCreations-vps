'use client';

import React, { Suspense } from 'react';
import ComparePage from './ComparePage';
import { Container, CircularProgress, Box } from '@mui/material';

const Page = () => {
    return (
        <Suspense
            fallback={
                <Container sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress color="primary" />
                </Container>
            }
        >
            <ComparePage />
        </Suspense>
    );
};

export default Page;

