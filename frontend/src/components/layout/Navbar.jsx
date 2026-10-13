import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notificationApi } from '../../api/client';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [userAnchor, setUserAnchor] = useState(null);

  const fetchNotificationData = async () => {
    try {
      const [countRes, recentRes] = await Promise.all([
        notificationApi.getUnreadCount(),
        notificationApi.getRecent(),
      ]);
      setUnreadCount(countRes.data.unreadCount || 0);
      setRecentNotifications(recentRes.data || []);
    } catch (err) {
      console.error('Error fetching notification summary:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotificationData();
      const interval = setInterval(fetchNotificationData, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleOpenNotifications = (event) => {
    setNotifAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotifAnchor(null);
  };

  const handleOpenUserMenu = (event) => {
    setUserAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserAnchor(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notif) => {
    handleCloseNotifications();
    if (!notif.isRead) {
      try {
        await notificationApi.markRead(notif.id);
        fetchNotificationData();
      } catch (err) {
        console.error('Error marking notification read:', err);
      }
    }
    if (notif.productId) {
      navigate(`/products/${notif.productId}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #E2E8F0',
        color: '#0F172A',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Brand / Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A', lineHeight: 1.1 }}>
              WarrantyVault
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, letterSpacing: '0.02em' }}>
              Warranty & Repair Tracker
            </Typography>
          </Box>
        </Box>

        {/* Right Action Icons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notifications Bell */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleOpenNotifications}
            sx={{
              bgcolor: notifAnchor ? '#EEF2FF' : '#F1F5F9',
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon sx={{ color: '#475569' }} />
            </Badge>
          </IconButton>

          {/* Notifications Popover Menu */}
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={handleCloseNotifications}
            PaperProps={{
              sx: {
                width: 340,
                maxHeight: 420,
                borderRadius: 3,
                mt: 1.5,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0',
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Notifications ({unreadCount} new)
              </Typography>
              <Button
                size="small"
                onClick={() => {
                  handleCloseNotifications();
                  navigate('/notifications');
                }}
              >
                View all
              </Button>
            </Box>
            <Divider />
            {recentNotifications.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              recentNotifications.map((notif) => (
                <MenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notif.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.04)',
                    borderLeft: notif.isRead ? 'none' : '3px solid #4F46E5',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" fontWeight={notif.isRead ? 500 : 700} noWrap>
                      {notif.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {notif.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* User Profile Avatar & Menu */}
          <Box
            onClick={handleOpenUserMenu}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              p: 0.5,
              borderRadius: 2,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#4F46E5',
                fontSize: 15,
                fontWeight: 600,
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {user?.fullName || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>

          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={handleCloseUserMenu}
            PaperProps={{
              sx: {
                width: 200,
                borderRadius: 3,
                mt: 1.5,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                border: '1px solid #E2E8F0',
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleCloseUserMenu();
                navigate('/profile');
              }}
            >
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
              <ListItemIcon sx={{ color: '#EF4444' }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
