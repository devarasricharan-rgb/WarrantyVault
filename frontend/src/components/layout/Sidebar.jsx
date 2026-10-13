import React from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/', icon: DashboardOutlinedIcon },
  { label: 'Products & Warranties', path: '/products', icon: Inventory2OutlinedIcon },
  { label: 'Expiring Soon', path: '/warranties/expiring', icon: WarningAmberOutlinedIcon },
  { label: 'Repair Tracker', path: '/repairs', icon: BuildCircleOutlinedIcon },
  { label: 'Notifications', path: '/notifications', icon: NotificationsNoneOutlinedIcon },
  { label: 'My Profile', path: '/profile', icon: PersonOutlineOutlinedIcon },
];

export const Sidebar = ({ width = 260 }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width,
        flexShrink: 0,
        bgcolor: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="overline" sx={{ px: 1.5, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.08em' }}>
          Menu
        </Typography>
        <List component="nav" sx={{ mt: 1, p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 2,
                  color: isSelected ? '#4F46E5' : '#475569',
                  bgcolor: isSelected ? '#EEF2FF !important' : 'transparent',
                  fontWeight: isSelected ? 600 : 500,
                  '&:hover': {
                    bgcolor: isSelected ? '#EEF2FF' : '#F8FAFC',
                    color: isSelected ? '#4F46E5' : '#0F172A',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isSelected ? '#4F46E5' : '#64748B',
                  }}
                >
                  <Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.92rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Sidebar Footer Badge */}
      <Box sx={{ mt: 'auto', p: 2.5 }}>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
            border: '1px solid #C7D2FE',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: '#4F46E5',
              color: '#FFFFFF',
              display: 'flex',
            }}
          >
            <ShieldOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1E1B4B', lineHeight: 1.2 }}>
              Vault Protected
            </Typography>
            <Typography variant="caption" sx={{ color: '#4338CA', display: 'block' }}>
              Automated expiry scans active
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
