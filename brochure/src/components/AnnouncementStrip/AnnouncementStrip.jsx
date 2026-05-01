'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AnnouncementStrip = () => {
    const { t } = useTranslation();
    const [scrollingText, setScrollingText] = useState(t('home.announcement'));

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings/public?t=${Date.now()}`);
                if (!response.ok) return;
                const result = await response.json();
                if (result.data && result.data.scrolling_message) {
                    setScrollingText(result.data.scrolling_message);
                }
            } catch (error) {
                console.error('Failed to fetch scrolling message:', error);
            }
        };

        fetchSettings();
    }, [t]);

    const stripColor = '#496637';

    return (
        <div className="w-full">
            {/* Top Strip */}
            <div className="w-full h-[5px]" style={{ backgroundColor: stripColor }}></div>

            {/* Marquee Section */}
            <div className="py-1 overflow-hidden relative bg-white">
                <div
                    className="flex whitespace-nowrap text-[var(--secondary)] font-semibold gap-8"
                    style={{
                        animation: 'scroll-left 20s linear infinite',
                    }}
                >
                    {/* Duplicate text enough times to fill screen and loop smoothly */}
                    {[...Array(6)].map((_, i) => (
                        <span key={i} className="inline-block">
                            {scrollingText} &nbsp; &bull; &nbsp;
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom Strip */}
            <div className="w-full h-[5px]" style={{ backgroundColor: stripColor }}></div>
        </div>
    );
};

export default AnnouncementStrip;
