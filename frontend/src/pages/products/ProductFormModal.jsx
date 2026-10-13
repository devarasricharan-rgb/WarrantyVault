import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { productApi } from '../../api/client';

const CATEGORIES = [
  { value: 'MOBILE_PHONES', label: 'Mobile Phones' },
  { value: 'LAPTOPS_AND_COMPUTERS', label: 'Laptops & Computers' },
  { value: 'TVS_AND_MONITORS', label: 'TVs & Monitors' },
  { value: 'AUDIO_DEVICES', label: 'Audio Devices' },
  { value: 'HOME_APPLIANCES', label: 'Home Appliances' },
  { value: 'CAMERAS', label: 'Cameras' },
  { value: 'GAMING_DEVICES', label: 'Gaming Devices' },
  { value: 'OTHER', label: 'Other' },
];

export const ProductFormModal = ({ open, onClose, onSuccess, initialProduct = null }) => {
  const isEditing = Boolean(initialProduct);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('MOBILE_PHONES');
  const [modelNumber, setModelNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyDurationMonths, setWarrantyDurationMonths] = useState(12);
  const [warrantyStartDate, setWarrantyStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setBrand(initialProduct.brand || '');
      setCategory(initialProduct.category || 'MOBILE_PHONES');
      setModelNumber(initialProduct.modelNumber || '');
      setSerialNumber(initialProduct.serialNumber || '');
      setPurchasePrice(initialProduct.purchasePrice ? String(initialProduct.purchasePrice) : '');
      setPurchaseDate(initialProduct.purchaseDate || new Date().toISOString().split('T')[0]);
      setWarrantyDurationMonths(initialProduct.warrantyDurationMonths || 12);
      setWarrantyStartDate(initialProduct.warrantyStartDate || '');
      setDescription(initialProduct.description || '');
      setReceiptFile(null);
    } else {
      setName('');
      setBrand('');
      setCategory('MOBILE_PHONES');
      setModelNumber('');
      setSerialNumber('');
      setPurchasePrice('');
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setWarrantyDurationMonths(12);
      setWarrantyStartDate('');
      setDescription('');
      setReceiptFile(null);
    }
    setError('');
  }, [initialProduct, open]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size exceeds the maximum allowed limit of 10MB.');
        return;
      }
      setReceiptFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !brand.trim() || !purchasePrice || !purchaseDate || !warrantyDurationMonths) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productData = {
        name: name.trim(),
        brand: brand.trim(),
        category,
        modelNumber: modelNumber.trim() || null,
        serialNumber: serialNumber.trim() || null,
        purchasePrice: parseFloat(purchasePrice),
        purchaseDate,
        warrantyDurationMonths: parseInt(warrantyDurationMonths, 10),
        warrantyStartDate: warrantyStartDate || purchaseDate,
        description: description.trim() || null,
      };

      if (receiptFile) {
        const formData = new FormData();
        formData.append(
          'product',
          new Blob([JSON.stringify(productData)], { type: 'application/json' })
        );
        formData.append('receipt', receiptFile);

        if (isEditing) {
          await productApi.update(initialProduct.id, formData);
        } else {
          await productApi.create(formData);
        }
      } else {
        if (isEditing) {
          await productApi.update(initialProduct.id, productData);
        } else {
          await productApi.create(productData);
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Save product error:', err);
      const msg = err.response?.data?.message || 'Failed to save product. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEditing ? 'Edit Product' : 'Add New Product'}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" id="product-form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Product Name"
                placeholder="e.g. MacBook Pro 16"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Brand"
                placeholder="e.g. Apple"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                required
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Model Number"
                placeholder="e.g. A2485"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Serial Number"
                placeholder="e.g. C02G789ABC"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Purchase Price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="date"
                label="Purchase Date"
                InputLabelProps={{ shrink: true }}
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Warranty Months"
                placeholder="e.g. 12, 24"
                value={warrantyDurationMonths}
                onChange={(e) => setWarrantyDurationMonths(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Warranty Start Date (Optional)"
                InputLabelProps={{ shrink: true }}
                helperText="Defaults to purchase date if left blank"
                value={warrantyStartDate}
                onChange={(e) => setWarrantyStartDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  border: '1px dashed #CBD5E1',
                  borderRadius: 2,
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: '#F8FAFC',
                  height: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon sx={{ color: '#64748B' }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 160 }}>
                      {receiptFile ? receiptFile.name : initialProduct?.hasReceipt ? 'Receipt Attached' : 'Attach Receipt'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PDF, JPG, PNG (Max 10MB)
                    </Typography>
                  </Box>
                </Box>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes & Description"
                placeholder="Store purchase location, notes, extended coverage details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="product-form"
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : isEditing ? 'Update Product' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductFormModal;
