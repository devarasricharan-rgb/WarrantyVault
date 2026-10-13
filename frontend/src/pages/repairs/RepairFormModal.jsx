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
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Alert,
  CircularProgress,
} from '@mui/material';
import { productApi, repairApi } from '../../api/client';

const REPAIR_STATUSES = [
  { value: 'REQUESTED', label: 'Requested' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_PARTS', label: 'Waiting for Parts' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const RepairFormModal = ({
  open,
  onClose,
  onSuccess,
  initialRepair = null,
  defaultProductId = null,
}) => {
  const isEditing = Boolean(initialRepair);

  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState(defaultProductId || '');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceCenterName, setServiceCenterName] = useState('');
  const [serviceCenterContact, setServiceCenterContact] = useState('');
  const [status, setStatus] = useState('REQUESTED');
  const [cost, setCost] = useState('');
  const [warrantyClaim, setWarrantyClaim] = useState(false);
  const [completionDate, setCompletionDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const res = await productApi.getAll({ size: 100 });
        setProducts(res.data.content || []);
      } catch (err) {
        console.error('Failed to fetch product list for repair modal:', err);
      }
    };
    if (open) {
      fetchUserProducts();
    }
  }, [open]);

  useEffect(() => {
    if (initialRepair) {
      setProductId(initialRepair.productId || '');
      setIssueTitle(initialRepair.issueTitle || '');
      setIssueDescription(initialRepair.issueDescription || '');
      setRequestDate(initialRepair.requestDate || new Date().toISOString().split('T')[0]);
      setServiceCenterName(initialRepair.serviceCenterName || '');
      setServiceCenterContact(initialRepair.serviceCenterContact || '');
      setStatus(initialRepair.status || 'REQUESTED');
      setCost(initialRepair.cost ? String(initialRepair.cost) : '');
      setWarrantyClaim(initialRepair.warrantyClaim || false);
      setCompletionDate(initialRepair.completionDate || '');
      setNotes(initialRepair.notes || '');
    } else {
      setProductId(defaultProductId || '');
      setIssueTitle('');
      setIssueDescription('');
      setRequestDate(new Date().toISOString().split('T')[0]);
      setServiceCenterName('');
      setServiceCenterContact('');
      setStatus('REQUESTED');
      setCost('');
      setWarrantyClaim(false);
      setCompletionDate('');
      setNotes('');
    }
    setError('');
  }, [initialRepair, defaultProductId, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !issueTitle.trim() || !issueDescription.trim() || !serviceCenterName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        productId: Number(productId),
        issueTitle: issueTitle.trim(),
        issueDescription: issueDescription.trim(),
        requestDate,
        serviceCenterName: serviceCenterName.trim(),
        serviceCenterContact: serviceCenterContact.trim() || null,
        status,
        cost: cost ? parseFloat(cost) : null,
        warrantyClaim,
        completionDate: completionDate || null,
        notes: notes.trim() || null,
      };

      if (isEditing) {
        await repairApi.update(initialRepair.id, payload);
      } else {
        await repairApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Save repair error:', err);
      const msg = err.response?.data?.message || 'Failed to save repair log.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? 'Update Repair Log' : 'Log New Repair'}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <form id="repair-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                required
                fullWidth
                label="Product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={Boolean(defaultProductId) || isEditing}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} ({p.brand})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Issue Title"
                placeholder="e.g. Battery not holding charge"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={2}
                label="Issue Description"
                placeholder="Explain the symptom or damage..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Request / Drop-off Date"
                InputLabelProps={{ shrink: true }}
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {REPAIR_STATUSES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Service Center Name"
                placeholder="e.g. Official Brand Store"
                value={serviceCenterName}
                onChange={(e) => setServiceCenterName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Service Center Contact"
                placeholder="Phone or ticket number"
                value={serviceCenterContact}
                onChange={(e) => setServiceCenterContact(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Repair Cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Completion Date"
                InputLabelProps={{ shrink: true }}
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={warrantyClaim}
                    onChange={(e) => setWarrantyClaim(e.target.checked)}
                    color="primary"
                  />
                }
                label="Covered under manufacturer / warranty claim"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Technician Notes"
                placeholder="Diagnostic outcome, parts replaced..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="repair-form"
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : isEditing ? 'Update Repair' : 'Log Repair'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepairFormModal;
