import React from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDeleteAccount } from '../hooks/useProfile';
import { useLogout } from '../../auth/hooks/useAuth';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing, typography } from '../../../shared/theme';

const schema = z.object({
  password: z.string().min(1, 'Required'),
  confirmation: z.string().refine(v => v === 'DELETE', { message: 'Type DELETE to confirm' }),
});
type FormData = { password: string; confirmation: string };

export function DeleteAccountScreen() {
  const { mutateAsync, isPending } = useDeleteAccount();
  const { logout } = useLogout();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    Alert.alert('Delete Account', 'This cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await mutateAsync({ password: data.password, confirmation: data.confirmation });
            await logout();
          } catch {
            Alert.alert('Error', 'Failed to delete account. Check your password.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.warning}>
        This will permanently delete your account and all data. This action cannot be undone.
      </Text>
      <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
        <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
      )} />
      <Controller control={control} name="confirmation" render={({ field: { onChange, value } }) => (
        <Input label='Type "DELETE" to confirm' value={value} onChangeText={onChange} error={errors.confirmation?.message} />
      )} />
      <Button title="Delete My Account" variant="danger" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  warning: { ...typography.body, color: colors.error, marginBottom: spacing.lg, lineHeight: 22 },
});
