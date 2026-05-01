'use client';

import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { Button } from '@mui/material';

/**
 * DeploymentManager handles automatic version checking
 * and forces a reload when a new version is detected.
 */
export default function DeploymentManager() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [currentVersion, setCurrentVersion] = useState('1.0.1');

    useEffect(() => {
        // Check version every 5 minutes
        const checkVersion = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/health`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache' }
                });

                const newVersion = response.headers.get('X-App-Version');

                if (newVersion && newVersion !== currentVersion) {
                    // New version detected!
                    showUpdateNotification();
                }
            } catch (err) {
                console.error('Failed to check app version:', err);
            }
        };

        const showUpdateNotification = () => {
            const action = (key) => (
                <Button
                    size="small"
                    onClick={() => {
                        closeSnackbar(key);
                        window.location.reload(true); // Force reload from server
                    }}
                    sx={{ color: '#fff', fontWeight: 'bold' }}
                >
                    UPDATE NOW
                </Button>
            );

            enqueueSnackbar('A new version of Anne Creations is available!', {
                variant: 'info',
                persist: true,
                action,
                anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
            });
        };

        const interval = setInterval(checkVersion, 5 * 60 * 1000); // 5 minutes

        // Also check on tab focus
        window.addEventListener('focus', checkVersion);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', checkVersion);
        };
    }, [currentVersion, enqueueSnackbar, closeSnackbar]);

    return null; // This component doesn't render anything visible
}

