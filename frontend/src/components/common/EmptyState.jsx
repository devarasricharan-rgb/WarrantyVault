import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

export const EmptyState = ({
  icon: Icon = Inventory2OutlinedIcon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      py: 8,
      px: 3,
      borderRadius: 4,
      bgcolor: '#FFFFFF',
      border: '1px dashed #CBD5E1',
    }}
  >
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        bgcolor: '#EEF2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#4F46E5',
        mb: 2,
      }}
    >
      <Icon sx={{ fontSize: 32 }} />
    </Box>
    <Typography variant="h6" fontWeight={600} gutterBottom>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionLabel ? 3 : 0 }}>
      {description}
    </Typography>
    {actionLabel && onAction && (
      <Button variant="contained" color="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
