import React from 'react';
import { Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import BuildIcon from '@mui/icons-material/Build';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';

export const StatusBadge = ({ status, size = 'small' }) => {
  if (!status) return null;

  switch (status) {
    case 'ACTIVE':
      return (
        <Chip
          icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
          label="Active"
          size={size}
          sx={{
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            color: '#059669',
            borderColor: 'rgba(16, 185, 129, 0.2)',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        />
      );
    case 'EXPIRING_SOON':
      return (
        <Chip
          icon={<WarningAmberIcon style={{ fontSize: 16 }} />}
          label="Expiring Soon"
          size={size}
          sx={{
            bgcolor: 'rgba(245, 158, 11, 0.1)',
            color: '#D97706',
            borderColor: 'rgba(245, 158, 11, 0.2)',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        />
      );
    case 'EXPIRED':
      return (
        <Chip
          icon={<ErrorOutlineIcon style={{ fontSize: 16 }} />}
          label="Expired"
          size={size}
          sx={{
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            color: '#DC2626',
            borderColor: 'rgba(239, 68, 68, 0.2)',
            borderWidth: 1,
            borderStyle: 'solid',
          }}
        />
      );
    case 'REQUESTED':
      return (
        <Chip
          icon={<HourglassEmptyIcon style={{ fontSize: 16 }} />}
          label="Requested"
          size={size}
          sx={{ bgcolor: '#F1F5F9', color: '#475569' }}
        />
      );
    case 'IN_PROGRESS':
      return (
        <Chip
          icon={<BuildIcon style={{ fontSize: 16 }} />}
          label="In Progress"
          size={size}
          sx={{ bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0284C7' }}
        />
      );
    case 'WAITING_FOR_PARTS':
      return (
        <Chip
          label="Waiting for Parts"
          size={size}
          sx={{ bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#D97706' }}
        />
      );
    case 'COMPLETED':
      return (
        <Chip
          icon={<CheckCircleIcon style={{ fontSize: 16 }} />}
          label="Completed"
          size={size}
          sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
        />
      );
    case 'CANCELLED':
      return (
        <Chip
          icon={<CancelIcon style={{ fontSize: 16 }} />}
          label="Cancelled"
          size={size}
          sx={{ bgcolor: '#F1F5F9', color: '#94A3B8' }}
        />
      );
    default:
      return <Chip label={status} size={size} />;
  }
};

export default StatusBadge;
