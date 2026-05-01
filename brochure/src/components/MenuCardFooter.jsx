'use client';

import React from 'react';
import { Box } from '@mui/material';
import { MdHome, MdOutlineCategory, MdOutlineShoppingCart, MdPersonOutline } from 'react-icons/md';
import Link from 'next/link';

const FooterNav = ({ icon, label, href }) => (
  <Link href={href || "#"} className="flex flex-col items-center gap-0.5 group no-underline">
    <div className="transition-all duration-300 group-hover:scale-125 text-[#ccd88f]">{icon}</div>
    <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#ccd88f] group-hover:text-white transition-colors">
      {label}
    </span>
  </Link>
);

const MenuCardFooter = () => {
  return (
    <Box 
      sx={{ 
        position: 'fixed', 
        bottom: 25, 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 1000,
        width: { xs: '92%', sm: '480px' },
        pointerEvents: 'none'
      }}
    >
      <Box 
        sx={{ 
          pointerEvents: 'auto',
          background: 'rgba(49, 24, 7, 0.96)',
          color: '#ccd88f',
          borderRadius: '40px',
          py: 1.8,
          px: 4,
          boxShadow: '0 15px 45px rgba(0,0,0,0.7)',
          border: '2px solid #996E19',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          backdropFilter: 'blur(12px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '3px',
            borderRadius: '37px',
            border: '1px solid rgba(153, 110, 25, 0.3)',
            pointerEvents: 'none'
          }
        }}
      >
        <FooterNav icon={<MdHome size={22} />} label="Home" />
        <div className="w-[1px] h-6 bg-[#996E19]/40" />
        <FooterNav icon={<MdOutlineCategory size={22} />} label="Designs" />
        <div className="w-[1px] h-6 bg-[#996E19]/40" />
        <FooterNav icon={<MdOutlineShoppingCart size={22} />} label="Bag" />
        <div className="w-[1px] h-6 bg-[#996E19]/40" />
        <FooterNav icon={<MdPersonOutline size={22} />} label="Profile" />
      </Box>
    </Box>
  );
};

export default MenuCardFooter;
