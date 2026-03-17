import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

export const AboutPage = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
        About CineScope
      </Typography>
      <Typography variant="body1" color="text.secondary">
        CineScope is a movie analytics dashboard built as a production-style React single-page
        application for your hackathon project. It showcases a modern toolchain, a strong UI/UX
        focus, and an AI-driven insights panel.
      </Typography>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Tech stack highlights
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText primary="React 18 + TypeScript SPA with React Router" />
          </ListItem>
          <ListItem>
            <ListItemText primary="MUI for accessible, production-ready UI components" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Recharts for interactive data visualizations" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Theming system with dark/light mode and persistent user preference" />
          </ListItem>
          <ListItem>
            <ListItemText primary="Pluggable AI insights panel designed to connect to OpenAI or LangChain" />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

