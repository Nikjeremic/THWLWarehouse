import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, FormControl, InputLabel } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMaterials, updateMaterial, createMaterial, deleteMaterial } from '../api/materialsApi';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import ConfirmDialog from '../components/ConfirmDialog';

function calculateMaterialFields(m) {
  const yearlyKg = m.dailyConsumptionKg * 365;
  const yearlyT = yearlyKg / 1000;
  const monthlyKg = yearlyKg / 12;
  const monthlyT = yearlyT / 12;
  const dailyT = m.dailyConsumptionKg / 1000;
  const coverage2Sp = m.stock / m.dailyConsumptionKg;
  const coverage1Sp = m.stock / (m.dailyConsumptionKg / 2);
  return {
    ...m,
    yearlyKg: Number(yearlyKg.toFixed(2)),
    yearlyT: Number(yearlyT.toFixed(2)),
    monthlyKg: Number(monthlyKg.toFixed(2)),
    monthlyT: Number(monthlyT.toFixed(2)),
    dailyT: Number(dailyT.toFixed(4)),
    coverage2Sp: Number(coverage2Sp.toFixed(2)),
    coverage1Sp: Number(coverage1Sp.toFixed(2)),
  };
}

const initialForm = {
  material: '',
  dailyConsumptionKg: '',
  stock: '',
  unit: '',
};

export default function Materials() {
  const queryClient = useQueryClient();
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials,
  });

  const mutation = useMutation({
    mutationFn: ({ id, updates }) => updateMaterial(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['materials']);
      setOpen(false);
      setForm(initialForm);
    },
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importForm, setImportForm] = useState({
    materialId: '',
    quantity: '',
    importDate: new Date().toISOString().split('T')[0],
    cenaEUR: '',
    brojOtpremnice: '',
    dobavljac: '',
    napomena: '',
  });
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageForm, setUsageForm] = useState({
    materialId: '',
    quantity: '',
    usageDate: new Date().toISOString().split('T')[0],
    napomena: '',
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleEditCellChange = (params) => {
    if (params.field === 'stock') {
      const material = materials.find((m) => m._id === params.id);
      if (material) {
        mutation.mutate({ id: params.id, updates: { ...material, stock: Number(params.value) } });
      }
    }
  };

  const handleOpen = () => {
    setForm(initialForm);
    setEditId(null);
    setOpen(true);
  };

  const handleEdit = (row) => {
    setEditId(row.id);
    setEditForm({
      material: row.material,
      dailyConsumptionKg: row.dailyConsumptionKg,
      stock: row.stock,
      unit: row.unit || '',
      supplier: row.supplier || '',
      originCountry: row.originCountry || '',
      paymentTerms: row.paymentTerms || '',
    });
    setEditOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    deleteMutation.mutate(deleteId);
    setDeleteId(null);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      mutation.mutate({ id: editId, updates: {
        ...form,
        dailyConsumptionKg: Number(form.dailyConsumptionKg),
        stock: Number(form.stock),
      }});
      setOpen(false);
      setForm(initialForm);
      setEditId(null);
    } else {
      createMutation.mutate({
        ...form,
        dailyConsumptionKg: Number(form.dailyConsumptionKg),
        stock: Number(form.stock),
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      id: editId,
      updates: {
        ...editForm,
        dailyConsumptionKg: Number(editForm.dailyConsumptionKg),
        stock: Number(editForm.stock),
      },
    });
    setEditOpen(false);
    setEditId(null);
    setEditForm(null);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setEditId(null);
    setEditForm(null);
  };

  const handleImport = () => {
    setImportOpen(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/api/materials/${importForm.materialId}/import`, {
        quantity: importForm.quantity,
        importDate: importForm.importDate,
        cenaEUR: importForm.cenaEUR,
        brojOtpremnice: importForm.brojOtpremnice,
        dobavljac: importForm.dobavljac,
        napomena: importForm.napomena,
      });
      setImportOpen(false);
      setImportForm({
        materialId: '',
        quantity: '',
        importDate: new Date().toISOString().split('T')[0],
        cenaEUR: '',
        brojOtpremnice: '',
        dobavljac: '',
        napomena: '',
      });
      queryClient.invalidateQueries(['materials']);
    } catch (error) {
      alert('Greška pri uvozu materijala: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUsage = () => {
    setUsageForm({
      materialId: '',
      quantity: '',
      usageDate: new Date().toISOString().split('T')[0],
      napomena: '',
    });
    setUsageOpen(true);
  };

  const handleUsageSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3001/api/materials/${usageForm.materialId}/usage`, {
        quantity: usageForm.quantity,
        usageDate: usageForm.usageDate,
        napomena: usageForm.napomena,
      });
      setUsageOpen(false);
      setUsageForm({
        materialId: '',
        quantity: '',
        usageDate: new Date().toISOString().split('T')[0],
        napomena: '',
      });
      queryClient.invalidateQueries(['materials']);
    } catch (error) {
      alert('Greška pri skidanju sa stanja: ' + (error.response?.data?.message || error.message));
    }
  };

  const columns = [
    { 
      field: 'material', 
      headerName: 'Materijal', 
      width: 180, 
      minWidth: 150,
      headerAlign: 'left',
      align: 'left',
    },
    { 
      field: 'monthlyKg', 
      headerName: 'M kg',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toLocaleString()
    },
    { 
      field: 'monthlyT', 
      headerName: 'M t',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toFixed(1)
    },
    { 
      field: 'yearlyKg', 
      headerName: 'G kg',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toLocaleString()
    },
    { 
      field: 'yearlyT', 
      headerName: 'G t',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toFixed(1)
    },
    { 
      field: 'dailyConsumptionKg', 
      headerName: 'D kg',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toLocaleString()
    },
    { 
      field: 'dailyT', 
      headerName: 'D t',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toFixed(2)
    },
    { 
      field: 'stock', 
      headerName: 'Stanje', 
      width: 80, 
      editable: true,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'coverage2Sp',
      headerName: '2sp d',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toFixed(1)
    },
    {
      field: 'coverage1Sp',
      headerName: '1sp d',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      valueFormatter: (params) => params.value.toFixed(1)
    },
    {
      field: 'actions',
      headerName: 'Akcije',
      width: 70,
      sortable: false,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', width: '100%' }}>
          <IconButton 
            size="small" 
            color="primary" 
            onClick={() => handleEdit(params.row)}
            sx={{ padding: 0.5 }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            color="error" 
            onClick={() => handleDeleteClick(params.row.id)}
            sx={{ padding: 0.5 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Materijali
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleImport}
            sx={{ mr: 2 }}
          >
            Uvoz materijala
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUsage}
            sx={{ mr: 2 }}
          >
            Skini sa stanja
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
          >
            Dodaj materijal
          </Button>
        </Box>
      </Box>
      <DataGrid
        rows={materials.map((m) => ({ id: m._id, ...calculateMaterialFields(m) }))}
        columns={columns}
        pageSize={15}
        rowsPerPageOptions={[5, 10, 15, 25]}
        disableSelectionOnClick
        onCellEditCommit={handleEditCellChange}
        loading={isLoading || mutation.isLoading || deleteMutation.isLoading}
        sx={{ 
          background: '#fff', 
          borderRadius: 2,
          fontSize: '0.72rem',
          '& .MuiDataGrid-cell': {
            padding: '0 6px',
            fontSize: '0.72rem',
            textAlign: 'center',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontSize: '0.74rem',
            textAlign: 'center',
          },
          '& .MuiDataGrid-cell[data-field="material"]': {
            textAlign: 'left',
          },
          '& .MuiDataGrid-columnHeader[data-field="material"]': {
            textAlign: 'left',
          },
          '& .MuiButtonBase-root': {
            fontSize: '0.72rem',
          }
        }}
      />
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editId ? 'Izmeni sirovinu' : 'Dodaj novu sirovinu'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Naziv sirovine"
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Dnevna potrošnja (kg)"
                  name="dailyConsumptionKg"
                  value={form.dailyConsumptionKg}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Stanje"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jedinica (opciono)"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Otkaži</Button>
            <Button type="submit" variant="contained" color="primary" disabled={createMutation.isLoading || mutation.isLoading}>
              Sačuvaj
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Izmeni sirovinu</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Naziv sirovine"
                  name="material"
                  value={editForm?.material || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Dnevna potrošnja (kg)"
                  name="dailyConsumptionKg"
                  value={editForm?.dailyConsumptionKg || ''}
                  onChange={handleEditChange}
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
                  value={editForm?.stock || ''}
                  onChange={handleEditChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Jedinica (opciono)"
                  name="unit"
                  value={editForm?.unit || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dobavljač"
                  name="supplier"
                  value={editForm?.supplier || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Zemlja porekla"
                  name="originCountry"
                  value={editForm?.originCountry || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Plaćanje"
                  name="paymentTerms"
                  value={editForm?.paymentTerms || ''}
                  onChange={handleEditChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mesečna potrošnja (kg)"
                  value={editForm?.dailyConsumptionKg ? (Number(editForm.dailyConsumptionKg) * 365 / 12).toLocaleString(undefined, { maximumFractionDigits: 2 }) : ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Godišnja potrošnja (kg)"
                  value={editForm?.dailyConsumptionKg ? (Number(editForm.dailyConsumptionKg) * 365).toLocaleString(undefined, { maximumFractionDigits: 2 }) : ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pokrivenost dva spinera (dani)"
                  value={editForm?.stock && editForm?.dailyConsumptionKg ? (Number(editForm.stock) / Number(editForm.dailyConsumptionKg)).toFixed(2) : ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pokrivenost jedan spiner (dani)"
                  value={editForm?.stock && editForm?.dailyConsumptionKg ? (Number(editForm.stock) / (Number(editForm.dailyConsumptionKg) / 2)).toFixed(2) : ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Otkaži</Button>
            <Button type="submit" variant="contained" color="primary" disabled={mutation.isLoading}>
              Sačuvaj
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Uvoz materijala</DialogTitle>
        <form onSubmit={handleImportSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Materijal</InputLabel>
                  <Select
                    value={importForm.materialId}
                    onChange={(e) => setImportForm({ ...importForm, materialId: e.target.value })}
                    required
                  >
                    {materials.map((material) => (
                      <MenuItem key={material._id} value={material._id}>
                        {material.material}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Količina za uvoz"
                  type="number"
                  value={importForm.quantity}
                  onChange={(e) => setImportForm({ ...importForm, quantity: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Datum uvoza"
                  type="date"
                  value={importForm.importDate}
                  onChange={(e) => setImportForm({ ...importForm, importDate: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cena (EUR po kg/kom)"
                  type="number"
                  value={importForm.cenaEUR}
                  onChange={(e) => setImportForm({ ...importForm, cenaEUR: e.target.value })}
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Broj otpremnice"
                  value={importForm.brojOtpremnice}
                  onChange={(e) => setImportForm({ ...importForm, brojOtpremnice: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dobavljač"
                  value={importForm.dobavljac}
                  onChange={(e) => setImportForm({ ...importForm, dobavljac: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Napomena"
                  value={importForm.napomena}
                  onChange={(e) => setImportForm({ ...importForm, napomena: e.target.value })}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImportOpen(false)}>Otkaži</Button>
            <Button type="submit" variant="contained" color="primary">
              Sačuvaj
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={usageOpen} onClose={() => setUsageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Skini sa stanja</DialogTitle>
        <form onSubmit={handleUsageSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Materijal</InputLabel>
                  <Select
                    value={usageForm.materialId}
                    onChange={(e) => setUsageForm({ ...usageForm, materialId: e.target.value })}
                    required
                  >
                    {materials.map((material) => (
                      <MenuItem key={material._id} value={material._id}>
                        {material.material}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Količina za skidanje"
                  type="number"
                  value={usageForm.quantity}
                  onChange={(e) => setUsageForm({ ...usageForm, quantity: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Datum skidanja"
                  type="date"
                  value={usageForm.usageDate}
                  onChange={(e) => setUsageForm({ ...usageForm, usageDate: e.target.value })}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Napomena"
                  value={usageForm.napomena}
                  onChange={(e) => setUsageForm({ ...usageForm, napomena: e.target.value })}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUsageOpen(false)}>Otkaži</Button>
            <Button type="submit" variant="contained" color="primary">
              Sačuvaj
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <ConfirmDialog
        open={confirmOpen}
        title="Potvrda brisanja"
        content="Da li ste sigurni da želite da obrišete ovaj materijal?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Obriši"
        cancelText="Otkaži"
      />
      <Typography variant="body2" color="text.secondary">
        * Stanje je moguće menjati direktno u tabeli. Sve vrednosti se automatski preračunavaju i čuvaju na serveru.
      </Typography>
    </Box>
  );
} 