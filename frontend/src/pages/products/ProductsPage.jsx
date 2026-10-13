import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BuildIcon from '@mui/icons-material/Build';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductFormModal from './ProductFormModal';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'MOBILE_PHONES', label: 'Mobile Phones' },
  { value: 'LAPTOPS_AND_COMPUTERS', label: 'Laptops & Computers' },
  { value: 'TVS_AND_MONITORS', label: 'TVs & Monitors' },
  { value: 'AUDIO_DEVICES', label: 'Audio Devices' },
  { value: 'HOME_APPLIANCES', label: 'Home Appliances' },
  { value: 'CAMERAS', label: 'Cameras' },
  { value: 'GAMING_DEVICES', label: 'Gaming Devices' },
  { value: 'OTHER', label: 'Other' },
];

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [statusTab, setStatusTab] = useState(searchParams.get('status') || 'ALL');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setSelectedProduct(null);
      setFormModalOpen(true);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 9,
      };

      if (keyword.trim()) params.keyword = keyword.trim();
      if (category) params.category = category;
      if (statusTab !== 'ALL') params.status = statusTab;

      const res = await productApi.getAll(params);
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Unable to load products. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, statusTab, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleStatusTabChange = (event, newValue) => {
    setStatusTab(newValue);
    setPage(0);
    if (newValue === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', newValue);
    }
    setSearchParams(searchParams);
  };

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (prod, e) => {
    e.stopPropagation();
    setSelectedProduct(prod);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (prod, e) => {
    e.stopPropagation();
    setProductToDelete(prod);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productApi.delete(productToDelete.id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete product.');
    }
  };

  return (
    <Box>
      {/* Top Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A' }}>
            Products & Warranties
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your items, warranty periods, and uploaded receipt documentation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2.5 }}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Status Filter Tabs */}
      <Tabs
        value={statusTab}
        onChange={handleStatusTabChange}
        sx={{
          mb: 3,
          borderBottom: '1px solid #E2E8F0',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' },
        }}
      >
        <Tab label="All Products" value="ALL" />
        <Tab label="Active Warranties" value="ACTIVE" />
        <Tab label="Expiring Soon (<30d)" value="EXPIRING_SOON" />
        <Tab label="Expired Warranties" value="EXPIRED" />
      </Tabs>

      {/* Filter Bar: Keyword and Category */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by product name, brand, or model..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
            Search
          </Button>
        </Box>
      </Card>

      {/* Product Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching warranty inventory..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="You haven't added any products matching the current criteria yet."
          actionLabel="Add Your First Product"
          onAction={handleOpenAdd}
        />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {products.map((prod) => (
              <Grid item xs={12} sm={6} md={4} key={prod.id}>
                <Card
                  onClick={() => navigate(`/products/${prod.id}`)}
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: '#4F46E5',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <StatusBadge status={prod.warrantyStatus} />
                      {prod.hasReceipt && (
                        <Tooltip title="Receipt Attached">
                          <Chip
                            icon={<ReceiptLongIcon style={{ fontSize: 16 }} />}
                            label="Receipt"
                            size="small"
                            variant="outlined"
                            sx={{ color: '#0EA5E9', borderColor: '#BAE6FD', bgcolor: '#F0F9FF' }}
                          />
                        </Tooltip>
                      )}
                    </Box>

                    <Typography variant="h6" fontWeight={700} noWrap sx={{ color: '#0F172A', mt: 1 }}>
                      {prod.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1.5 }}>
                      {prod.brand} {prod.modelNumber ? `• ${prod.modelNumber}` : ''}
                    </Typography>

                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Expires:
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="#0F172A">
                          {prod.warrantyExpiryDate}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Coverage:
                        </Typography>
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{
                            color:
                              prod.warrantyStatus === 'EXPIRED'
                                ? '#EF4444'
                                : prod.warrantyStatus === 'EXPIRING_SOON'
                                ? '#F59E0B'
                                : '#10B981',
                          }}
                        >
                          {prod.daysRemaining > 0 ? `${prod.daysRemaining} days left` : 'Expired'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Card Bottom Bar */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                      ${prod.purchasePrice?.toFixed(2)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/products/${prod.id}`);
                          }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Product">
                        <IconButton size="small" onClick={(e) => handleOpenEdit(prod, e)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Product">
                        <IconButton size="small" color="error" onClick={(e) => handleOpenDelete(prod, e)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, val) => setPage(val - 1)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={fetchProducts}
        initialProduct={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? Any attached receipts and repair histories will also be permanently deleted.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ProductsPage;
