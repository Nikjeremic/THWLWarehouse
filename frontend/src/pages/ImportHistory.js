import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function ImportHistory() {
  const queryClient = useQueryClient();
  const { data: importHistory, isLoading, error } = useQuery({
    queryKey: ['importHistory'],
    queryFn: async () => {
      try {
        console.log('Pokušavam da se povežem sa backend-om...');
        const response = await axios.get('http://localhost:3001/api/materials/import-history');
        console.log('Odgovor od servera:', response.data);
        return response.data;
      } catch (error) {
        console.error('Greška pri povezivanju:', error);
        throw error;
      }
    },
    retry: 1, // Pokušaj samo jednom
    refetchOnWindowFocus: false, // Ne osvežavaj pri fokusu prozora
  });

  const [selectedImport, setSelectedImport] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedImport) return;
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:3001/api/materials/${selectedImport.materialId}/import/${selectedImport._id}`);
      setSelectedImport(null);
      queryClient.invalidateQueries(['importHistory']);
    } catch (error) {
      alert('Greška pri brisanju uvoza: ' + (error.response?.data?.message || error.message));
    }
    setDeleting(false);
  };

  if (isLoading) {
    console.log('Učitavanje podataka...');
    return <Typography>Učitavanje podataka...</Typography>;
  }
  
  if (error) {
    console.error('Greška:', error);
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>
          Greška pri učitavanju podataka:
        </Typography>
        <Typography color="error">
          {error.message}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Proverite da li je backend server pokrenut na portu 3001
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Istorija uvoza materijala
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Datum uvoza</TableCell>
              <TableCell>Materijal</TableCell>
              <TableCell align="right">Količina (kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {importHistory && importHistory.length > 0 ? (
              importHistory.map((import_) => (
                <TableRow key={import_._id || Math.random()} hover style={{ cursor: 'pointer' }} onClick={() => setSelectedImport(import_)}>
                  <TableCell>{new Date(import_.importDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{import_.material}</TableCell>
                  <TableCell align="right">{import_.quantity.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography>Nema podataka o uvozu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dijalog za detalje uvoza */}
      <Dialog open={!!selectedImport} onClose={() => setSelectedImport(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Detalji uvoza</DialogTitle>
        <DialogContent dividers>
          {selectedImport && (
            <Box>
              <Typography><b>Materijal:</b> {selectedImport.material}</Typography>
              <Typography><b>Količina:</b> {selectedImport.quantity} kg</Typography>
              <Typography><b>Datum uvoza:</b> {new Date(selectedImport.importDate).toLocaleDateString('sr-RS')}</Typography>
              {selectedImport.cenaEUR !== undefined && <Typography><b>Cena (EUR po kg/kom):</b> {selectedImport.cenaEUR}</Typography>}
              {selectedImport.brojOtpremnice && <Typography><b>Broj otpremnice:</b> {selectedImport.brojOtpremnice}</Typography>}
              {selectedImport.dobavljac && <Typography><b>Dobavljač:</b> {selectedImport.dobavljac}</Typography>}
              {selectedImport.napomena && <Typography><b>Napomena:</b> {selectedImport.napomena}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedImport(null)}>Zatvori</Button>
          <Button color="error" onClick={handleDelete} disabled={deleting}>
            Obriši unos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 