import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A' }}>
          Account & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal credentials, session security, and preferences
        </Typography>
      </Box>

      {/* User Overview Card */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#4F46E5',
              fontSize: 32,
              fontWeight: 700,
              boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)',
            }}
          >
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={700}>
                {user?.fullName || 'User'}
              </Typography>
              <Chip
                label={user?.role === 'ROLE_ADMIN' ? 'Administrator' : 'Standard User'}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2 }}
          >
            Sign Out
          </Button>
        </Box>
      </Card>

      {/* Profile Details Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Account Information
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PersonOutlineIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.fullName}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailOutlinedIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarMonthOutlinedIcon sx={{ color: '#64748B' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Member Since
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Security & Environment
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SecurityOutlinedIcon sx={{ color: '#10B981' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Authentication Status
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    JWT HMAC-SHA256 Stateless Token
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <DnsOutlinedIcon sx={{ color: '#0EA5E9' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    API Base URL
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Data Isolation:
                </Typography>
                <Typography variant="caption" fontWeight={600} color="#0F172A">
                  All products, warranties, repairs, and uploaded receipts are encrypted and isolated strictly to your account.
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
