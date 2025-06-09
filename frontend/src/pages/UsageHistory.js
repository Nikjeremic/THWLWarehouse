import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function UsageHistory() {
  const { data: usageHistory, isLoading, error } = useQuery({
    queryKey: ['usageHistory'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3001/api/materials/usage-history');
      return response.data;
    },
  });

  const [selectedUsage, setSelectedUsage] = useState(null);

  if (isLoading) return <Typography>Učitavanje podataka...</Typography>;
  if (error) return <Typography color="error">Greška pri učitavanju podataka: {error.message}</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Istorija skidanja sa stanja
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datum skidanja</TableCell>
              <TableCell>Materijal</TableCell>
              <TableCell align="right">Količina (kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageHistory && usageHistory.length > 0 ? (
              usageHistory.map((usage) => (
                <TableRow key={usage._id || Math.random()} hover style={{ cursor: 'pointer' }} onClick={() => setSelectedUsage(usage)}>
                  <TableCell>{new Date(usage.usageDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{usage.material}</TableCell>
                  <TableCell align="right">{usage.quantity.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>Nema podataka o skidanju sa stanja</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dijalog za detalje skidanja sa stanja */}
      <Dialog open={!!selectedUsage} onClose={() => setSelectedUsage(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Detalji skidanja sa stanja</DialogTitle>
        <DialogContent dividers>
          {selectedUsage && (
            <Box>
              <Typography><b>Materijal:</b> {selectedUsage.material}</Typography>
              <Typography><b>Količina:</b> {selectedUsage.quantity} kg</Typography>
              <Typography><b>Datum skidanja:</b> {new Date(selectedUsage.usageDate).toLocaleDateString('sr-RS')}</Typography>
              {selectedUsage.napomena && <Typography><b>Napomena:</b> {selectedUsage.napomena}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUsage(null)}>Zatvori</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 