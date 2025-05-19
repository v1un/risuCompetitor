import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, Divider, IconButton, useTheme, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import Sidebar from './Sidebar';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { useKeyboardShortcut } from '../../contexts/KeyboardShortcutContext';

const drawerWidth = 240;

const Layout: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleShortcutsHelpOpen = () => {
    setShortcutsHelpOpen(true);
  };

  const handleShortcutsHelpClose = () => {
    setShortcutsHelpOpen(false);
  };

  // Register F1 keyboard shortcut for help
  useKeyboardShortcut(
    'help-dialog',
    'F1',
    handleShortcutsHelpOpen,
    {
      description: 'Show keyboard shortcuts help',
      category: 'global',
      global: true,
    }
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Immersive RPG Storytelling Platform
          </Typography>
          <Tooltip title="Keyboard Shortcuts (F1)">
            <IconButton color="inherit" onClick={handleShortcutsHelpOpen}>
              <KeyboardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Help">
            <IconButton color="inherit">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          ...(open && {
            ...{
              width: drawerWidth,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }),
          ...(!open && {
            ...{
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
              width: `calc(${theme.spacing(7)} + 1px)`,
              [theme.breakpoints.up('sm')]: {
                width: `calc(${theme.spacing(8)} + 1px)`,
              },
            },
          }),
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>
        <Divider />
        <Sidebar open={open} />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px', // AppBar height
        }}
      >
        <Outlet />
      </Box>

      {/* Keyboard Shortcuts Help Dialog */}
      <KeyboardShortcutsHelp 
        open={shortcutsHelpOpen} 
        onClose={handleShortcutsHelpClose} 
      />
    </Box>
  );
};

export default Layout;