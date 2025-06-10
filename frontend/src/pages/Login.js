import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Grid } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Login = ({ onLogin, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    companyEmail: '',
    vatNumber: '',
    role: 'admin',
    gender: 'male',
    theme: 'blue',
  });
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      if (!res.ok) {
        let msg = 'Greška pri registraciji.';
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {}
        setRegError(msg);
        setRegLoading(false);
        return;
      }
      setRegisterOpen(false);
      setRegLoading(false);
      // Automatski login
      onLogin(regForm.email, regForm.password);
    } catch (err) {
      setRegError('Greška pri registraciji.');
      setRegLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
      <Paper elevation={3} sx={{ p: 4, minWidth: 350, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Prijava na sistem
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email adresa"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            disabled={loading}
          />
          <TextField
            label="Lozinka"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Prijavljivanje...' : 'Prijavi se'}
          </Button>
        </form>
        <Button color="secondary" sx={{ mt: 2 }} onClick={() => setRegisterOpen(true)}>
          Registruj se kao admin
        </Button>
      </Paper>

      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registracija admina i kompanije</DialogTitle>
        <form onSubmit={handleRegister}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>Podaci o kompaniji</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Naziv kompanije"
                  name="company"
                  value={regForm.company}
                  onChange={e => setRegForm(f => ({ ...f, company: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Adresa"
                  name="address"
                  value={regForm.address}
                  onChange={e => setRegForm(f => ({ ...f, address: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Grad"
                  name="city"
                  value={regForm.city}
                  onChange={e => setRegForm(f => ({ ...f, city: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Država"
                  name="country"
                  value={regForm.country}
                  onChange={e => setRegForm(f => ({ ...f, country: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Telefon"
                  name="phone"
                  value={regForm.phone}
                  onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email kompanije"
                  name="companyEmail"
                  type="email"
                  value={regForm.companyEmail}
                  onChange={e => setRegForm(f => ({ ...f, companyEmail: e.target.value }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="PIB"
                  name="vatNumber"
                  value={regForm.vatNumber}
                  onChange={e => setRegForm(f => ({ ...f, vatNumber: e.target.value }))}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>Podaci o adminu</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Ime i prezime"
                  name="name"
                  value={regForm.name}
                  onChange={e => setRegForm(f => ({ ...f, name: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={regForm.email}
                  onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Lozinka"
                  name="password"
                  type="password"
                  value={regForm.password}
                  onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
            {regError && <Typography color="error" sx={{ mt: 2 }}>{regError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRegisterOpen(false)}>Otkaži</Button>
            <Button type="submit" variant="contained" color="primary" disabled={regLoading}>
              {regLoading ? 'Registrujem...' : 'Registruj se'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Login; 