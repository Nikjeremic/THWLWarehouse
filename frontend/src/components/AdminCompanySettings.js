import React, { useState } from 'react';
import { Paper, TextField, Button, Typography, Stack, Avatar } from '@mui/material';

const AdminCompanySettings = ({ user, onUpdate }) => {
  const [company, setCompany] = useState(user.company || '');
  const [logo, setLogo] = useState(user.logo || '');
  const [logoFile, setLogoFile] = useState(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target.result);
        setLogoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onUpdate({ ...user, company, logo });
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Podešavanja kompanije</Typography>
        <TextField
          label="Naziv kompanije"
          value={company}
          onChange={e => setCompany(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" component="label">
          {logo ? 'Promeni logotip' : 'Dodaj logotip'}
          <input type="file" accept="image/*" hidden onChange={handleLogoChange} />
        </Button>
        {logo && <img src={logo} alt="Logo" style={{ maxHeight: 64, maxWidth: 180, marginTop: 8, display: 'block', marginLeft: 'auto', marginRight: 'auto' }} />}
        <Button variant="contained" color="primary" onClick={handleSave}>
          Sačuvaj
        </Button>
      </Stack>
    </Paper>
  );
};

export default AdminCompanySettings; 