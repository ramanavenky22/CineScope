import { Paper, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

type ChartCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  height?: number;
};

export const ChartCard = ({ title, subtitle, children, height = 260 }: ChartCardProps) => {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ height }}>{children}</Box>
    </Paper>
  );
};

