import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { spacing } from '../../shared/theme';
import { Icon } from '../../shared/components/Icon';
import type { AppColors } from '../../shared/theme';

export const makeStackScreenOptions = (navigation: any, colors: AppColors): NativeStackNavigationOptions => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: colors.text,
  },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerBackVisible: false,
  contentStyle: { backgroundColor: colors.background },
  headerLeft: ({ canGoBack }) =>
    canGoBack ? (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.backBtn, { backgroundColor: colors.primaryGlow }]}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-left" size={20} color={colors.primary} />
      </TouchableOpacity>
    ) : null,
});

// Keep old export name working for stacks that haven't migrated
export const stackScreenOptions = (navigation: any): NativeStackNavigationOptions =>
  makeStackScreenOptions(navigation, {
    surface: '#FFFFFF', text: '#1A1A2E', primary: '#E8441A',
    primaryGlow: 'rgba(232,68,26,0.10)', background: '#F7F7F8',
  } as AppColors);

const styles = StyleSheet.create({
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: Platform.OS === 'ios' ? 0 : spacing.xs,
  },
});
