import { render, screen } from '@testing-library/react';
import { DashboardPage } from '@routes/DashboardPage';
import { AppThemeProvider } from '@context/ThemeContext';

describe('DashboardPage', () => {
  it('renders dashboard heading and AI panel', async () => {
    render(
      <AppThemeProvider>
        <DashboardPage />
      </AppThemeProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: /movie analytics dashboard/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /ai insights/i })).toBeInTheDocument();
  });
});

