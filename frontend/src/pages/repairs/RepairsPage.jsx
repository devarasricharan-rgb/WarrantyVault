import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Pagination,
  Alert,
  Menu,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { repairApi } from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RepairFormModal from './RepairFormModal';

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_PARTS', label: 'Waiting for Parts' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const RepairsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [repairs, setRepairs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState(null);

  // Status Menu
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [activeRepairForStatus, setActiveRepairForStatus] = useState(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setSelectedRepair(null);
      setModalOpen(true);
    }
  }, [searchParams]);

  const fetchRepairs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 10,
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (status) params.status = status;

      const res = await repairApi.getAll(params);
      setRepairs(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load repairs:', err);
      setError('Failed to fetch repair history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchRepairs();
  };

  const handleOpenAdd = () => {
    setSelectedRepair(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rep) => {
    setSelectedRepair(rep);
    setModalOpen(true);
  };

  const handleOpenDelete = (rep) => {
    setRepairToDelete(rep);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!repairToDelete) return;
    try {
      await repairApi.delete(repairToDelete.id);
      setDeleteDialogOpen(false);
      setRepairToDelete(null);
      fetchRepairs();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete repair log.');
    }
  };

  const handleOpenStatusMenu = (rep, event) => {
    setActiveRepairForStatus(rep);
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleCloseStatusMenu = () => {
    setStatusMenuAnchor(null);
    setActiveRepairForStatus(null);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeRepairForStatus) return;
    try {
      await repairApi.updateStatus(activeRepairForStatus.id, {
        status: newStatus,
        cost: activeRepairForStatus.cost,
        completionDate: newStatus === 'COMPLETED' ? new Date().toISOString().split('T')[0] : null,
      });
      handleCloseStatusMenu();
      fetchRepairs();
    } catch (err) {
      console.error('Update status error:', err);
      setError('Failed to update repair status.');
    }
  };

  return (
    <Box>
      {/* Header */}
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
            Repair Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Log and manage service center repairs, timeline progression, and warranty coverage claims
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
          sx={{ borderRadius: 2.5 }}
        >
          Log Repair
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Bar */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Box
          component="form"
          onSubmit={handleSearchSubmit}
          sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by issue title, product name, or service center..."
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
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
          >
            {STATUS_FILTERS.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </TextField>
          <Button type="submit" variant="outlined" sx={{ whiteSpace: 'nowrap' }}>
            Search
          </Button>
        </Box>
      </Card>

      {/* Repairs Table */}
      {loading ? (
        <LoadingSpinner message="Fetching repair records..." />
      ) : repairs.length === 0 ? (
        <EmptyState
          title="No Repair Records"
          description="There are currently no repair records matching your filter."
          actionLabel="Log a Repair"
          onAction={handleOpenAdd}
        />
      ) : (
        <Card sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Issue Title</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service Center</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date Requested</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cost / Claim</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {repairs.map((rep) => (
                  <TableRow key={rep.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ cursor: 'pointer', color: '#4F46E5' }}
                        onClick={() => navigate(`/products/${rep.productId}`)}
                      >
                        {rep.productName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rep.productBrand}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {rep.issueTitle}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                        {rep.issueDescription}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{rep.serviceCenterName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {rep.serviceCenterContact || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{rep.requestDate}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StatusBadge status={rep.status} />
                        <Tooltip title="Update Status">
                          <IconButton size="small" onClick={(e) => handleOpenStatusMenu(rep, e)}>
                            <ChangeCircleOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {rep.warrantyClaim ? (
                        <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 700 }}>
                          Warranty Claim
                        </Typography>
                      ) : rep.cost ? (
                        <Typography variant="body2" fontWeight={700}>
                          ${rep.cost.toFixed(2)}
                        </Typography>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Repair">
                        <IconButton size="small" onClick={() => handleOpenEdit(rep)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Repair">
                        <IconButton size="small" color="error" onClick={() => handleOpenDelete(rep)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(e, val) => setPage(val - 1)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Card>
      )}

      {/* Quick Status Update Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleCloseStatusMenu}
        PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } }}
      >
        <MenuItem onClick={() => handleUpdateStatus('REQUESTED')}>Requested</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('IN_PROGRESS')}>In Progress</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('WAITING_FOR_PARTS')}>Waiting for Parts</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('COMPLETED')}>Completed</MenuItem>
        <MenuItem onClick={() => handleUpdateStatus('CANCELLED')}>Cancelled</MenuItem>
      </Menu>

      {/* Add / Edit Repair Modal */}
      <RepairFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchRepairs}
        initialRepair={selectedRepair}
      />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Repair Record"
        message="Are you sure you want to delete this repair record?"
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
};

export default RepairsPage;
