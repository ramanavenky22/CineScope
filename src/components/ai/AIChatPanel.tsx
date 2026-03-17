import { Box, Button, Divider, Paper, TextField, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SendIcon from '@mui/icons-material/Send';
import { useMemo, useState } from 'react';
import type { Movie } from '../../types/movie';
import type { DashboardFilters } from '@context/DashboardContext';
import { useAIChat } from '@hooks/useAIChat';

type AIChatPanelProps = {
  filters: DashboardFilters;
  selectedMovie: Movie | null;
  visibleMoviesCount: number;
};

export const AIChatPanel = ({ filters, selectedMovie, visibleMoviesCount }: AIChatPanelProps) => {
  const { messages, pending, send, clear } = useAIChat({ filters, selectedMovie, visibleMoviesCount });
  const [draft, setDraft] = useState('');

  const contextLine = useMemo(() => {
    const selected = selectedMovie ? `${selectedMovie.title} (${selectedMovie.year})` : 'none selected';
    const genres = filters.genres.length ? filters.genres.join(', ') : 'all genres';
    return `Context: ${visibleMoviesCount} visible • ${filters.yearRange[0]}–${filters.yearRange[1]} • ${genres} • selected: ${selected}`;
  }, [filters.genres, filters.yearRange, selectedMovie, visibleMoviesCount]);

  return (
    <Paper variant="outlined" sx={{ display: 'flex', flexDirection: 'column', height: 520, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          AI Insights
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {contextLine}
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {messages.map((m) => (
          <Box
            key={m.id}
            sx={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%'
            }}
          >
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: m.role === 'user' ? 'primary.main' : 'background.paper',
                color: m.role === 'user' ? 'primary.contrastText' : 'text.primary',
                border: m.role === 'user' ? 'none' : '1px solid',
                borderColor: m.role === 'user' ? 'transparent' : 'divider',
                whiteSpace: 'pre-wrap'
              }}
            >
              <Typography variant="body2">{m.content}</Typography>
            </Paper>
          </Box>
        ))}
        {pending ? (
          <Typography variant="caption" color="text.secondary">
            Thinking…
          </Typography>
        ) : null}
      </Box>
      <Divider />
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
          setDraft('');
        }}
        sx={{ p: 2, display: 'flex', gap: 1 }}
      >
        <TextField
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask something…"
          size="small"
          fullWidth
          disabled={pending}
          inputProps={{ 'aria-label': 'AI chat input' }}
        />
        <Button type="submit" variant="contained" disabled={pending || !draft.trim()} endIcon={<SendIcon />}>
          Send
        </Button>
        <Button variant="text" color="inherit" onClick={clear} disabled={pending} startIcon={<DeleteOutlineIcon />}>
          Clear
        </Button>
      </Box>
    </Paper>
  );
};

