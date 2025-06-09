import React from 'react';
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
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';
import { Card, CardContent, Typography, Box } from '@mui/material';

const ConsumptionChart = ({ data, title }) => {
  const formatDate = (date) => {
    return format(new Date(date), 'dd.MM.yyyy', { locale: sr });
  };

  const formatValue = (value) => {
    return value.toLocaleString('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 1 }}>
          <Typography variant="subtitle2">
            {formatDate(label)}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${formatValue(entry.value)}`}
            </Typography>
          ))}
        </Card>
      );
    }
    return null;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="weekStartDate"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tickFormatter={formatValue}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatValue}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="consumptionUnits"
                name="Potrošnja (kg)"
                fill="#8884d8"
              />
              <Bar
                yAxisId="right"
                dataKey="consumptionCost"
                name="Trošak (€)"
                fill="#82ca9d"
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ConsumptionChart; 