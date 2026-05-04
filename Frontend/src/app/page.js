'use client';
import React, { useEffect, useState, useMemo, useRef, Suspense } from 'react';

import {
  Container,
  Box,
  Typography,
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  CircularProgress,
  Radio,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MdTune, MdExpandMore } from 'react-icons/md';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from 'next/navigation';

import Banner from '../components/Banner/Banner';
import AnnouncementStrip from '../components/AnnouncementStrip/AnnouncementStrip';
import ArrivalCard from '@/components/Cards/Card';
import ArrivalCardSkeleton from '@/components/Cards/LoadingCard';
import CategoryCard from '@/components/categoryCard/CategeroyCard';
import Loading from '@/components/categoryCard/Loading';
import SearchBar from '@/components/Header/SearchBar';
import { keyframes } from '@mui/system';
import useActiveCoupon from '@/hook/useActiveCoupon';


import { useProductStore } from '@/Store/productStore';
import { useAuthStore } from '@/Store/authStore';
import useWishlistStore from '@/Store/wishlistStore';
import useCartStore from '@/Store/cartStore';
import useCategory from '@/hook/useCategory';
import { useFilterStore } from '@/Store/filterStore';

const PRODUCTS_PER_PAGE = 12;
const CATEGORIES_PER_PAGE = 8;
const DEFAULT_SIDEBAR_WIDTH = 280;

const StyledTabs = styled(Tabs)({
  borderBottom: 'none',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.85rem',
  marginRight: theme.spacing(0.5),
  color: '#8B4513',
  borderRadius: '50px',
  padding: '8px 16px',
  minHeight: 'auto',
  transition: 'all 0.3s ease',
  backgroundColor: '#fff',
  border: '1px solid #8B4513',
  [theme.breakpoints.up('sm')]: {
    fontSize: '1rem',
    padding: '10px 24px',
    marginRight: theme.spacing(1),
  },
  '&.Mui-selected': {
    color: '#ffffff',
    backgroundColor: '#8B4513',
  },
  '&:hover': {
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
  },
}));


const HomePageContent = () => {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  const {
    products,
    fetchProducts,
    fetchProductsByFilter,
    isProductsLoading,
    error,
  } = useProductStore();

  const { isAuthenticated } = useAuthStore();
  const getWishlist = useWishlistStore((state) => state.getWishlist);
  const getCartItem = useCartStore((state) => state.getCartItem);
  const { categories } = useCategory();

  const {
    activeTab, setActiveTab,
    selectedCategories, setSelectedCategories
  } = useFilterStore();

  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [visibleCategoryCount, setVisibleCategoryCount] = useState(PRODUCTS_PER_PAGE);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const isResizing = useRef(false);
  const sidebarRef = useRef(null);

  // Resizer Logic
  const startResizing = React.useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    isResizing.current = true;
  }, []);

  const stopResizing = React.useCallback(() => {
    isResizing.current = false;
  }, []);

  const resize = React.useCallback((mouseMoveEvent) => {
    if (isResizing.current && sidebarRef.current) {
      const sidebarLeft = sidebarRef.current.getBoundingClientRect().left;
      let newWidth = mouseMoveEvent.clientX - sidebarLeft;

      // Constraint clamping
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 600) newWidth = 600;

      setSidebarWidth(newWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  // Sync activeTab with URL param
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Sync category from URL param
  useEffect(() => {
    const catId = searchParams.get('category');
    if (catId) {
      setSelectedCategories([catId]);
      setActiveTab('all');
    }
  }, [searchParams, setSelectedCategories, setActiveTab]);



  const categoryTabs = useMemo(() => {
    const selectedCat = selectedCategories.length > 0
      ? categories?.find(c => c._id === selectedCategories[0])?.name
      : null;

    return [
      { id: 1, label: selectedCat || t('tabs.all', 'All'), value: 'all' },
      { id: 2, label: 'Categories', value: 'our_designs' },
      { id: 3, label: t('tabs.todays_deals', "Today's Deals"), value: 'deals' },
      { id: 4, label: t('tabs.new_releases', 'New Releases'), value: 'new' },
      { id: 6, label: t('tabs.free_designs', 'Free Designs'), value: 'free' },
    ];
  }, [t, selectedCategories, categories]);

  useEffect(() => {
    if (isAuthenticated) {
      getCartItem();
      getWishlist();
    }
  }, [isAuthenticated, getCartItem, getWishlist]);

  // Fetch products based on active tab
  useEffect(() => {
    const fetchCurrentTabProducts = () => {
      if (activeTab === 'our_designs') return;

      setVisibleCount(PRODUCTS_PER_PAGE);

      let apiTab = activeTab;
      if (activeTab === 'deals') apiTab = 'todays-deals';
      if (activeTab === 'new') apiTab = 'new-releases';

      if (activeTab === 'all' || activeTab === 'our_designs') {
        fetchProducts(1000);
      } else {
        fetchProductsByFilter?.(apiTab, 1000) || fetchProducts(1000);
      }
    };

    fetchCurrentTabProducts();

    // Auto-update mechanism: Refetch when window regains focus
    const handleFocus = () => {
      fetchCurrentTabProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab, fetchProducts, fetchProductsByFilter]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset category filters when switching to specialized tabs to avoid empty results
    if (newValue !== 'all' && newValue !== 'our_designs') {
      setSelectedCategories([]);
    }
    router.push(`/?tab=${newValue}`, { scroll: false });
  };

  const handleCategoryChange = (catId) => {
    setSelectedCategories(prev => prev.includes(catId) ? [] : [catId]);
    setVisibleCount(PRODUCTS_PER_PAGE);
  };



  const filteredProducts = useMemo(() => {
    const safeSelectedCategories = Array.isArray(selectedCategories) ? selectedCategories : [];

    return products.filter((p) => {
      const matchCategory = safeSelectedCategories.length === 0 ||
        p.categories?.some(c => safeSelectedCategories.includes(c._id || c));

      return matchCategory;
    });
  }, [products, selectedCategories]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < filteredProducts.length;
  const remainingProducts = filteredProducts.length - visibleCount;

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  const filteredCategories = useMemo(() => categories?.filter(c => c.name !== 'All') || [], [categories]);
  const visibleCategories = filteredCategories.slice(0, visibleCategoryCount);
  const hasMoreCategories = visibleCategoryCount < filteredCategories.length;
  const remainingCategories = filteredCategories.length - visibleCategoryCount;

  const handleShowMoreCategories = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCategoryCount((prev) => prev + PRODUCTS_PER_PAGE);
      setIsLoadingMore(false);
    }, 500);
  };

  const FilterContent = ({ mobile = false }) => (
    <Box sx={{
      p: mobile ? 3 : 0,
      border: mobile ? 'none' : 'none',
    }}>
      {mobile && (
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          {t('filters.title', 'Filters')}
        </Typography>
      )}

      {/* Categories Filter Block - Scrollable and Larger */}
      <Box sx={{
        p: 2,
        border: '1px solid #e0e0e0',
        borderRadius: 3,
        bgcolor: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <Typography fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'var(--secondary)' }}>
          {t('filters.categories', 'Categories')}
        </Typography>
        <Box sx={{
          height: 'auto',
          overflowY: 'visible',
          pr: 1,
          pb: 1, 
        }}>
          <FormGroup>
            {categories?.filter(cat => cat.name !== 'All').map((cat) => (
              <FormControlLabel
                key={cat._id}
                control={
                  <Radio
                    checked={selectedCategories.includes(cat._id)}
                    onChange={() => handleCategoryChange(cat._id)}
                    size="small"
                    sx={{ color: 'var(--secondary)', '&.Mui-checked': { color: 'var(--primary)' } }}
                  />
                }
                label={<Typography variant="body1" fontWeight={600} sx={{ color: '#333' }}>{cat.name}</Typography>}
              />
            ))}
          </FormGroup>
        </Box>
      </Box>

      {/* Recently Viewed in Sidebar - Removed */}
      {/* <RecentlyViewedSidebar /> */}

    </Box>
  );

  return (
    <>
      <Banner />
      <AnnouncementStrip />

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >


        {/* Big Search Bar Area */}
        <Box sx={{ py: { xs: 2, md: 4 }, bgcolor: 'var(--background)', position: 'relative', zIndex: 10 }}>
          <Container maxWidth="md">
            <SearchBar centered={true} />
          </Container>
        </Box>

        {/* Tab Icons Area */}
        {selectedCategories.length === 0 && (
          <Box sx={{ bgcolor: 'var(--background)', pb: 2 }}>
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': { display: 'none' },
                  scrollbarWidth: 'none',
                }}
              >
                <StyledTabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  {categoryTabs.map((tab) => (
                    <StyledTab
                      key={tab.id}
                      label={tab.label}
                      value={tab.value}
                    />
                  ))}
                </StyledTabs>
              </Box>
            </Container>
          </Box>
        )}

        {/* Main Content with Filter Sidebar */}
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
          {activeTab === 'all' && (
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border[var(--)] text[var(--)] font-semibold hover:bg[var(--)] hover:text-white transition-all"
              >
                <MdTune size={20} />
                {t('filters.title', 'Filters')}
              </button>
            </Box>
          )}

          {/* Desktop Sidebar Toggle (Open) */}
          {!isSidebarOpen && activeTab === 'all' && (
            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'fixed', left: 20, top: '50%', zIndex: 99 }}>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg[var(--)] text-white rounded-r-lg shadow-lg hover:bg[var(--)] transition-all"
              >
                <MdTune size={24} />
              </button>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Sidebar - Desktop (Hidden except for 'All' tab) */}
            {isSidebarOpen && activeTab === 'all' && (
              <Box
                ref={sidebarRef}
                sx={{
                  width: sidebarWidth,
                  flexShrink: 0,
                  display: { xs: 'none', md: 'block' },
                  position: 'relative',
                  pr: 2,
                  transition: isResizing.current ? 'none' : 'width 0.1s ease',
                }}
              >
                {/* Resizer Handle */}
                <Box
                  onMouseDown={startResizing}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0, // Align exactly to the right edge
                    width: '12px', // Slightly narrower but still clickable
                    height: '100%',
                    cursor: 'col-resize',
                    zIndex: 50,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: 'translateX(50%)', // Center it on the border line
                    '&:hover': {
                      '.resize-line': {
                        height: '100%',
                        opacity: 1
                      }
                    },
                  }}
                >
                  {/* Visible Line - Always visible now */}
                  <Box
                    className="resize-line"
                    sx={{
                      width: '4px',
                      height: '40px', // Small handler by default
                      bgcolor: 'var(--primary)', // Always colored
                      borderRadius: '4px',
                      transition: 'all 0.2s',
                      opacity: 0.8, // Visible by default
                      boxShadow: '0 0 4px rgba(0,0,0,0.1)'
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ color: 'var(--secondary)' }}>
                      FILTERS
                    </Typography>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text[var(--)]">
                      <MdTune size={20} />
                    </button>
                  </Box>

                  <FilterContent />
                </Box>
              </Box>
            )}

            {/* Product Grid Area */}
            <Box sx={{ flexGrow: 1 }}>

              <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                {categoryTabs.find(t => t.value === activeTab)?.label || 'Designs'}
              </Typography>

              {activeTab === 'our_designs' ? (
                categories && categories.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {visibleCategories.map((cat) => (
                        <div key={cat._id} className="flex justify-center">
                          <CategoryCard
                            item={cat}
                            shape="square"
                            onClick={(item) => {
                              setSelectedCategories([item._id]);
                              setActiveTab('all');
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Show More Button for Categories */}
                    {hasMoreCategories && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <button
                          onClick={handleShowMoreCategories}
                          disabled={isLoadingMore}
                          className="px-8 py-3 bg-[#8B4513] text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                          {isLoadingMore ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={20} sx={{ color: 'white' }} />
                              {t('common.loading', 'Loading...')}
                            </Box>
                          ) : (
                            t('common.show_more', 'Show More')
                          )}
                        </button>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ width: '100%', py: 8, textAlign: 'center' }}>
                    <Typography color="text.secondary">No designs found</Typography>
                  </Box>
                )
              ) : (
                <>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 md:gap-y-8">
                    {visibleProducts.map((item) => (
                      <ArrivalCard item={item} key={item._id} showQuickView />
                    ))}
                  </div>

                  {/* Show More Button */}
                  {hasMoreProducts && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                      <button
                        onClick={handleShowMore}
                        disabled={isLoadingMore}
                        className="px-8 py-3 bg-[#8B4513] text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {isLoadingMore ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                            {t('common.loading', 'Loading...')}
                          </Box>
                        ) : (
                          t('common.show_more', 'Show More')
                        )}
                      </button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>
        </Container>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="right"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { width: 300 } }}
        >
          <FilterContent mobile />
        </Drawer>
      </Box>
    </>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}

export default Page;

