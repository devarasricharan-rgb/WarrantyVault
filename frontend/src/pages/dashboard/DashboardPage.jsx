import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BuildIcon from '@mui/icons-material/Build';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Could not connect to the backend server. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating warranty analytics..." />;
  }

  if (error || !stats) {
    return (
      <EmptyState
        title="Dashboard Unavailable"
        description={error || 'Unable to load metrics'}
        actionLabel="Retry"
        onAction={fetchStats}
      />
    );
  }

  const metricCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Inventory2Icon,
      color: '#4F46E5',
      bgcolor: '#EEF2FF',
      onClick: () => navigate('/products'),
    },
    {
      title: 'Active Warranties',
      value: stats.activeWarranties,
      icon: CheckCircleOutlineIcon,
      color: '#10B981',
      bgcolor: '#ECFDF5',
      onClick: () => navigate('/products?status=ACTIVE'),
    },
    {
      title: 'Expiring Soon (<30d)',
      value: stats.expiringSoonWarranties,
      icon: WarningAmberIcon,
      color: '#F59E0B',
      bgcolor: '#FFFBEB',
      onClick: () => navigate('/warranties/expiring'),
    },
    {
      title: 'Expired Warranties',
      value: stats.expiredWarranties,
      icon: HighlightOffIcon,
      color: '#EF4444',
      bgcolor: '#FEF2F2',
      onClick: () => navigate('/products?status=EXPIRED'),
    },
    {
      title: 'Protected Value',
      value: `$${(stats.totalValueProtected || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: AttachMoneyIcon,
      color: '#0EA5E9',
      bgcolor: '#F0F9FF',
      onClick: () => navigate('/products'),
    },
    {
      title: 'Total Repair Costs',
      value: `$${(stats.totalRepairCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: BuildIcon,
      color: '#8B5CF6',
      bgcolor: '#F5F3FF',
      onClick: () => navigate('/repairs'),
    },
  ];

  return (
    <Box>
      {/* Header Greeting & Quick Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', mb: 0.5 }}>
            Hello, {user?.fullName || 'User'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here is your warranty protection overview and upcoming reminders.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<BuildIcon />}
            onClick={() => navigate('/repairs?action=add')}
            sx={{ borderRadius: 2.5 }}
          >
            Log Repair
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products?action=add')}
            sx={{ borderRadius: 2.5 }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                onClick={card.onClick}
                sx={{
                  cursor: 'pointer',
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderColor: card.color,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 3,
                    bgcolor: card.bgcolor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                    {card.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: '#0F172A', mt: 0.3 }}>
                    {card.value}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Main Content: Two Columns */}
      <Grid container spacing={3}>
        {/* Column 1: Expiring Soon Warranties */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon sx={{ color: '#F59E0B' }} />
                <Typography variant="h6" fontWeight={700}>
                  Expiring Soon Warranties
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/warranties/expiring')}
              >
                View all
              </Button>
            </Box>

            {stats.expiringSoonProducts.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 44, color: '#10B981', mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  All Warranties Protected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No products are expiring within the next 30 days.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Brand</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Remaining</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.expiringSoonProducts.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{item.name}</TableCell>
                        <TableCell color="text.secondary">{item.brand}</TableCell>
                        <TableCell>{item.warrantyExpiryDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${item.daysRemaining} days`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              color: '#D97706',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Product Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/products/${item.id}`)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>

        {/* Column 2: Category Distribution */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Category Breakdown
            </Typography>

            {stats.categoryDistribution.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Add products to view category distribution
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {stats.categoryDistribution.map((cat, i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {cat.displayName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cat.count} items ({cat.percentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={cat.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: '#F1F5F9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #4F46E5 0%, #0EA5E9 100%)',
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>

        {/* Recent Repairs Row */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BuildIcon sx={{ color: '#8B5CF6' }} />
                <Typography variant="h6" fontWeight={700}>
                  Recent Repair Activity
                </Typography>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/repairs')}
              >
                View all repairs
              </Button>
            </Box>

            {stats.recentRepairs.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No repair logs recorded yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Issue</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Service Center</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentRepairs.map((rep) => (
                      <TableRow key={rep.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{rep.productName}</TableCell>
                        <TableCell>{rep.issueTitle}</TableCell>
                        <TableCell color="text.secondary">{rep.serviceCenterName}</TableCell>
                        <TableCell>{rep.requestDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={rep.status} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {rep.cost ? `$${rep.cost.toFixed(2)}` : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
