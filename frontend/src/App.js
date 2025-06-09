import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sr } from 'date-fns/locale';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HistoryIcon from '@mui/icons-material/History';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import UserProfile from './components/UserProfile';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminCompanySettings from './components/AdminCompanySettings';
import BusinessIcon from '@mui/icons-material/Business';
import AdminUserManagement from './components/AdminUserManagement';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import MaterialDetails from './pages/MaterialDetails';
import MaterialReports from './pages/MaterialReports';
import ImportHistory from './pages/ImportHistory';
import UsageHistory from './pages/UsageHistory';
import MaterialOrders from './pages/MaterialOrders';
import Login from './pages/Login';
import api from './api/apiConfig';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
  },
});

const themeMap = {
  blue: createTheme({
    palette: { primary: { main: '#1976d2' }, secondary: { main: '#dc004e' } },
  }),
  green: createTheme({
    palette: { primary: { main: '#388e3c' }, secondary: { main: '#fbc02d' } },
  }),
  purple: createTheme({
    palette: { primary: { main: '#7b1fa2' }, secondary: { main: '#ff7043' } },
  }),
  orange: createTheme({
    palette: { primary: { main: '#f57c00' }, secondary: { main: '#1976d2' } },
  }),
};

const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minuta u ms

function getStoredUser() {
  const data = localStorage.getItem('user');
  if (!data) return null;
  try {
    const { user, lastActive } = JSON.parse(data);
    if (!user || !lastActive) return null;
    if (Date.now() - lastActive > INACTIVITY_LIMIT) {
      localStorage.removeItem('user');
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem('user', JSON.stringify({ user, lastActive: Date.now() }));
}

function clearStoredUser() {
  localStorage.removeItem('user');
}

function App() {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Login handler
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setError('Pogrešan email ili lozinka.');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Provera tokena na mount (opciono: refresh usera sa backend-a)
  React.useEffect(() => {
    if (token && !user) {
      api.get('/users/me').then(res => setUser(res.data)).catch(() => handleLogout());
    }
  }, [token]);

  if (!user) {
    return <Login onLogin={handleLogin} loading={loading} error={error} />;
  }

  const muiTheme = themeMap[user.theme] || themeMap.blue;

  const roleRoutes = {
    admin: [
      { path: '/', element: <Materials /> },
      { path: '/material-orders', element: <MaterialOrders /> },
      { path: '/reports', element: <MaterialReports user={user} /> },
      { path: '/import-history', element: <ImportHistory /> },
      { path: '/usage-history', element: <UsageHistory /> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
      { path: '/company-settings', element: <AdminCompanySettings user={user} onUpdate={setUser} /> },
      { path: '/users', element: <AdminUserManagement /> },
      { path: '/finance', element: <div>Finansije</div> },
      { path: '/sales', element: <div>Prodaja</div> },
      { path: '/maintenance', element: <div>Održavanje</div> },
    ],
    magacioner: [
      { path: '/', element: <Materials /> },
      { path: '/import-history', element: <ImportHistory /> },
      { path: '/usage-history', element: <UsageHistory /> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
    ],
    logistika: [
      { path: '/', element: <Materials /> },
      { path: '/material-orders', element: <MaterialOrders /> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
    ],
    finansije: [
      { path: '/finance', element: <div>Finansije</div> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
    ],
    prodaja: [
      { path: '/sales', element: <div>Prodaja</div> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
    ],
    odrzavanje: [
      { path: '/maintenance', element: <div>Održavanje</div> },
      { path: '/profile', element: <UserProfile user={user} onUpdate={setUser} /> },
    ],
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sr}>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                {user.logo ? (
                  <>
                    <img src={user.logo} alt="Logo" style={{ height: 40, marginRight: 16 }} />
                    <Box sx={{ flexGrow: 1 }} />
                  </>
                ) : (
                  <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                    {user.company || 'Naziv kompanije'}
                  </Typography>
                )}
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                  Izloguj se
                </Button>
              </Toolbar>
            </AppBar>
            <Drawer
              variant="permanent"
              sx={{
                width: 240,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
              }}
            >
              <Toolbar />
              <Box sx={{ overflow: 'auto' }}>
                <List>
                  <ListItem button component={Link} to="/">
                    <ListItemIcon>
                      <InventoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Sirovine" />
                  </ListItem>
                  <ListItem button component={Link} to="/material-orders">
                    <ListItemIcon>
                      <ShoppingCartIcon />
                    </ListItemIcon>
                    <ListItemText primary="Poručivanje" />
                  </ListItem>
                  <ListItem button component={Link} to="/reports">
                    <ListItemIcon>
                      <AssessmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Izveštaji" />
                  </ListItem>
                  <ListItem button component={Link} to="/import-history">
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Istorija uvoza" />
                  </ListItem>
                  <ListItem button component={Link} to="/usage-history">
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="Istorija skidanja" />
                  </ListItem>
                  <ListItem button component={Link} to="/profile">
                    <ListItemIcon>
                      <AccountCircleIcon />
                    </ListItemIcon>
                    <ListItemText primary="Profil" />
                  </ListItem>
                  {user.role === 'admin' && (
                    <ListItem button component={Link} to="/company-settings">
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText primary="Kompanija" />
                    </ListItem>
                  )}
                  {user.role === 'admin' && (
                    <ListItem button component={Link} to="/users">
                      <ListItemIcon>
                        <GroupIcon />
                      </ListItemIcon>
                      <ListItemText primary="Korisnici" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Toolbar />
              <Routes>
                {roleRoutes[user.role].map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
              </Routes>
            </Box>
          </Box>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
