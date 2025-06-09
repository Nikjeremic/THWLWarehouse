import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem
} from '@mui/material';

const MaterialDialog = ({
  open,
  onClose,
  onSave,
  material,
  setMaterial,
  isEdit = false
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setMaterial((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(material);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit ? 'Izmeni sirovinu' : 'Dodaj novu sirovinu'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Naziv sirovine"
                name="material"
                value={material.material || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Godišnja potrošnja (kg)"
                name="consPerYearKg"
                value={material.consPerYearKg || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Stanje (kg)"
                name="stock"
                value={material.stock || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Lead time (dana)"
                name="leadTimeDays"
                value={material.leadTimeDays || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Transport time (dana)"
                name="transportTimeDays"
                value={material.transportTimeDays || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Paritet (kurs)"
                name="parity"
                value={material.parity || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.0001 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Gustina (kg/m³)"
                name="densityKgPerM3"
                value={material.densityKgPerM3 || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Plaćanje"
                name="paymentTerms"
                value={material.paymentTerms || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Dobavljač"
                name="supplier"
                value={material.supplier || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Zemlja porekla"
                name="originCountry"
                value={material.originCountry || ''}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Otkaži</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? 'Sačuvaj promene' : 'Dodaj'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MaterialDialog; 