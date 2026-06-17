'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCategory from '@/hook/useCategory';

export default function DesignRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryName = searchParams.get('category');
  const { categories } = useCategory();

  useEffect(() => {
    if (categories && categories.length > 0) {
      if (categoryName) {
        const matched = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (matched) {
          router.replace(`/?category=${matched._id}`);
          return;
        }
      }
      router.replace('/');
    }
  }, [categories, categoryName, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#311807]"></div>
    </div>
  );
}
