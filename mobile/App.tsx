import React from 'react';
import { QueryProvider } from './src/app/providers/QueryProvider';
import RootNavigator from './src/app/navigation/RootNavigator';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';
import { ThemeProvider } from './src/shared/theme/ThemeContext';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryProvider>
          <RootNavigator />
        </QueryProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
