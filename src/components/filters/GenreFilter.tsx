import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent
} from '@mui/material';

type GenreFilterProps = {
  value: string[];
  options: string[];
  onChange: (genres: string[]) => void;
};

export const GenreFilter = ({ value, options, onChange }: GenreFilterProps) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const next = event.target.value;
    onChange(typeof next === 'string' ? next.split(',') : next);
  };

  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="genre-filter-label">Genres</InputLabel>
      <Select
        labelId="genre-filter-label"
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label="Genres" />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((v) => (
              <Chip key={v} size="small" label={v} />
            ))}
          </Box>
        )}
      >
        {options.map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

