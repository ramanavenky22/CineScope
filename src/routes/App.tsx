import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { TopBar } from '@components/layout/TopBar';
import { PageShell } from '@components/layout/PageShell';
import { DashboardPage } from '@routes/DashboardPage';
import { AboutPage } from '@routes/AboutPage';

const App = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar />
      <PageShell>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </PageShell>
    </Box>
  );
};

export default App;

