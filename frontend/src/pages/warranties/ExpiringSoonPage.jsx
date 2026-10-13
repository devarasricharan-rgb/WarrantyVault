import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  Pagination,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BuildIcon from '@mui/icons-material/Build';
import { useNavigate } from 'react-router-dom';
import { warrantyApi } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import RepairFormModal from '../repairs/RepairFormModal';

export const ExpiringSoonPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [repairModalOpen, setRepairModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  const fetchExpiring = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await warrantyApi.getExpiringSoon({ page, size: 9 });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load expiring warranties:', err);
      setError('Failed to fetch expiring warranties.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiring();
  }, [page]);

  const handleOpenRepairModal = (prodId, e) => {
    e.stopPropagation();
    setSelectedProductId(prodId);
    setRepairModalOpen(true);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <WarningAmberIcon sx={{ color: '#F59E0B', fontSize: 32 }} />
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A' }}>
            Expiring Soon
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Products with manufacturer or store warranty expiring within the next 30 days
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <LoadingSpinner message="Scanning expiring warranties..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={WarningAmberIcon}
          title="No Expiring Warranties"
          description="None of your registered products are expiring in the next 30 days."
          actionLabel="View All Products"
          onAction={() => navigate('/products')}
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
                    borderColor: '#FDE68A',
                    bgcolor: '#FFFDF5',
                    '&:hover': {
                      borderColor: '#F59E0B',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <StatusBadge status={prod.warrantyStatus} />
                      <Chip
                        label={`${prod.daysRemaining} days left`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(245, 158, 11, 0.15)',
                          color: '#B45309',
                          fontWeight: 700,
                        }}
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={700} noWrap sx={{ color: '#0F172A' }}>
                      {prod.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 2 }}>
                      {prod.brand} • {prod.categoryDisplayName}
                    </Typography>

                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #FEF3C7', mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Final Expiration Date:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="#92400E">
                        {prod.warrantyExpiryDate}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid #FEF3C7' }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<BuildIcon />}
                      onClick={(e) => handleOpenRepairModal(prod.id, e)}
                    >
                      Log Repair
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/products/${prod.id}`)}
                    >
                      View
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>

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

      {/* Repair Modal */}
      <RepairFormModal
        open={repairModalOpen}
        onClose={() => setRepairModalOpen(false)}
        onSuccess={fetchExpiring}
        defaultProductId={selectedProductId}
      />
    </Box>
  );
};

export default ExpiringSoonPage;
