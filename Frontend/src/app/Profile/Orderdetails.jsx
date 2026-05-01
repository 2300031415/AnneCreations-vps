'use client';

import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import axiosClient from '@/lib/axiosClient';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const OrderDetails = ({ order, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  if (!order) return null;

  const renderDescription = (description) => {
    if (!description) return null;
    if (description.includes('**')) {
      const parts = description.split('\n').filter(line => line.trim() !== '');
      return (
        <div className="space-y-1">
          {parts.map((part, index) => {
            if (part.includes('**')) {
              const [label, ...valueParts] = part.split('**').filter(p => p.trim() !== '');
              const value = valueParts.join(' ').replace(':', '').trim();
              if (!label || !value) return <div key={index}>{part}</div>;
              return (
                <div key={index} className="flex gap-1 flex-wrap">
                  <span className="font-bold text-(--secondary)">{label}:</span>
                  <span className="text-(--secondary)">{value}</span>
                </div>
              );
            }
            return <div key={index}>{part}</div>;
          })}
        </div>
      );
    }
    return description;
  };

  // Flatten standard product options
  const allItems = order.products?.flatMap(product =>
    (product.options || []).map(option => ({
      isCustom: false,
      productId: product.product?._id,
      name: product.product?.productModel || 'N/A',
      optionId: option.option?._id,
      option: option.option?.name || 'N/A',
      price: option.price || 0,
      quantity: 1
    }))
  ) || [];

  const pageCount = Math.ceil(allItems.length / itemsPerPage);
  const displayedItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDownload = async (item) => {
    try {
      const response = await axiosClient.get(
        `/api/downloads/${item.productId}/${item.optionId}`,
        { responseType: 'blob' }
      );

      const contentDisposition = response.headers['content-disposition'];
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let fileName = `${item.name}_${item.option.replace(/\s+/g, '_')}`;

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

  const handlePageChange = (event, value) => setPage(value);

  return (
    <div className="rounded-xl my-2 lg:my-0 lg:ml-5 border-2 border-(--primary) text-sm max-w-full">
      {/* Header */}
      <div className="border-b-2 border-(--primary) text-xl sm:text-2xl font-semibold p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        Order Details
        <button
          onClick={onClose}
          className="text-(--secondary) cursor-pointer text-sm border border-(--primary) px-3 py-1 rounded-lg hover:bg-(--primary) hover:text-white transition"
        >
          Close
        </button>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <ul className="space-y-2">
          <li className="flex justify-between flex-wrap">
            <span className="text-(--secondary) font-semibold">Order Number:</span>
            <span>{order.orderNumber}</span>
          </li>
          <li className="flex justify-between flex-wrap">
            <span className="text-(--secondary) font-semibold">Order Date:</span>
            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
          </li>
          <li className="flex justify-between flex-wrap">
            <span className="text-(--secondary) font-semibold">Status:</span>
            <span className="uppercase font-bold text-(--secondary)">{order.orderStatus}</span>
          </li>
        </ul>

        <ul className="space-y-2 flex justify-between">
          <li className="font-medium text-(--secondary)">Payment Method:</li>
          <li>{order.payment?.method || 'N/A'}</li>
        </ul>
      </div>

      <hr className="border-(--primary) opacity-30 my-4 mx-4" />

      {/* Products Info */}
      <h4 className="text-(--secondary) font-bold text-center text-xl sm:text-2xl mb-4">Item Details</h4>

      {/* Desktop Table */}
      <div className="hidden sm:block px-4 pb-4">
        <table className="min-w-full border border-gray-200 text-sm table-auto">
          <thead className="bg-[#f9f9f9]">
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">Item Name</th>
              <th className="px-4 py-3 text-left">Requirements / Options</th>
              <th className="px-4 py-3 text-left text-center">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-center">Download</th>
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-(--secondary)">{item.name}</td>
                <td className="px-4 py-3">
                  {item.isCustom ? renderDescription(item.option) : item.option}
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-bold">₹{item.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  {order.orderStatus === 'paid' && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center cursor-pointer justify-center rounded-full bg-(--primary) p-2 hover:bg-(--primary) transition-colors"
                      title="Download"
                    >
                      <FaDownload size={14} color="white" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden flex flex-col gap-4 p-4">
        {displayedItems.map((item, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 bg-white shadow-sm border-l-4 border-l--(--)">
            <div className="flex justify-between items-start">
              <span className="font-bold text-(--secondary) text-lg">{item.name}</span>
              <span className="font-bold text-(--secondary)">₹{item.price.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-semibold block mb-1">Details:</span>
              <div className="text-gray-600 bg-gray-50 p-2 rounded">
                {item.isCustom ? renderDescription(item.option) : item.option}
              </div>
            </div>
            {order.orderStatus === 'paid' && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => handleDownload(item)}
                  className="flex items-center justify-center rounded-lg gap-2 bg-(--primary) px-4 py-2 text-white font-bold"
                >
                  <FaDownload size={14} /> Download File
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center my-4">
          <Stack spacing={2}>
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;

