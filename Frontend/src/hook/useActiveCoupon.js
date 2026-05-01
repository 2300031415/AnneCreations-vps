import { useState, useEffect } from 'react';

const useActiveCoupon = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/coupons/public/all-active`);
                if (!response.ok) {
                    setLoading(false);
                    return;
                }
                const result = await response.json();
                if (result.success && result.data) {
                    setCoupons(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch active coupons:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, []);

    return { coupons, loading };
};

export default useActiveCoupon;

