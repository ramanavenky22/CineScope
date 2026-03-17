import { Container, Box } from '@mui/material';
import type { ReactNode } from 'react';

type PageShellProps = {
  children: ReactNode;
};

export const PageShell = ({ children }: PageShellProps) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        flex: 1,
        py: 3
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

