import React, { useState, useEffect } from 'react';
import { Paper, TextField, Button, Typography, Stack, MenuItem, Select, InputLabel, FormControl, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmDialog from './ConfirmDialog';
import api from '../api/apiConfig';

const roles = [
  { value: 'admin', label: 'Admin' },
  { value: 'magacioner', label: 'Magacioner' },
  { value: 'logistika', label: 'Logistika/Nabavka' },
];
const themeOptions = [
  { value: 'blue', label: 'Plava tema' },
  { value: 'green', label: 'Zelena tema' },
  { value: 'purple', label: 'Ljubičasta tema' },
  { value: 'orange', label: 'Narandžasta tema' },
];

const initialForm = {
  name: '',
  email: '',
  gender: 'male',
  company: '',
  role: 'logistika',
  theme: 'blue',
  password: '',
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => setError('Greška pri učitavanju korisnika.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDialogOpen = (idx = null) => {
    if (idx !== null) {
      setForm(users[idx]);
      setEditingIndex(idx);
    } else {
      setForm(initialForm);
      setEditingIndex(null);
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setForm(initialForm);
    setEditingIndex(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      if (editingIndex !== null) {
        await api.put(`/users/${users[editingIndex]._id}`, form);
      } else {
        await api.post('/users', form);
      }
      const res = await api.get('/users');
      setUsers(res.data);
      handleDialogClose();
    } catch {
      setError('Greška pri čuvanju korisnika.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (idx) => {
    setDeleteIndex(idx);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await api.delete(`/users/${users[deleteIndex]._id}`);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch {
      setError('Greška pri brisanju korisnika.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setDeleteIndex(null);
    }
  };

  return (
    <Paper sx={{ p: 4, width: '100%', mx: 'auto', mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Korisnici</Typography>
      {loading && <Typography color="primary">Učitavanje...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      <Button variant="contained" color="primary" onClick={() => handleDialogOpen()} startIcon={<AddIcon />} sx={{ mb: 2 }}>
        Dodaj korisnika
      </Button>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ime i prezime</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Pol</TableCell>
            <TableCell>Kompanija</TableCell>
            <TableCell>Rola</TableCell>
            <TableCell>Tema</TableCell>
            <TableCell>Akcija</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u, idx) => (
            <TableRow key={u.email}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.gender === 'female' ? 'Ženski' : 'Muški'}</TableCell>
              <TableCell>{u.company}</TableCell>
              <TableCell>{roles.find(r => r.value === u.role)?.label}</TableCell>
              <TableCell>{themeOptions.find(t => t.value === u.theme)?.label}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDialogOpen(idx)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDeleteClick(idx)}><DeleteIcon /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingIndex !== null ? 'Izmeni korisnika' : 'Dodaj korisnika'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Ime i prezime" name="name" value={form.name} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Pol</InputLabel>
              <Select name="gender" value={form.gender} label="Pol" onChange={handleChange}>
                <MenuItem value="male">Muški</MenuItem>
                <MenuItem value="female">Ženski</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Kompanija" name="company" value={form.company} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>Rola</InputLabel>
              <Select name="role" value={form.role} label="Rola" onChange={handleChange}>
                {roles.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Tema</InputLabel>
              <Select name="theme" value={form.theme} label="Tema" onChange={handleChange}>
                {themeOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Lozinka" name="password" type="password" value={form.password} onChange={handleChange} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained" color="primary">Sačuvaj</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title="Potvrda brisanja"
        content="Da li ste sigurni da želite da obrišete ovog korisnika?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Obriši"
        cancelText="Otkaži"
      />
    </Paper>
  );
};

export default AdminUserManagement; 