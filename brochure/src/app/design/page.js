'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DesignRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect all /design traffic back to the brochure home page to prevent 404s
    router.replace('/');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#311807]"></div>
    </div>
  );
}
