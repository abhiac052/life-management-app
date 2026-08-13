import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { colors, spacing } from '../../../shared/theme';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { data: profile } = useProfile();
  const { mutateAsync, isPending } = useUpdateProfile();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile?.name ?? '', phone: profile?.phone ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync(data);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <Input label="Phone" value={value} onChangeText={onChange} keyboardType="phone-pad" />
        )}
      />
      <Button title="Save Changes" loading={isPending} onPress={() => { void handleSubmit(onSubmit)(); }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
});
