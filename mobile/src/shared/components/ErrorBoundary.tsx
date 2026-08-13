import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography, radius } from '../theme';

interface Props { children: React.ReactNode; fallback?: React.ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message} numberOfLines={3}>
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={this.reset}>
            <Text style={styles.btnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  icon: { fontSize: 48, marginBottom: spacing.md },
  title: { ...typography.h3, color: colors.text, marginBottom: spacing.sm },
  message: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.lg },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  btnText: { ...typography.button, color: '#fff' },
});
