import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const KPIStatsCard = ({ title, value, icon, color = 'primary.main' }) => {
  return (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        '&:hover': {
          boxShadow: 6,
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease-in-out'
        }
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2
          }}
        >
          <Typography
            variant="h6"
            component="div"
            sx={{ color: 'text.secondary' }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { sx: { color } })}
          </Box>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            fontWeight: 'bold',
            color: 'text.primary'
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default KPIStatsCard; 