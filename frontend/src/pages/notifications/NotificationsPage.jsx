import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Tabs,
  Tab,
  Pagination,
  Alert,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BuildIcon from '@mui/icons-material/Build';
import InfoIcon from '@mui/icons-material/Info';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../api/client';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL');
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationApi.getAll({
        page,
        size: 15,
      });
      setNotifications(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationApi.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = filterTab === 'UNREAD'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EXPIRY_WARNING':
        return <WarningAmberIcon sx={{ color: '#F59E0B' }} />;
      case 'REPAIR_UPDATE':
        return <BuildIcon sx={{ color: '#0EA5E9' }} />;
      default:
        return <InfoIcon sx={{ color: '#4F46E5' }} />;
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
            Notification Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Keep track of automated expiry alerts and service center progress
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
          sx={{ borderRadius: 2.5 }}
        >
          Mark All as Read
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter Tabs */}
      <Tabs
        value={filterTab}
        onChange={(e, val) => setFilterTab(val)}
        sx={{
          mb: 3,
          borderBottom: '1px solid #E2E8F0',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' },
        }}
      >
        <Tab label="All Notifications" value="ALL" />
        <Tab label="Unread Only" value="UNREAD" />
      </Tabs>

      {/* Notifications List */}
      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={NotificationsActiveIcon}
          title="All Caught Up!"
          description="You have no notifications in this category."
        />
      ) : (
        <Card sx={{ borderRadius: 3 }}>
          <List disablePadding>
            {filteredNotifications.map((notif, index) => (
              <ListItem
                key={notif.id}
                divider={index < filteredNotifications.length - 1}
                sx={{
                  py: 2,
                  px: 3,
                  bgcolor: notif.isRead ? '#FFFFFF' : 'rgba(79, 70, 229, 0.03)',
                  borderLeft: notif.isRead ? 'none' : '4px solid #4F46E5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  cursor: notif.productId ? 'pointer' : 'default',
                  '&:hover': { bgcolor: '#F8FAFC' },
                }}
                onClick={() => {
                  if (notif.productId) navigate(`/products/${notif.productId}`);
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notif.type)}
                  </ListItemIcon>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={notif.isRead ? 600 : 800}>
                        {notif.title}
                      </Typography>
                      {!notif.isRead && (
                        <Chip
                          label="New"
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
                      {notif.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {!notif.isRead && (
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={(e) => handleMarkAsRead(notif.id, e)}
                    >
                      Read
                    </Button>
                  )}
                  {notif.productId && (
                    <IconButton size="small">
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, borderTop: '1px solid #E2E8F0' }}>
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
    </Box>
  );
};

export default NotificationsPage;
