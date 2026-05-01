import { useState, useEffect } from 'react';

const useActiveCoupon = () => {
    const [coupon, setCoupon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupon = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/coupons/public/active`);
                if (!response.ok) {
                    setLoading(false);
                    return;
                }
                const result = await response.json();
                if (result.success && result.data) {
                    setCoupon(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch active coupon:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupon();
    }, []);

    return { coupon, loading };
};

export default useActiveCoupon;

