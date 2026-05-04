'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  CircularProgress,
  IconButton,
  Breadcrumbs
} from '@mui/material';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { MdChevronLeft, MdChevronRight, MdArrowBack } from 'react-icons/md';
import Link from 'next/link';

import ArrivalCard from '@/components/Cards/Card';
import axiosClient from '@/lib/axiosClient';

const PRODUCTS_PER_PAGE = 24;

export default function CategoryProductsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const categoryId = params.id;
  const categoryName = searchParams.get('name') || 'Category';

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(`/api/products/category/${categoryId}?limit=5000`);
        const productList = res.data?.data || [];
        setProducts(Array.isArray(productList) ? productList : []);
      } catch (err) {
        console.error("❌ Category Data Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryProducts();
    }
  }, [categoryId]);

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const currentItems = products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#FFFAF0' }}>
        <CircularProgress color="inherit" sx={{ color: '#8B4513' }} />
        <Typography sx={{ mt: 2, fontWeight: 700, color: '#8B4513' }}>ENTERING COLLECTION...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 20, bgcolor: '#FFFAF0' }}>
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        {/* Navigation */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => router.push('/')} sx={{ color: '#8B4513', border: '1px solid #e0e0e0', bgcolor: 'white' }}>
                <MdArrowBack />
            </IconButton>
            <Breadcrumbs aria-label="breadcrumb">
                <Link href="/" className="hover:underline text-gray-500">Home</Link>
                <Typography color="text.primary" sx={{ fontWeight: 700, color: '#8B4513' }}>{categoryName}</Typography>
            </Breadcrumbs>
        </Box>

        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" sx={{ letterSpacing: '4px', fontWeight: 900, color: '#996E19' }}>
               COLLECTION EXPLORER
            </Typography>
            <Typography variant="h2" sx={{ 
              fontFamily: "'Playfair Display', serif", 
              fontWeight: 900, 
              color: '#311807', 
              fontSize: { xs: '2.5rem', md: '4rem' },
              textTransform: 'uppercase',
              mb: 2 
            }}>
              {categoryName}
            </Typography>
            <div className="w-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#8B4513] to-transparent mx-auto opacity-30 mt-4" />
        </Box>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-20 px-4">
          {currentItems.map((prod) => (
            <div key={prod._id} className="w-full">
              <ArrivalCard item={prod} categoryName={categoryName} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && !isLoading && (
          <Box sx={{ textAlign: 'center', py: 20 }}>
             <Typography variant="h4" color="text.secondary">Readying the digital archive.</Typography>
          </Box>
        )}

        {/* Pagination Section */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10, gap: 5 }}>
            <IconButton 
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === 1}
              sx={{ color: '#8B4513', border: '2px solid currentColor' }}
            >
              <MdChevronLeft size={28} />
            </IconButton>
            <Typography sx={{ fontWeight: 900, color: '#996E19', letterSpacing: '6px', fontSize: '1.2rem' }}>
              {currentPage} / {totalPages}
            </Typography>
            <IconButton 
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={currentPage === totalPages}
              sx={{ color: '#8B4513', border: '2px solid currentColor' }}
            >
              <MdChevronRight size={28} />
            </IconButton>
          </Box>
        )}
      </Container>
    </Box>
  );
}
