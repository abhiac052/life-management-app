import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../app/navigation/types';
import { useRegister } from '../hooks/useAuth';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius } from '../../../shared/theme';

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'One uppercase letter')
    .regex(/[a-z]/, 'One lowercase letter')
    .regex(/[0-9]/, 'One number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;
type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'> };

const FIELDS: { name: keyof FormData; label: string; placeholder: string; icon: string; secure?: boolean; keyboard?: 'email-address' | 'default'; capitalize?: 'none' | 'words' }[] = [
  { name: 'name', label: 'Full Name', placeholder: 'John Doe', icon: 'account-outline', capitalize: 'words' },
  { name: 'email', label: 'Email', placeholder: 'your@email.com', icon: 'email-outline', keyboard: 'email-address' },
  { name: 'password', label: 'Password', placeholder: '••••••••', icon: 'lock-outline', secure: true },
  { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', icon: 'lock-check-outline', secure: true },
];

export default function RegisterScreen({ navigation }: Props) {
  const { register, loading, error } = useRegister();
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => { await register(data.name, data.email, data.password); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Icon name="account-plus-outline" size={26} color={colors.primary} />
            </View>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Start managing your life better</Text>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {FIELDS.map((f) => (
            <Controller
              key={f.name}
              control={control}
              name={f.name}
              render={({ field: { onChange, value } }) => (
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>{f.label}</Text>
                  <View style={[styles.inputRow, errors[f.name] && styles.inputRowError]}>
                    <Icon name={f.icon} size={18} color={errors[f.name] ? colors.error : colors.textDisabled} />
                    <TextInput
                      style={styles.input}
                      placeholder={f.placeholder}
                      placeholderTextColor={colors.textDisabled}
                      keyboardType={f.keyboard ?? 'default'}
                      autoCapitalize={f.capitalize ?? 'none'}
                      secureTextEntry={f.secure && !showPasswords[f.name]}
                      value={value}
                      onChangeText={onChange}
                    />
                    {f.secure && (
                      <TouchableOpacity onPress={() => setShowPasswords((p) => ({ ...p, [f.name]: !p[f.name] }))}>
                        <Icon name={showPasswords[f.name] ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textDisabled} />
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors[f.name] && <Text style={styles.fieldError}>{errors[f.name]?.message}</Text>}
                </View>
              )}
            />
          ))}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={() => { void handleSubmit(onSubmit)(); }}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <>
                  <Text style={styles.submitBtnText}>Create Account</Text>
                  <Icon name="arrow-right" size={18} color={colors.white} />
                </>
            }
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.switchLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  header: { marginBottom: spacing.xl },
  iconBadge: {
    width: 56, height: 56, borderRadius: radius.lg,
    backgroundColor: colors.primaryGlow, borderWidth: 1, borderColor: colors.primary + '40',
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.errorLight, borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.md,
    borderWidth: 1, borderColor: colors.error + '30',
  },
  errorText: { ...typography.bodySmall, color: colors.error, flex: 1 },
  fieldGroup: { marginBottom: spacing.md },
  fieldLabel: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  inputRowError: { borderColor: colors.error + '60' },
  input: { flex: 1, ...typography.body, color: colors.text, padding: 0 },
  fieldError: { ...typography.caption, color: colors.error, marginTop: spacing.xs },
  submitBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: 18, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xl,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { ...typography.button, color: colors.white, fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center' },
  switchText: { ...typography.body, color: colors.textSecondary },
  switchLink: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
