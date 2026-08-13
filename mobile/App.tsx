import React from 'react';
import { QueryProvider } from './src/app/providers/QueryProvider';
import RootNavigator from './src/app/navigation/RootNavigator';
import { ErrorBoundary } from './src/shared/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <RootNavigator />
      </QueryProvider>
    </ErrorBoundary>
  );
}
