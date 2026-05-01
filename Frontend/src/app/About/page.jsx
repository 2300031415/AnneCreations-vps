'use client'
import React, { Suspense } from 'react'
import BreadCrum from '@/components/BreadCrum/BreadCrum'
import { Container, Box, Typography, Paper, CircularProgress } from '@mui/material'
import AnimatedBackground from '@/components/AnimatedBackground'
import { useTranslation } from 'react-i18next'

const AboutContent = () => {
  const { t } = useTranslation()

  return (
    <>
      <BreadCrum
        crumbs={[
          { label: t('nav.home'), href: '/' },
          { label: t('nav.about_us'), href: '/About' },
        ]}
      />

      <AnimatedBackground>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 10 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'var(--secondary)',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontFamily: 'Poppins, sans-serif',
                background: 'linear-gradient(45deg, var(--secondary), var(--primary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              {t('about.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'var(--secondary)',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.25rem' },
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 500,
                opacity: 0.8
              }}
            >
              {t('about.subtitle')}
            </Typography>
            <Box sx={{ width: 80, height: 4, bgcolor: 'var(--primary)', mx: 'auto', borderRadius: 2 }} />
          </Box>

          {/* Main Content Card */}
          <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(233,177,96,0.2)', mb: 6 }}>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8, color: '#555', textAlign: 'center', maxWidth: '900px', mx: 'auto', whiteSpace: 'pre-line' }}>
              {t('about.description')}
            </Typography>
          </Paper>

          {/* Mission & Vision Row */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            gap: 4,
            alignItems: 'stretch',
            width: '100%'
          }}>
            <Paper
              elevation={0}
              sx={{
                p: 5,
                flex: 1,
                borderRadius: 5,
                bgcolor: '#fff',
                border: '1px solid #eee',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(233,177,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Typography sx={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.5rem' }}>M</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--secondary)' }}>{t('about.mission_title')}</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
                {t('about.mission_text')}
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 5,
                flex: 1,
                borderRadius: 5,
                bgcolor: '#fff',
                border: '1px solid #eee',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{ width: 50, height: 50, borderRadius: '50%', bgcolor: 'rgba(49,24,7,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                  <Typography sx={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '1.5rem' }}>V</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--secondary)' }}>{t('about.vision_title')}</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: '#666', fontSize: '1.1rem', lineHeight: 1.6 }}>
                {t('about.vision_text')}
              </Typography>
            </Paper>
          </Box>

          {/* Closing Segment */}
          <Box sx={{ mt: 10, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontStyle: 'italic', color: 'var(--primary)', fontWeight: 500 }}>
              {t('about.footer_quote')}
            </Typography>
          </Box>
        </Container>
      </AnimatedBackground>
    </>
  )
}

const AboutPage = () => {
  return (
    <Suspense
      fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      }
    >
      <AboutContent />
    </Suspense>
  )
}

export default AboutPage

