import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DocumentPicker, { DocumentPickerResponse, types } from 'react-native-document-picker';
import { colors, radius, spacing, typography } from '../theme';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

interface Props {
  label: string;
  file: PickedFile | null;
  onChange: (f: PickedFile | null) => void;
  allowedTypes?: string[];
}

export function FilePicker({ label, file, onChange, allowedTypes = [types.pdf, types.images] }: Props) {
  const pick = async () => {
    try {
      const result: DocumentPickerResponse[] = await DocumentPicker.pick({ type: allowedTypes, allowMultiSelection: false });
      const picked = result[0];
      if (picked) {
        onChange({ uri: picked.uri, name: picked.name ?? 'file', type: picked.type ?? 'application/octet-stream' });
      }
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Alert.alert('Error', 'Could not open file picker');
      }
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.field, file && styles.fieldFilled]} onPress={pick} activeOpacity={0.7}>
        <Text style={[styles.fieldText, !file && styles.placeholder]} numberOfLines={1}>
          {file ? file.name : 'Tap to select file'}
        </Text>
        <Text style={styles.icon}>📎</Text>
      </TouchableOpacity>
      {file && (
        <TouchableOpacity onPress={() => onChange(null)}>
          <Text style={styles.clear}>Remove file</Text>
        </TouchableOpacity>
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
  fieldFilled: { borderColor: colors.primary },
  fieldText: { ...typography.body, color: colors.text, flex: 1, marginRight: spacing.xs },
  placeholder: { color: colors.textDisabled },
  icon: { fontSize: 16 },
  clear: { ...typography.label, color: colors.error, marginTop: spacing.xs },
});
