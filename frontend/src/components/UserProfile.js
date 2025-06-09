import React, { useState } from 'react';
import { Box, Avatar, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Paper, Stack } from '@mui/material';
import MaleIcon from '@mui/icons-material/Man';
import FemaleIcon from '@mui/icons-material/Woman';

const themeOptions = [
  { value: 'blue', label: 'Plava tema' },
  { value: 'green', label: 'Zelena tema' },
  { value: 'purple', label: 'Ljubičasta tema' },
  { value: 'orange', label: 'Narandžasta tema' },
];

const UserProfile = ({ user, onUpdate }) => {
  const [form, setForm] = useState({ ...user });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate(form);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Stack alignItems="center" spacing={2}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
          {form.gender === 'female' ? <FemaleIcon /> : <MaleIcon />}
        </Avatar>
        <Typography variant="h6">Profil korisnika</Typography>
        <TextField
          label="Ime i prezime"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Email adresa"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Pol</InputLabel>
          <Select name="gender" value={form.gender} label="Pol" onChange={handleChange}>
            <MenuItem value="male">Muški</MenuItem>
            <MenuItem value="female">Ženski</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Kompanija"
          name="company"
          value={form.company}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tema</InputLabel>
          <Select name="theme" value={form.theme || ''} label="Tema" onChange={handleChange}>
            {themeOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
          Sačuvaj izmene
        </Button>
      </Stack>
    </Paper>
  );
};

export default UserProfile; 