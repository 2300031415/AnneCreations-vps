'use client';

import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
} from '@mui/material';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import useCategory from '@/hook/useCategory';
import { useTranslation } from 'react-i18next';

const DesktopNav = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const pathname = usePathname();

  const { categories, isCategoriesLoading, error } = useCategory();

  const handleMouseEnter = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  // Navigation list
  const navigationlist = [
    { id: 1, name: t('nav.home'), link: '/' },
    {
      id: 3,
      name: t('nav.categories', 'Categories'),
      link: '#',
      // ensure we have an array and sort alphabetically
      subcategories: (categories || [])
        .filter(cat => cat.name && cat.name !== 'All')
        .sort((a, b) => a.name.localeCompare(b.name)),
    },
  ];

  return (
    <>
      {navigationlist.map((item) => {
        const hasSubcategories = !!item.subcategories;
        const isActive = pathname === item.link;

        return (
          <Box
            key={item.id}
            sx={{ position: 'relative', display: 'inline-block', backgroundColor: '#fff' }}
            onMouseEnter={hasSubcategories ? handleMouseEnter : undefined}
            onMouseLeave={hasSubcategories ? handleMouseLeave : undefined}
          >
            <Box
              className={`font-medium text-md flex items-center gap-1 lg:px-3 py-2 cursor-pointer ${isActive ? 'border-b-2 border-[var(--primary)]' : ''
                }`}
            >
              <Link href={item.link} className="text-md text-[var(--secondary)] font-semibold">
                {item.name}
              </Link>
              {hasSubcategories && (
                <span>
                  {open ? <FaChevronUp className="text-md" /> : <FaChevronDown className="text-md" />}
                </span>
              )}
            </Box>

            {hasSubcategories && item.subcategories.length > 0 && (
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMouseLeave}
                MenuListProps={{
                  onMouseLeave: handleMouseLeave,
                  sx: { pointerEvents: 'auto' },
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                keepMounted
                PaperProps={{
                  sx: {
                    mt: 1,
                    px: 2,
                    py: 2,
                    boxShadow: 4,
                    backgroundColor: '#fff',
                    overflowY: 'auto',
                    borderRadius: 2,
                  },
                }}
              >
                <MenuItem
                  disableRipple
                  disableGutters
                  sx={{
                    p: 0,
                    backgroundColor: 'white',
                    '&:hover': { backgroundColor: 'white' },
                  }}
                >
                  <TableContainer sx={{ backgroundColor: 'white' }}>
                    <Table sx={{ border: 'none' }} size="small">
                      <TableBody>
                        {(() => {
                          const uniqueSorted = Array.isArray(item.subcategories) ? item.subcategories : [];

                          const rows = uniqueSorted.reduce((rowsAcc, sub, i) => {
                            const rowIndex = Math.floor(i / 5);
                            if (!rowsAcc[rowIndex]) rowsAcc[rowIndex] = [];
                            rowsAcc[rowIndex].push(sub);
                            return rowsAcc;
                          }, []);

                          return rows.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                              {row.map((sub, subIndex) => (
                                <TableCell
                                  key={subIndex}
                                  sx={{
                                    border: 'none',
                                    px: 2,
                                    py: 1.5,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  <Link
                                    href={`/category/${sub._id}?name=${encodeURIComponent(sub.name)}`}
                                    className="text-sm text-[var(--secondary)] hover:underline hover:text-[var(--primary)]"
                                    onClick={handleMouseLeave}
                                  >
                                    {sub.name}
                                  </Link>
                                </TableCell>
                              ))}
                            </TableRow>
                          ));
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </MenuItem>
              </Menu>
            )}
          </Box>
        );
      })}
    </>
  );
};

export default DesktopNav;
