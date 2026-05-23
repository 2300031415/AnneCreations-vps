import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Button
} from '@mui/material';
import { MdClose, MdCloudUpload } from 'react-icons/md';
import { parseLocalFile, parseLocalZip } from '@/lib/zipLoader';

const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num || 0);

const DesignFileCard = ({ file }) => {
  const { fileName, format, stats, previewDataUrl } = file;
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 3,
        p: 2,
        borderRadius: '12px',
        border: '1px solid #eaeaea',
        backgroundColor: '#fff',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          width: '120px',
          height: '120px',
          flexShrink: 0,
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
        }}
      >
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={fileName}
            style={{ width: '90%', height: '90%', objectFit: 'contain' }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">No Preview</Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, width: '100%' }}>
        <Box display="flex" gap={1} alignItems="center" mb={1}>
          <Typography
            sx={{
              backgroundColor: '#e6eab8',
              color: '#311807',
              px: 1,
              py: 0.2,
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {format}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#444', wordBreak: 'break-all' }}>
            {fileName}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: '1px dashed #e0e0e0', my: 1.5 }} />

        <Box display="flex" gap={2} flexWrap="wrap" sx={{ color: '#666', fontSize: '13px' }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <span>≡</span>
            <strong>{formatNumber(stats.stitchCount)}</strong> stitches
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <span>🎨</span>
            <strong>{formatNumber(stats.colorCount)}</strong> colors
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <span>✂️</span>
            <strong>{formatNumber(stats.trimCount)}</strong> trims
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <span>📏</span>
            {stats.widthMm.toFixed(1)} x {stats.heightMm.toFixed(1)} mm
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              ({(stats.widthMm / 25.4).toFixed(2)} x {(stats.heightMm / 25.4).toFixed(2)} in)
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const GlobalStitchViewerModal = ({ open, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setFiles([]);
      setError(null);
      setIsProcessing(false);
    }, 300);
  };

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);
    setFiles([]);

    try {
      let parsedFiles = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.zip')) {
        parsedFiles = await parseLocalZip(file);
      } else if (fileName.endsWith('.dst') || fileName.endsWith('.pes') || fileName.endsWith('.jef')) {
        const parsed = await parseLocalFile(file);
        parsedFiles = [parsed];
      } else {
        throw new Error('Unsupported file format. Please upload .zip, .dst, .pes, or .jef');
      }

      if (parsedFiles.length === 0) {
        setError('No valid embroidery files found in the upload.');
      } else {
        setFiles(parsedFiles);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          m: 2,
          maxHeight: 'calc(100% - 32px)',
          backgroundColor: '#fdfdfd'
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <span style={{ fontSize: '20px' }}>👁️</span>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#311807' }}>
            Stitch Review Viewer
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{ color: '#999', '&:hover': { color: '#333' } }}
        >
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Upload Area */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed #ccd88f',
              borderRadius: '12px',
              p: 4,
              textAlign: 'center',
              backgroundColor: '#fafafa',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#f2f5df'
              },
              mb: files.length > 0 ? 3 : 0
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".zip,.dst,.pes,.jef"
              onChange={handleFileChange}
            />
            {isProcessing ? (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <CircularProgress size={32} sx={{ color: '#ccd88f' }} />
                <Typography color="text.secondary">Processing file...</Typography>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                <MdCloudUpload size={48} color="#ccd88f" />
                <Typography variant="h6" sx={{ color: '#311807', fontWeight: 600 }}>
                  Click or drag file to this area to upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports .zip packages, .dst, .pes, and .jef files.
                </Typography>
              </Box>
            )}
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center', fontWeight: 500 }}>
              {error}
            </Typography>
          )}

          {/* Results List */}
          {files.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600 }}>
                {files.length} design file{files.length !== 1 ? 's' : ''} loaded
              </Typography>
              {files.map((f, idx) => (
                <DesignFileCard key={idx} file={f} />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalStitchViewerModal;
