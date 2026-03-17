import { Box, Slider, Typography } from '@mui/material';

type YearRangeSliderProps = {
  value: [number, number];
  min: number;
  max: number;
  onChange: (range: [number, number]) => void;
};

export const YearRangeSlider = ({ value, min, max, onChange }: YearRangeSliderProps) => {
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        Year range: {value[0]}–{value[1]}
      </Typography>
      <Slider
        value={value}
        min={min}
        max={max}
        onChange={(_, next) => onChange(next as [number, number])}
        valueLabelDisplay="auto"
        disableSwap
        size="small"
        getAriaLabel={() => 'Year range'}
      />
    </Box>
  );
};

