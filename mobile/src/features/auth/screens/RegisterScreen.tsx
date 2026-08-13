import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../app/navigation/types';
import { useRegister } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const { register, loading, error } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await register(data.name, data.email, data.password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create account</Text>

          {error && <Text style={styles.errorBanner}>{error}</Text>}

          {(['name', 'email', 'password', 'confirmPassword'] as const).map((field) => (
            <Controller
              key={field}
              control={control}
              name={field}
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <TextInput
                    style={[styles.input, errors[field] && styles.inputError]}
                    placeholder={
                      field === 'name' ? 'Full name' :
                      field === 'email' ? 'Email' :
                      field === 'password' ? 'Password' : 'Confirm password'
                    }
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    autoCapitalize={field === 'name' ? 'words' : 'none'}
                    secureTextEntry={field === 'password' || field === 'confirmPassword'}
                    autoComplete={
                      field === 'email' ? 'email' :
                      field === 'password' || field === 'confirmPassword' ? 'new-password' : 'name'
                    }
                    value={value}
                    onChangeText={onChange}
                  />
                  {errors[field] && <Text style={styles.fieldError}>{errors[field]?.message}</Text>}
                </View>
              )}
            />
          ))}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={() => { void handleSubmit(onSubmit)(); }}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.primaryButtonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.switchLink}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Log in</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 24 },
  errorBanner: { backgroundColor: '#FEE2E2', color: '#B91C1C', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 },
  fieldGroup: { marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111' },
  inputError: { borderColor: '#EF4444' },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  primaryButton: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  switchLink: { alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#2563EB', fontWeight: '600' },
});
