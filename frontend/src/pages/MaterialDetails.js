import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data za sirovinu - kasnije će doći iz API-ja
const mockMaterial = {
  id: 1,
  name: 'Sirovina 1',
  pricePerUnit: 10.5,
  stateCurrent: 120
};

// Mock data za transakcije - kasnije će doći iz API-ja
const mockTransactions = [
  {
    id: 1,
    weekStartDate: '2025-04-14',
    weekEndDate: '2025-04-20',
    incomingUnits: 50,
    consumptionUnits: 30,
    consumptionCost: 315,
    stockEndOfWeek: 120
  },
  // Dodajte više mock podataka po potrebi
];

function MaterialDetails() {
  const { id } = useParams();
  const [material] = useState(mockMaterial);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [dateRange, setDateRange] = useState({
    startDate: new Date('2025-04-14'),
    endDate: new Date('2025-04-28')
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    weekStartDate: new Date(),
    incomingUnits: 0,
    consumptionUnits: 0
  });

  const columns = [
    {
      field: 'weekStartDate',
      headerName: 'Nedelja',
      width: 200,
      valueGetter: (params) => `${params.row.weekStartDate} – ${params.row.weekEndDate}`
    },
    { field: 'incomingUnits', headerName: 'Ulaz', width: 120 },
    { field: 'consumptionUnits', headerName: 'Potrošnja', width: 120 },
    {
      field: 'consumptionCost',
      headerName: 'Potrošnja u €',
      width: 150,
      valueFormatter: (params) => `${params.value.toFixed(2)} €`
    },
    { field: 'stockEndOfWeek', headerName: 'Stanje na kraju', width: 150 },
    {
      field: 'actions',
      headerName: 'Akcije',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const handleDateRangeChange = (field) => (date) => {
    setDateRange(prev => ({
      ...prev,
      [field]: date
    }));
    // TODO: Fetch transactions for new date range
  };

  const handleAdd = () => {
    setSelectedTransaction(null);
    setFormData({
      weekStartDate: new Date(),
      incomingUnits: 0,
      consumptionUnits: 0
    });
    setOpenDialog(true);
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      weekStartDate: new Date(transaction.weekStartDate),
      incomingUnits: transaction.incomingUnits,
      consumptionUnits: transaction.consumptionUnits
    });
    setOpenDialog(true);
  };

  const handleDelete = (transaction) => {
    // TODO: Implement delete functionality
    console.log('Delete transaction:', transaction);
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Save transaction:', formData);
    setOpenDialog(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Priprema podataka za grafikon
  const chartData = transactions.map(t => ({
    name: t.weekStartDate,
    potrošnja: t.consumptionUnits,
    trošak: t.consumptionCost
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Detalji: {material.name}
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Cena: {material.pricePerUnit.toFixed(2)} €
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1">
                Trenutno stanje: {material.stateCurrent} kg
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Od"
                value={dateRange.startDate}
                onChange={handleDateRangeChange('startDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Do"
                value={dateRange.endDate}
                onChange={handleDateRangeChange('endDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="outlined" fullWidth>
              Primeni filter
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Analiza potrošnje po nedeljama
          </Typography>
          <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="potrošnja" name="Potrošnja (kg)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="trošak" name="Trošak (€)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Dodaj nedeljnu transakciju
        </Button>
      </Box>

      <DataGrid
        rows={transactions}
        columns={columns}
        autoHeight
        pageSize={10}
        rowsPerPageOptions={[5, 10, 25]}
        disableSelectionOnClick
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedTransaction ? 'Izmeni transakciju' : 'Dodaj transakciju'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Početak nedelje"
                  value={formData.weekStartDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, weekStartDate: date }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ulaz (kg)"
                name="incomingUnits"
                type="number"
                value={formData.incomingUnits}
                onChange={handleFormChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Potrošnja (kg)"
                name="consumptionUnits"
                type="number"
                value={formData.consumptionUnits}
                onChange={handleFormChange}
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Otkaži</Button>
          <Button onClick={handleSave} variant="contained">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MaterialDetails; 