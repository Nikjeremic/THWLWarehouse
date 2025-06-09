import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { sr } from 'date-fns/locale';
import { isWithinInterval, subDays, subMonths, subQuarters, subYears } from 'date-fns';
import { Download as DownloadIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
  { id: 'stock', name: 'Stanje zaliha' },
  { id: 'consumption', name: 'Potrošnja po spinneru' },
  { id: 'financial', name: 'Finansijski izveštaj' },
  { id: 'movements', name: 'Istorija kretanja' }
];

const periods = [
  { id: 'week', name: 'Nedeljni' },
  { id: 'month', name: 'Mesečni' },
  { id: 'quarter', name: 'Kvartalni' },
  { id: 'halfYear', name: 'Pola godine' },
  { id: 'year', name: 'Godišnji' },
  { id: 'custom', name: 'Prilagođeni period' }
];

const MaterialReports = (props) => {
  const [reportType, setReportType] = useState(reportTypes[0].id);
  const [period, setPeriod] = useState(periods[0].id);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedSpinner, setSelectedSpinner] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (newPeriod) {
      case 'week':
        start = subDays(today, 7);
        break;
      case 'month':
        start = subMonths(today, 1);
        break;
      case 'quarter':
        start = subQuarters(today, 1);
        break;
      case 'halfYear':
        start = subMonths(today, 6);
        break;
      case 'year':
        start = subYears(today, 1);
        break;
      default:
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  const fetchReport = async () => {
    if (!from || !to) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/materials/report?from=${from}&to=${to}`);
      setReport(response.data);
    } catch (error) {
      alert('Greška pri dohvatanju izveštaja: ' + (error.response?.data?.message || error.message));
    }
    setLoading(false);
  };

  const handleExport = () => {
    if (!report.length) return;
    const data = report.map(r => ({
      'Naziv materijala': r.material,
      'Početno stanje': r.pocetnoStanje,
      'Ulaz': r.ulaz,
      'Stanje': r.stanje,
      'Potrošnja': r.potrosnja,
      'Cena (EUR/kg/kom)': r.poslednjaCena,
      'Potrošnja u EUR': r.potrosnjaEUR,
      'Potrošnja za 2 spinera': r.potrosnja2sp,
      'Potrošnja za 1 spiner': r.potrosnja1sp
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Izveštaj');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileName = `izvestaj_${from}_${to}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);
  };

  const handleExportPDF = () => {
    if (!report.length) return;
    const doc = new jsPDF();
    if (props.user && props.user.logo) {
      doc.addImage(props.user.logo, 'PNG', 10, 8, 30, 18);
    }
    const now = new Date();
    doc.setFontSize(10);
    doc.text(`Izvezeno: ${now.toLocaleDateString('sr-RS')} ${now.toLocaleTimeString('sr-RS')}`, 150, 15, { align: 'right' });
    doc.setFontSize(16);
    doc.text('Izveštaj o sirovinama', 14, 35);
    autoTable(doc, {
      startY: 45,
      head: [[
        'Naziv materijala',
        'Početno stanje',
        'Ulaz',
        'Stanje',
        'Potrošnja',
        'Cena (EUR/kg/kom)',
        'Potrošnja u EUR',
        'Potrošnja za 2 spinera',
        'Potrošnja za 1 spiner'
      ]],
      body: report.map(r => [
        r.material,
        r.pocetnoStanje,
        r.ulaz,
        r.stanje,
        r.potrosnja,
        r.poslednjaCena,
        r.potrosnjaEUR,
        r.potrosnja2sp,
        r.potrosnja1sp
      ]),
    });
    doc.save(`izvestaj_${from}_${to}.pdf`);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Izveštaji o sirovinama
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Podešavanja izveštaja
                </Typography>
                <Stack spacing={3}>
                  <FormControl fullWidth>
                    <InputLabel>Tip izveštaja</InputLabel>
                    <Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      label="Tip izveštaja"
                    >
                      {reportTypes.map((type) => (
                        <MenuItem key={type.id} value={type.id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Period</InputLabel>
                    <Select
                      value={period}
                      onChange={(e) => handlePeriodChange(e.target.value)}
                      label="Period"
                    >
                      {periods.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {period === 'custom' && (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={sr}>
                      <Stack direction="row" spacing={2}>
                        <DatePicker
                          label="Početni datum"
                          value={startDate}
                          onChange={setStartDate}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                        <DatePicker
                          label="Krajnji datum"
                          value={endDate}
                          onChange={setEndDate}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      </Stack>
                    </LocalizationProvider>
                  )}

                  <FormControl fullWidth>
                    <InputLabel>Spinner</InputLabel>
                    <Select
                      value={selectedSpinner}
                      onChange={(e) => setSelectedSpinner(e.target.value)}
                      label="Spinner"
                    >
                      <MenuItem value="all">Svi spinneri</MenuItem>
                      <MenuItem value="spinner1">Spinner 1</MenuItem>
                      <MenuItem value="spinner2">Spinner 2</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Kategorija</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="Kategorija"
                    >
                      <MenuItem value="all">Sve kategorije</MenuItem>
                      <MenuItem value="hemikalije">Hemikalije</MenuItem>
                      <MenuItem value="staklo">Staklo</MenuItem>
                      <MenuItem value="ambalaza">Ambalaza</MenuItem>
                      <MenuItem value="pomocni">Pomoćni materijali</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    fullWidth
                  >
                    Izvezi izveštaj
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pregled izveštaja
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Izaberite parametre izveštaja i kliknite na "Izvezi izveštaj" da biste preuzeli
                  izveštaj u Excel formatu.
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Dostupni tipovi izveštaja:
                  </Typography>
                  <ul>
                    <li>
                      <strong>Stanje zaliha</strong> - trenutno stanje svih sirovina
                    </li>
                    <li>
                      <strong>Potrošnja po spinneru</strong> - detaljna analiza potrošnje po
                      spinnerima
                    </li>
                    <li>
                      <strong>Finansijski izveštaj</strong> - vrednost zaliha i troškovi
                    </li>
                    <li>
                      <strong>Istorija kretanja</strong> - detaljna istorija ulaza i izlaza
                    </li>
                  </ul>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ p: 2, mt: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <TextField
                label="Od datuma"
                type="date"
                value={from}
                onChange={e => setFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item>
              <TextField
                label="Do datuma"
                type="date"
                value={to}
                onChange={e => setTo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={fetchReport} disabled={loading || !from || !to}>
                Prikaži izveštaj
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="success" onClick={handleExport} disabled={!report.length}>
                Export u Excel
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={handleExportPDF} disabled={!report.length} sx={{ ml: 1 }}>
                Export u PDF
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Naziv materijala</TableCell>
                <TableCell align="right">Početno stanje</TableCell>
                <TableCell align="right">Ulaz</TableCell>
                <TableCell align="right">Stanje</TableCell>
                <TableCell align="right">Potrošnja</TableCell>
                <TableCell align="right">Cena (EUR/kg/kom)</TableCell>
                <TableCell align="right">Potrošnja u EUR</TableCell>
                <TableCell align="right">Potrošnja za 2 spinera</TableCell>
                <TableCell align="right">Potrošnja za 1 spiner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.material}</TableCell>
                  <TableCell align="right">{r.pocetnoStanje}</TableCell>
                  <TableCell align="right">{r.ulaz}</TableCell>
                  <TableCell align="right">{r.stanje}</TableCell>
                  <TableCell align="right">{r.potrosnja}</TableCell>
                  <TableCell align="right">{r.poslednjaCena}</TableCell>
                  <TableCell align="right">{r.potrosnjaEUR}</TableCell>
                  <TableCell align="right">{r.potrosnja2sp}</TableCell>
                  <TableCell align="right">{r.potrosnja1sp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default MaterialReports; 