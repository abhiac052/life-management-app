import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, radius, spacing, typography } from '../theme';

interface Props {
  label: string;
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  mode?: 'date' | 'time';
  placeholder?: string;
  minimumDate?: Date;
}

function toDate(v: string): Date {
  return v ? new Date(v) : new Date();
}

function formatDisplay(v: string, mode: 'date' | 'time'): string {
  if (!v) return '';
  if (mode === 'time') return v;
  return new Date(v).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DatePickerField({ label, value, onChange, mode = 'date', placeholder, minimumDate }: Props) {
  const [show, setShow] = useState(false);

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (!selected) return;
    if (mode === 'date') {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    } else {
      const h = String(selected.getHours()).padStart(2, '0');
      const min = String(selected.getMinutes()).padStart(2, '0');
      onChange(`${h}:${min}`);
    }
    if (Platform.OS === 'ios') setShow(false);
  };

  const displayValue = formatDisplay(value, mode);

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.field} onPress={() => setShow(true)} activeOpacity={0.7}>
        <Text style={[styles.fieldText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder || (mode === 'date' ? 'Select date' : 'Select time')}
        </Text>
        <Text style={styles.icon}>{mode === 'date' ? '📅' : '🕐'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={toDate(value)}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
  field: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
  },
  fieldText: { ...typography.body, color: colors.text },
  placeholder: { color: colors.textDisabled },
  icon: { fontSize: 16 },
});
