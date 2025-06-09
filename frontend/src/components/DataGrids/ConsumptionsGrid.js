import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format, addDays } from 'date-fns';
import { sr } from 'date-fns/locale';

const ConsumptionsGrid = ({
  rows,
  onEdit,
  onDelete,
  loading,
  pageSize = 10,
  onPageSizeChange,
  onPageChange,
  rowCount,
  page
}) => {
  const columns = [
    {
      field: 'weekStartDate',
      headerName: 'Nedelja',
      width: 180,
      valueFormatter: (params) => {
        const d = new Date(params.value);
        return `${format(d, 'dd.MM.yyyy', { locale: sr })} – ${format(addDays(d, 6), 'dd.MM.yyyy', { locale: sr })}`;
      }
    },
    {
      field: 'initialStock',
      headerName: 'Početno (kg)',
      width: 120,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'incomingUnits',
      headerName: 'Ulaz (kg)',
      width: 120,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'consumptionUnits',
      headerName: 'Potrošnja (kg)',
      width: 140,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'consumptionCost',
      headerName: 'Trošak (€)',
      width: 120,
      valueFormatter: (params) => `${params.value.toFixed(2)} €`
    },
    {
      field: 'stateEndOfWeek',
      headerName: 'Stanje (kg)',
      width: 120,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'actions',
      headerName: 'Akcije',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <>
          <Tooltip title="Izmeni">
            <IconButton
              size="small"
              onClick={() => onEdit(params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Obriši">
            <IconButton
              size="small"
              onClick={() => onDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      loading={loading}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      onPageChange={onPageChange}
      rowCount={rowCount}
      page={page}
      rowsPerPageOptions={[5, 10, 25]}
      paginationMode="server"
      autoHeight
      disableSelectionOnClick
      sx={{
        '& .MuiDataGrid-cell:focus': {
          outline: 'none'
        }
      }}
    />
  );
};

export default ConsumptionsGrid; 