'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

export default function I18nProvider({ children }) {
    const { i18n } = useTranslation();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Wait for i18n to be initialized
        if (i18n.isInitialized) {
            setIsReady(true);
        } else {
            const handleInitialized = () => setIsReady(true);
            i18n.on('initialized', handleInitialized);
            return () => {
                i18n.off('initialized', handleInitialized);
            };
        }
    }, [i18n]);

    // Always render children. i18next resources are pre-loaded via i18n.js.
    // This prevents hydration mismatch where server renders children but client renders "Loading..."
    return <>{children}</>;
}
