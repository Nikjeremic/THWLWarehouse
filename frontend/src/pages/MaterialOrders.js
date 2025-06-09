import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmDialog from '../components/ConfirmDialog';

const MaterialOrders = () => {
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderDate, setOrderDate] = useState(new Date());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    // Fetch materials and orders from backend
    fetchMaterials();
    fetchOrders();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/materials');
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/material-orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/material-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: selectedMaterial,
          quantity: parseFloat(quantity),
          price: parseFloat(price),
          orderDate: orderDate.toISOString(),
        }),
      });

      if (response.ok) {
        setOpenDialog(false);
        fetchOrders();
        // Reset form
        setSelectedMaterial('');
        setQuantity('');
        setPrice('');
        setOrderDate(new Date());
      }
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Istorija poručivanja materijala', 14, 15);
    
    // Add table
    autoTable(doc, {
      startY: 25,
      head: [['Materijal', 'Količina', 'Cena', 'Datum porudžbine']],
      body: orders.map(order => [
        order.materialName,
        order.quantity,
        `${order.price} RSD`,
        new Date(order.orderDate).toLocaleDateString('sr-RS')
      ]),
    });
    
    doc.save('istorija-porudzbina.pdf');
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setConfirmOpen(false);
    if (!deleteId) return;
    try {
      const response = await fetch(`http://localhost:3001/api/material-orders/${deleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchOrders();
      } else {
        alert('Greška pri brisanju porudžbine');
      }
    } catch (error) {
      alert('Greška pri brisanju porudžbine: ' + error.message);
    }
    setDeleteId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Poručivanje materijala</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Nova porudžbina
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Materijal</TableCell>
              <TableCell>Količina</TableCell>
              <TableCell>Cena</TableCell>
              <TableCell>Datum porudžbine</TableCell>
              <TableCell>Akcija</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => {
              const materialObj = materials.find(m => m._id === order.materialId);
              const naziv = materialObj ? materialObj.material : (order.materialName || 'Nepoznat materijal');
              return (
                <TableRow key={order._id}>
                  <TableCell>{naziv}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.price} RSD</TableCell>
                  <TableCell>{new Date(order.orderDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => handleDeleteClick(order._id)}>
                      Obriši
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="secondary" onClick={exportToPDF}>
          Izvezi u PDF
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Nova porudžbina</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Materijal"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                {materials.map((material) => (
                  <MenuItem key={material._id} value={material._id}>
                    {material.material}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Količina"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cena"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Datum porudžbine"
                value={orderDate}
                onChange={(newValue) => setOrderDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Otkaži</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Sačuvaj
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Potvrda brisanja"
        content="Da li ste sigurni da želite da obrišete ovu porudžbinu?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        confirmText="Obriši"
        cancelText="Otkaži"
      />
    </Box>
  );
};

export default MaterialOrders; 