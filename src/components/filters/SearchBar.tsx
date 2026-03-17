import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

type SearchBarProps = {
  value: string;
  onChange: (next: string) => void;
};

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  return (
    <TextField
      label="Search movies or actors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      size="small"
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        )
      }}
    />
  );
};

