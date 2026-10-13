import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import BuildIcon from '@mui/icons-material/Build';
import ReceiptIcon from '@mui/icons-material/Receipt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi, repairApi } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ProductFormModal from './ProductFormModal';
import RepairFormModal from '../repairs/RepairFormModal';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repairModalOpen, setRepairModalOpen] = useState(false);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const [prodRes, repRes] = await Promise.all([
        productApi.getById(id),
        repairApi.getByProduct(id),
      ]);
      setProduct(prodRes.data);
      setRepairs(repRes.data || []);
      setError('');
    } catch (err) {
      console.error('Failed to load product detail:', err);
      setError('Product not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [id]);

  const handleDeleteProduct = async () => {
    try {
      await productApi.delete(id);
      navigate('/products');
    } catch (err) {
      console.error('Delete product error:', err);
      setError('Failed to delete product.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading product details..." />;
  }

  if (error || !product) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Product not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/products')}>
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Back & Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/products')}
          sx={{ color: '#64748B' }}
        >
          Back to Products
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditOutlinedIcon />}
            onClick={() => setEditModalOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Title & Status Summary Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h4" fontWeight={800} color="#0F172A">
                {product.name}
              </Typography>
              <StatusBadge status={product.warrantyStatus} />
            </Box>
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              {product.brand} {product.modelNumber ? `• Model: ${product.modelNumber}` : ''}
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="caption" color="text.secondary" textTransform="uppercase" fontWeight={600}>
              Purchase Price
            </Typography>
            <Typography variant="h4" fontWeight={800} color="#4F46E5">
              ${product.purchasePrice?.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column: Warranty Specs & Receipt */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Warranty Specifications
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {product.categoryDisplayName || product.category}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Duration
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {product.warrantyDurationMonths} Months
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Purchase Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {product.purchaseDate}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Warranty Expiry Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {product.warrantyExpiryDate}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Days Remaining
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={700}
                  sx={{
                    color:
                      product.warrantyStatus === 'EXPIRED'
                        ? '#EF4444'
                        : product.warrantyStatus === 'EXPIRING_SOON'
                        ? '#F59E0B'
                        : '#10B981',
                  }}
                >
                  {product.daysRemaining > 0 ? `${product.daysRemaining} days left` : 'Expired'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Serial Number
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {product.serialNumber || '—'}
                </Typography>
              </Grid>
            </Grid>

            {product.description && (
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                <Typography variant="caption" color="text.secondary">
                  Description / Notes
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: '#334155' }}>
                  {product.description}
                </Typography>
              </Box>
            )}
          </Card>

          {/* Receipt Attachment Card */}
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Receipt Documentation
            </Typography>

            {product.hasReceipt ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ReceiptIcon sx={{ fontSize: 32, color: '#4F46E5' }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 220 }}>
                      {product.receiptOriginalName || product.receiptFileName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      File verified in vault
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadIcon />}
                  component="a"
                  href={productApi.getReceiptUrl(product.id)}
                  target="_blank"
                  download
                >
                  Download
                </Button>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <ReceiptIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No receipt document attached.
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1.5 }}
                  onClick={() => setEditModalOpen(true)}
                >
                  Attach Receipt
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column: Repair Records */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700}>
                Repair History ({repairs.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<BuildIcon />}
                onClick={() => setRepairModalOpen(true)}
              >
                Log Repair
              </Button>
            </Box>

            {repairs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <VerifiedUserIcon sx={{ fontSize: 48, color: '#10B981', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  No Repair Records
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This product has had no service or warranty repair claims.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {repairs.map((rep) => (
                  <Card
                    key={rep.id}
                    variant="outlined"
                    sx={{ p: 2, bgcolor: '#FAFAFA', borderRadius: 2 }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {rep.issueTitle}
                      </Typography>
                      <StatusBadge status={rep.status} />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {rep.issueDescription}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {rep.serviceCenterName} • {rep.requestDate}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#0F172A">
                        {rep.cost ? `Cost: $${rep.cost.toFixed(2)}` : 'Warranty Claim'}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Edit Modal */}
      <ProductFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={fetchProductData}
        initialProduct={product}
      />

      {/* Log Repair Modal */}
      <RepairFormModal
        open={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        onSuccess={fetchProductData}
        defaultProductId={product.id}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteProduct}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default ProductDetailPage;
