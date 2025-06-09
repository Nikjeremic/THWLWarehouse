import React from 'react';
import { Grid, Typography, Box } from '@mui/material';
import {
  Inventory as InventoryIcon,
  Euro as EuroIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';

import KPIStatsCard from '../components/Cards/KPIStatsCard';
import ConsumptionChart from '../components/Charts/ConsumptionChart';
import { getMaterials, getMaterialReport } from '../api/materialsApi';

const Dashboard = () => {
  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: getMaterials
  });

  const { data: report } = useQuery({
    queryKey: ['materialReport', { from: subDays(new Date(), 30), to: new Date() }],
    queryFn: () => getMaterialReport({ from: subDays(new Date(), 30), to: new Date() })
  });

  const calculateStats = () => {
    if (!materials) return { totalMaterials: 0, totalValue: 0, totalConsumption: 0 };

    const totalMaterials = materials.length;
    const totalValue = materials.reduce((sum, m) => sum + (m.stock * m.parity), 0);
    const totalConsumption = materials.reduce((sum, m) => sum + m.consPerYearKg, 0);

    return {
      totalMaterials,
      totalValue,
      totalConsumption
    };
  };

  const stats = calculateStats();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <KPIStatsCard
            title="Ukupan broj sirovina"
            value={stats.totalMaterials}
            icon={<InventoryIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPIStatsCard
            title="Ukupna vrednost stanja"
            value={`${stats.totalValue.toFixed(2)} €`}
            icon={<EuroIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <KPIStatsCard
            title="Ukupna godišnja potrošnja"
            value={`${(stats.totalConsumption / 1000).toFixed(2)} t`}
            icon={<AssessmentIcon />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ConsumptionChart
            data={report?.consumptions || []}
            title="Potrošnja po nedeljama (poslednjih 30 dana)"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 