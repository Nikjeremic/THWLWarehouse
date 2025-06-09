import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const MaterialsGrid = ({
  rows,
  onEdit,
  onDelete,
  loading,
  pageSize = 10,
  onPageSizeChange,
  onPageChange,
  rowCount,
  page,
  onRowClick
}) => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 60 },
    { field: 'material', headerName: 'Sirovina', width: 250 },
    {
      field: 'consPerYearKg',
      headerName: 'God. potrošnja (kg)',
      width: 140,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'consPerYearT',
      headerName: 'God. potrošnja (t)',
      width: 120,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      field: 'consPerMonthKg',
      headerName: 'Mes. potrošnja (kg)',
      width: 140,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'consPerMonthT',
      headerName: 'Mes. potrošnja (t)',
      width: 120,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      field: 'consPerDayKg',
      headerName: 'Dnev. potrošnja (kg)',
      width: 140,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'consPerDayT',
      headerName: 'Dnev. potrošnja (t)',
      width: 120,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      field: 'stock',
      headerName: 'Stanje (kg)',
      width: 120,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'coverage2Sp',
      headerName: 'Pokr. 2 sp. (d)',
      width: 120,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      field: 'coverage1Sp',
      headerName: 'Pokr. 1 sp. (d)',
      width: 120,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      field: 'leadTimeDays',
      headerName: 'Lead time (d)',
      width: 100
    },
    {
      field: 'transportTimeDays',
      headerName: 'Transport (d)',
      width: 100
    },
    {
      field: 'parity',
      headerName: 'Paritet',
      width: 100,
      valueFormatter: (params) => params.value.toFixed(4)
    },
    {
      field: 'densityKgPerM3',
      headerName: 'Gustina (kg/m³)',
      width: 120,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'paymentTerms',
      headerName: 'Plaćanje',
      width: 150
    },
    {
      field: 'supplier',
      headerName: 'Dobavljač',
      width: 180
    },
    {
      field: 'originCountry',
      headerName: 'Zemlja porekla',
      width: 140
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit(params.row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Obriši">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(params.row);
              }}
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
      onRowClick={onRowClick}
      sx={{
        '& .MuiDataGrid-cell:focus': {
          outline: 'none'
        }
      }}
    />
  );
};

export default MaterialsGrid; 