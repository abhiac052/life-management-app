import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useChangePassword } from '../hooks/useProfile';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing } from '../../../shared/theme';

const schema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password too weak'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

export function ChangePasswordScreen() {
  const navigation = useNavigation();
  const { mutateAsync, isPending } = useChangePassword();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      Alert.alert('Success', 'Password changed. Please log in again.');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Current password is incorrect');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller control={control} name="currentPassword" render={({ field: { onChange, value } }) => (
        <Input label="Current Password" value={value} onChangeText={onChange} secureTextEntry error={errors.currentPassword?.message} />
      )} />
      <Controller control={control} name="newPassword" render={({ field: { onChange, value } }) => (
        <Input label="New Password" value={value} onChangeText={onChange} secureTextEntry error={errors.newPassword?.message} />
      )} />
      <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
        <Input label="Confirm New Password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
      )} />
      <Button title="Change Password" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
});
