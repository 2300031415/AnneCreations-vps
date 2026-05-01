'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';

import Banner from '@/components/Banner/Banner';
import CategoryCard from '@/components/categoryCard/CategeroyCard';
import axiosClient from '@/lib/axiosClient';

export default function BrochureHomePage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Core Data to display categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axiosClient.get(`/api/categories`);
        const categoryList = catRes.data?.data || [];
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (err) {
        console.error("❌ Home Data Fetch Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: '#fff' }}>
        <CircularProgress color="inherit" sx={{ color: '#8B4513' }} />
        <Typography sx={{ mt: 2, fontWeight: 700, color: '#8B4513' }}>ENTERING BROCHURE...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 20, bgcolor: 'var(--background)' }}>
      {/* Banner is at the top center under the header */}
      <Banner />

      <Container maxWidth="xl" sx={{ pt: 10 }}>
        {/* 🏛️ CATEGORIES DIRECTORY (Multi-page entry) */}
        <Box sx={{ mb: 15 }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
             <Typography variant="h5" sx={{ fontWeight: 900, color: '#311807', textDecoration: 'underline', letterSpacing: '2px' }}>
                EXPLORE OUR DESIGNS BY CATEGORY
             </Typography>
             <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Select a collection to view high-resolution embroidery designs 
             </Typography>
          </Box>
          
          {/* Using Tailwind grid for stable layout at home too */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 px-4">
            {categories.filter(c => c.name !== 'All').map((cat) => (
              <motion.div
                key={cat._id}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <CategoryCard item={cat} />
              </motion.div>
            ))}
          </div>
        </Box>
      </Container>
    </Box>
  );
}
