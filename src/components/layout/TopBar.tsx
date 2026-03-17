import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@components/layout/ThemeToggle';

export const TopBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 4 }}>
          <MovieIcon />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            CineScope
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/dashboard"
            color={isActive('/dashboard') ? 'secondary' : 'inherit'}
            variant={isActive('/dashboard') ? 'contained' : 'text'}
          >
            Dashboard
          </Button>
          <Button
            component={RouterLink}
            to="/about"
            color={isActive('/about') ? 'secondary' : 'inherit'}
            variant={isActive('/about') ? 'contained' : 'text'}
          >
            About
          </Button>
        </Box>
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
};

