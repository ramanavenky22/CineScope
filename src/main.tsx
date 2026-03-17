import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from '@routes/App';
import { AppThemeProvider } from '@context/ThemeContext';
import { initSentry } from './sentry';
import * as Sentry from '@sentry/react';

initSentry();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppThemeProvider>
        <Sentry.ErrorBoundary
          fallback={<div role="alert">Something went wrong. Please refresh and try again.</div>}
        >
          <App />
        </Sentry.ErrorBoundary>
      </AppThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

