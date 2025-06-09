import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sr } from 'date-fns/locale';

const ConsumptionDialog = ({
  open,
  onClose,
  onSave,
  consumption,
  setConsumption,
  isEdit = false
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConsumption((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setConsumption((prev) => ({
      ...prev,
      weekStartDate: date
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(consumption);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {isEdit ? 'Izmeni potrošnju' : 'Dodaj novu potrošnju'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sr}>
                <DatePicker
                  label="Početak nedelje"
                  value={consumption.weekStartDate || null}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Početno stanje (kg)"
                name="initialStock"
                value={consumption.initialStock || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Ulaz (kg)"
                name="incomingUnits"
                value={consumption.incomingUnits || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Potrošnja (kg)"
                name="consumptionUnits"
                value={consumption.consumptionUnits || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="number"
                label="Cena (€ po kg)"
                name="pricePerUnit"
                value={consumption.pricePerUnit || ''}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
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

export default ConsumptionDialog; 