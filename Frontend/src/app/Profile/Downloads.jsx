'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import { FiDownload } from 'react-icons/fi';
import { API_URL, useAuthStore } from '@/Store/authStore';
import axiosClient from '@/lib/axiosClient';
import { useDownloadStore } from '@/Store/DownloadStore';
import { useSnackbar } from 'notistack';
import { useShallow } from 'zustand/react/shallow';

const Downloads = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [filterQuery, setFilterQuery] = useState('');

  // ✅ Access Zustand store directly (no custom hook)
  const {
    downloads,
    totalDownloads,
    totalPages,
    currentPage,
    isLoading,
    error,
    fetchDownloads,
    searchDownloads,
    setCurrentPage,
  } = useDownloadStore(
    useShallow((s) => ({
      downloads: s.downloads,
      totalDownloads: s.totalDownloads,
      totalPages: s.totalPages,
      currentPage: s.currentPage,
      isLoading: s.isLoading,
      error: s.error,
      fetchDownloads: s.fetchDownloads,
      searchDownloads: s.searchDownloads,
      setCurrentPage: s.setCurrentPage,
    }))
  );


  // ✅ Debounced search or reset
  useEffect(() => {
    const timer = setTimeout(() => {
      const query = filterQuery.trim();
      if (query) {
        searchDownloads(query);
      } else {
        setCurrentPage(1);
        fetchDownloads(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filterQuery]);

  // ✅ Fetch when page changes (no search active)
  useEffect(() => {
    if (!filterQuery.trim()) {
      fetchDownloads(currentPage);
    }
  }, [currentPage]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleDownload = async (item) => {
    try {
      const response = await axiosClient.get(
        `/api/downloads/${item.productId}/${item.optionId}`,
        { responseType: 'blob' }
      );

      const contentDisposition = response.headers['content-disposition'];
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let fileName = `${item.productName}_${item.optionMachine.replace(/\s+/g, '_')}`;

      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        } else {
          fileName += contentType.includes('pdf') ? '.pdf' : '.zip';
        }
      } else {
        fileName += contentType.includes('pdf') ? '.pdf' : '.zip';
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: contentType }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar(`Download started: ${fileName}`, { variant: 'success' });
    } catch (err) {
      console.error('Download failed:', err);
      enqueueSnackbar('Failed to download file.', { variant: 'error' });
    }
  };

  // Flatten regular orders only
  const flattenedItems = (() => {
    const result = [];

    for (const order of downloads) {
      for (const product of order.products || []) {
        const productData = product.product;
        const productId = productData?._id;
        const productImage = productData?.image;
        const productModel = productData?.productModel || 'N/A';

        for (const opt of product.options || []) {
          const option = opt.option;
          const optionId = option?._id;
          const optionMachine = option?.name || 'N/A';

          const orderCreatedAt = order.createdAt || order.date_added;
          const expiryDate = orderCreatedAt ? new Date(new Date(orderCreatedAt).setMonth(new Date(orderCreatedAt).getMonth() + 3)) : null;

          result.push({
            isCustom: false,
            orderId: order._id,
            orderNumber: order.orderNumber,
            orderDate: orderCreatedAt,
            expiryDate,
            productId,
            productName: productModel,
            productImage,
            optionId,
            optionMachine,
          });
        }
      }
    }
    return result;
  })();

  return (
    <div className="rounded-xl border-2 border-(--primary) my-4 md:my-0 mx-0 md:mx-8">
      <h6 className="border-b-2 border-(--primary) text-2xl font-semibold p-4 text-(--secondary)">
        Downloads
      </h6>

      {/* 🔍 Search Input */}
      <div className="px-4 flex justify-center my-5 pb-2">
        <input
          type="text"
          placeholder="Search by Order Number, Product Model, or Machine..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B4513]"
        />
      </div>

      <div className="flex flex-col gap-4 p-4">
        {isLoading && (
          <div className="flex justify-center items-center py-10">
            <CircularProgress />
          </div>
        )}

        {error && <p className="text-red-500">{error}</p>}

        {!isLoading && flattenedItems.length === 0 && (
          <p className="text-center py-10 text-gray-500">No matching downloads found. (Links expire after 3 months)</p>
        )}

        {!isLoading &&
          flattenedItems.map((item, idx) => {
            const isExpired = item.expiryDate && new Date() > item.expiryDate;

            return (
              <div
                key={`${item.orderId}-${item.productId}-${item.optionId}-${idx}`}
                className={`flex items-center md:items-center flex-col md:flex-row justify-between bg-white shadow-lg rounded-xl p-4 gap-4 flex-wrap border-l-4 ${isExpired ? 'border-red-400 opacity-75' : 'border-[#ccd88f]'}`}
              >
                {/* Image */}
                <div className="w-[60px] h-[60px] relative border rounded overflow-hidden shrink-0">
                  {item.productImage ? (
                    <Image
                      src={`${API_URL}/${item.productImage}`}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-100">
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Name */}
                <div className="flex-1 min-w-[100px]">
                  <p className="text-xs text-gray-500 uppercase font-bold">Product</p>
                  <p className="font-semibold text-[#8B4513] truncate">{item.productName}</p>
                </div>

                {/* Machine Name */}
                <div className="flex-1 min-w-[120px]">
                  <p className="text-xs text-gray-500 uppercase font-bold">Machine</p>
                  <p className="text-gray-700">{item.optionMachine}</p>
                </div>

                {/* Order Number */}
                <div className="flex-1 min-w-[80px]">
                  <p className="text-xs text-gray-500 uppercase font-bold">Order ID</p>
                  <p className="text-gray-700">#{item.orderNumber}</p>
                </div>

                {/* Dates */}
                <div className="flex-1 flex flex-col md:flex-row gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Purchased</p>
                    <p className="text-gray-700">{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className={`text-xs uppercase font-bold ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>Expires</p>
                    <p className={isExpired ? 'text-red-600 font-bold' : 'text-gray-700'}>
                      {item.expiryDate ? item.expiryDate.toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Download Button */}
                <div className="shrink-0">
                  {isExpired ? (
                    <span className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1 rounded-full border border-red-200">Expired</span>
                  ) : (
                    <button
                      onClick={() => handleDownload(item)}
                      className="bg-(--primary) border-2 border-(--primary) hover:bg-white text-(--secondary) hover:text-(--primary) font-semibold px-6 py-2 rounded-lg transition cursor-pointer flex items-center gap-2"
                      title="Download"
                    >
                      <FiDownload size={18} />
                      Download
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {/* Pagination only when not searching */}
        {totalPages > 1 && !filterQuery && (
          <Stack spacing={2} alignItems="center" className="mt-6">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              color="primary"
              shape="rounded"
              size="large"
            />
          </Stack>
        )}
      </div>
    </div>
  );
};

export default Downloads;

